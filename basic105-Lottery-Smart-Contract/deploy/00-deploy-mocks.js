const { network, ethers } = require("hardhat")
const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const { devChains } = require("../helper-hardhat-config")
  const chainId = network.config.chainId

  const args = [BASE_FEE, GAS_PRICE_LINK]

  if (devChains.includes(network.name)) {
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: args,
      log: true,
    })
    log("Mock deployed!")
    log("-------------------------------------------------------------------")
  }
  //Deploy mock and get
}

module.exports.tags = ["all", "mocks"]
