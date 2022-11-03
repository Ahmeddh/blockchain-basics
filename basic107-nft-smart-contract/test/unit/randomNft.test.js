const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomNft Unit Tests", () => {
          let deployer, randomNft, mockV3Aggregator
          beforeEach(async () => {
              await deployments.fixture(["mocks", "random"])
              deployer = (await getNamedAccounts()).deployer
              randomNft = await ethers.getContract("RandomNft", deployer)
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
          })
          describe("fulfillRandomWords", () => {
              it("tests are workinng", async () => {
                  assert(true)
              })
          })
      })
