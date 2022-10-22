const { assert, expect } = require("chai")
const { network, getNamedAccounts, ethers } = require("hardhat")
const { devChains, networkConfig } = require("../../helper-hardhat-config")

devChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
      let raffle, raffleEntranceFee, deployer

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        raffle = await ethers.getContract("Raffle", deployer)
        raffleEntranceFee = await raffle.getEntranceFee()
      })
      describe("fullfillRandomWords", function () {
        it("Work with live Chainlink Keeper and VRF V2, we get a random winner", async () => {
          const startingTimeStamp = await raffle.getLatestTimestamp()
          const accounts = await ethers.getSigners()

          console.log("Setting up listener")
          await new Promise(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              //get winner, check timestamp,compare balance,
              console.log("WinnerPicked event fired!")
              try {
                const raffleWinner = await raffle.getRecentWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimestamp = await raffle.getLatestTimestamp()
                //ToDo: Something wrong here check it
                // assert.equal(
                //   winnerEndingBalance.sub(gasCost).toString(),
                //   winnerStartingBalance.add(raffleEntranceFee).toString()
                // )
                assert.equal(raffleState.toString(), "0")
                await expect(raffle.getPlayer(0)).to.be.reverted
                assert.equal(raffleWinner.toString(), accounts[0].address)
                assert(endingTimestamp > startingTimeStamp)
                resolve()
              } catch (error) {
                console.log(error)
                reject(e)
              }
            })
            console.log("Entering Raffle...")
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee + 1 })
            const txReceipt = await tx.wait(1)
            console.log("Ok, time to wait...")
            const { gasUsed, effectiveGasPrice } = txReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const winnerStartingBalance = await accounts[0].getBalance()
          })
        })
      })
    })
