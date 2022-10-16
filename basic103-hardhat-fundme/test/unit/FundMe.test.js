const { assert } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("Fund Me contract", (async) => {
  let fundMe
  let mockV3Aggregator
  let deployer

  beforeEach(async function () {
    await deployments.fixture(["all"])
    deployer = await getNamedAccounts().deployer

    fundMe = await ethers.getContract("FundMe", deployer)
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
  })

  describe("Constructor", async function () {
    it("Save the owner of the contract on local variable", async function () {
      const fundMeOwner = await fundMe.owner()

      assert.equal(fundMeOwner.address, deployer)
    })

    it("Set the price feed aggregator correctly", async function () {
      const response = await fundMe.priceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })
})
