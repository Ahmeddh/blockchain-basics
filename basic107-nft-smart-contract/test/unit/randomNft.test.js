const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomNft Unit Tests", () => {
          let deployer, randomNft, vrfCoordinatorV2Mock
          beforeEach(async () => {
              await deployments.fixture(["mocks", "all"])
              deployer = (await getNamedAccounts()).deployer
              randomNft = await ethers.getContract("RandomNft", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
          })
          describe("requestNft", () => {
              it("fail if no ETH sent as mint fee", async () => {
                  //RandomNft__NotEnoughEthSent
                  await expect(randomNft.requestNft()).to.be.revertedWith(
                      "RandomNft__NotEnoughEthSent"
                  )
              })
              it("fail if the ETH sent is less than 0.02 the mint fee", async () => {
                  //RandomNft__NotEnoughEthSent
                  const fee = await randomNft.getMintPrice()
                  await expect(
                      randomNft.requestNft({ value: fee.sub(ethers.utils.parseEther("0.01")) })
                  ).to.be.revertedWith("RandomNft__NotEnoughEthSent")
              })
              it("map requestId to address sender", async () => {
                  const fee = await randomNft.getMintPrice()
                  const tx = await randomNft.requestNft({ value: fee })
                  const txResponse = await tx.wait(1)
                  const requestId = txResponse.events[1].args.requestId
                  const ownerFromContract = await randomNft.getOwnerByRequestId(requestId)
                  assert.equal(deployer, ownerFromContract.toString())
              })
          })
          describe("fulfillRandomWords", () => {
              beforeEach(async () => {
                  await deployments.fixture(["mocks", "all"])
                  deployer = (await getNamedAccounts()).deployer
                  randomNft = await ethers.getContract("RandomNft", deployer)
                  vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              })
              it("mints NFT after random number is returned", async () => {
                  await new Promise(async (resolve, reject) => {
                      //request NFT
                      randomNft.once("NftMinted", async () => {
                          try {
                              const tokenCounter = await randomNft.getTokenCounter()
                              const tokenUri = await randomNft.getDogTokenUris(tokenCounter)
                              //   console.log(tokenCounter.toString())
                              assert.equal(tokenCounter.toString(), "2")
                              assert.equal(tokenUri.includes("ipfs://"), true)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(e)
                          }
                      })
                      const fee = await randomNft.getMintPrice()
                      const tx = await randomNft.requestNft({ value: fee })
                      const txResponse = await tx.wait(1)
                      const requestId = txResponse.events[1].args.requestId
                      await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomNft.address)
                      //call fullfillRandomWords from vrfCoordinatorV2 mock
                  })
              })
          })
          describe("getBreedFromModdedRng", () => {
              it("should return pug if moddedRng < 10", async function () {
                  const expectedValue = await randomNft.getBreedFromModdedRng(7)
                  assert.equal(0, expectedValue)
              })
              it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
                  const expectedValue = await randomNft.getBreedFromModdedRng(21)
                  assert.equal(1, expectedValue)
              })
              it("should return st. bernard if moddedRng is between 40 - 99", async function () {
                  const expectedValue = await randomNft.getBreedFromModdedRng(77)
                  assert.equal(2, expectedValue)
              })
              it("should revert if moddedRng > 99", async function () {
                  await expect(randomNft.getBreedFromModdedRng(100)).to.be.revertedWith(
                      "RandomNft__RangeOutOfBounds"
                  )
              })
          })
      })
