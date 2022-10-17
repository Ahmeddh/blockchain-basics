const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("Fund Me contract", async () => {
  let fundMe
  let mockV3Aggregator
  let deployer
  let userAccount
  const sendValue = ethers.utils.parseEther("1")

  beforeEach(async function () {
    await deployments.fixture(["all"])
    deployer = (await getNamedAccounts()).deployer
    userAccount = (await getNamedAccounts()).user

    fundMe = await ethers.getContract("FundMe", deployer)
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
  })

  describe("Constructor", async () => {
    it("Save the owner of the contract on local variable", async () => {
      const fundMeOwner = await fundMe.owner()

      assert.equal(fundMeOwner, deployer)
    })

    it("Set the price feed aggregator correctly", async () => {
      const response = await fundMe.priceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })

  describe("Fund Me", async () => {
    it("Fail if you dont send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith(
        "Amount sent is not enough"
      )
    })

    it("Update the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue })
      const response = await fundMe.getAddressToAmountFunded(deployer)
      assert.equal(response.toString(), sendValue.toString())
    })

    it("Add funder to the array of funders", async () => {
      await fundMe.fund({ value: sendValue })
      const funderAddress = await fundMe.getFunder(0)

      assert.equal(deployer, funderAddress)
    })
  })

  describe("Withdraw", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue })
    })

    it("Withdraw ETH from a single funder", async () => {
      //Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

      //Act
      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

      //Assert
      assert.equal(endingFundMeBalance, 0)
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      )
    })

    it("Allow us to withdraw ETH when there is multiple funders", async () => {
      //Arrange
      const accounts = await ethers.getSigners()

      for (let i = 1; i < accounts.length; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i])
        await fundMeConnectedContract.fund({ value: sendValue })
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

      //Act
      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

      //Assert
      assert.equal(endingFundMeBalance, 0)
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      )

      //Make sure that funders are reset correctly
      await expect(fundMe.funders(0)).to.be.reverted

      for (let i = 1; i < accounts.length; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        )
      }
    })

    it("Only allow the owner to withdraw", async () => {
      const accounts = await ethers.getSigners()
      const attacker = accounts[2]
      const attackerConnectedContract = fundMe.connect(attacker)
      await attackerConnectedContract.fund({ value: sendValue })

      await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
        "Sender is not the owner"
      )
    })
  })
})
