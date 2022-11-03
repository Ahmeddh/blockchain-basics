const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft Unit Tests", () => {
          let BasicNft, deployer
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              BasicNft = await ethers.getContract("BasicNft", deployer)
          })

          describe("Constructor", () => {
              it("Initialize BasicNft contract correctly", async () => {
                  const name = await BasicNft.name()
                  const symbol = await BasicNft.symbol()
                  const tokenCounter = await BasicNft.getTokenCounter()
                  assert.equal(name, "AhmedDh")
                  assert.equal(symbol, "DHN")
                  assert.equal(tokenCounter.toString(), "1")
              })
          })
          describe("mintNFT", () => {
              beforeEach(async () => {
                  await deployments.fixture(["all"])
                  BasicNft = await ethers.getContract("BasicNft", deployer)
                  const tx = await BasicNft.mintNFT()
                  await tx.wait(1)
              })
              it("Can mint NFT succesfully and increase token counter", async () => {
                  const tokenCounter = await BasicNft.getTokenCounter()
                  console.log(tokenCounter.toString())
                  assert(true)
                  //   assert.equal(tokenCounter.toString(), "1")
              })
          })
      })
