const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { devChains, networkConfig } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", () => {
      let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, interval, deployer
      const chainId = network.config.chainId
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        raffle = await ethers.getContract("Raffle", deployer)
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        raffleEntranceFee = await raffle.getEntranceFee()
        interval = await raffle.getInterval()
      })

      describe("Constructor", () => {
        it("Initialize raffle correctly", async () => {
          const raffleState = await raffle.getRaffleState()

          assert.equal(interval.toString(), networkConfig[chainId]["interval"])
          assert.equal(raffleState.toString(), "0")
        })
      })

      describe("EnterRaffle", () => {
        it("Revert when you dont pay enough", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughETHEntered")
        })
        it("Record player when they enter raffle", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          const playerFromContract = await raffle.getPlayer(0)

          assert.equal(playerFromContract, deployer)
        })
        it("Emit event on raffle enter", async () => {
          expect(await raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
            raffle,
            "RaffleEntered"
          )
        })
        it("Doesnt allow entrance when the contract is calculating", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.send("evm_mine", [])
          await raffle.performUpkeep([])
          await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith(
            "Raffle_NotOpen"
          )
        })
      })
      describe("CheckUpkeep", () => {
        it("Returns false if people didnt send any ETH", async () => {
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.send("evm_mine", [])
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })
        it("Returns false if raffle isnt open", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.send("evm_mine", [])
          await raffle.performUpkeep([])
          const raffleState = await raffle.getRaffleState()
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
          assert.equal(raffleState.toString(), "1")
        })
        it("Returns false if enough time hasn't passed", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() - 5])
          await network.provider.send("evm_mine", [])
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
          assert(!upkeepNeeded)
        })
        it("Returns true if enough time has passed, has players, eth, and is open", async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.request({ method: "evm_mine", params: [] })
          const { upkeepNeeeded } = await raffle.callStatic.checkUpkeep([])
          assert(upkeepNeeeded)
        })
      })

      describe("fullfillRandomWords", () => {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee })
          await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
          await network.provider.send("evm_mine", [])
        })
        it("It can only be called after perform", async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
          ).to.be.revertedWith("nonexistent request")
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
          ).to.be.revertedWith("nonexistent request")
        })
        it("Picks the winner, reset the lottery, and send the money", async () => {
          //Pick the winner
          const accounts = await ethers.getSigners()
          const additionalEntrance = 3
          const startingIndex = 1
          for (let i = startingIndex; i < additionalEntrance + startingIndex; i++) {
            const accountConnectedRaffle = raffle.connect(accounts[i])
            await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee })
          }
          raffle.connect(deployer)
          const startingTimeStamp = await raffle.getLatestTimestamp()
          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("Found the event")
              try {
                const raffleWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const numPlayers = await raffle.getNumberOfPlayer()
                const endingTimestamp = await raffle.getLatestTimestamp()
                const winnerEndingBalance = await accounts[1].getBalance()

                assert.equal(numPlayers.toString(), "0")
                assert.equal(raffleState.toString(), "0")
                assert(endingTimestamp > startingTimeStamp)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(
                    raffleEntranceFee.mul(additionalEntrance).add(raffleEntranceFee).toString()
                  )
                )
              } catch (e) {
                reject(e)
              }
              resolve()
            })
            //performing upkeep and getting the winner
            const tx = await raffle.performUpkeep([])
            const txReciept = await tx.wait(1)
            const winnerStartingBalance = await accounts[1].getBalance()
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReciept.events[1].args.requestId,
              raffle.address
            )
          })
        })
      })
    })
