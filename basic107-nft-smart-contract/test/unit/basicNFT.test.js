const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT Unit Tests", () => {
          let basicNFT, deployer
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              basicNFT = await ethers.getContract("BasicNFT", deployer)
          })

          describe("Constructor", () => {
              it("Token counter initialized successfully", async () => {
                  const tokenCounter = await basicNFT.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "0")
              })
          })
          describe("mintNFT", () => {
              it("Can mint NFT succesfully and increase token counter", async () => {
                  const tx = await basicNFT.mintNFT()
                  await tx.wait(1)
                  const tokenCounter = await basicNFT.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")
              })
          })
      })
