const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft Unit Tests", () => {
          let basicNft, deployer
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["all"])
              basicNft = await ethers.getContract("BasicNft", deployer)
          })

          describe("Constructor", () => {
              it("Initialize BasicNft contract correctly", async () => {
                  const name = await basicNft.name()
                  const symbol = await basicNft.symbol()
                  const tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(name, "AhmedDh")
                  assert.equal(symbol, "DHN")
                  assert.equal(tokenCounter.toString(), "0")
              })
          })
          describe("Mint NFT", () => {
              let tx, txResponse
              beforeEach(async () => {
                  tx = await basicNft.mintNFT()
                  txResponse = await tx.wait(1)
              })
              it("Allows users to mint an NFT, and updates appropriately", async function () {
                  const tokenURI = await basicNft.tokenURI(0)
                  const tokenCounter = await basicNft.getTokenCounter()

                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(tokenURI, await basicNft.TOKEN_URI())
              })
              it("Show the correct balance and owner of an NFT", async function () {
                  tx = await basicNft.mintNFT()
                  txResponse = await tx.wait(1)
                  const deployerAddress = deployer.address
                  const deployerBalance = await basicNft.balanceOf(deployerAddress)
                  const tokenId = await txResponse.events[0].args.tokenId
                  const owner = await basicNft.ownerOf(tokenId)

                  assert.equal(deployerBalance.toString(), "2")
                  assert.equal(owner, deployerAddress)
              })
          })
      })
