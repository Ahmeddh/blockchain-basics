const { networkConfig, devChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
require("dotenv").config()
const { verify } = require("../utils/verifiy")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeed
  //if chainID is x make pricefeed y
  if (devChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator")
    ethUsdPriceFeed = ethUsdAggregator.address
  } else {
    ethUsdPriceFeed = networkConfig[chainId]["ethUsdPricefeed"]
  }

  const args = [ethUsdPriceFeed]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })
  log(
    "-----------------------------------------------------------------------------"
  )

  if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying.....")

    await verify(fundMe.address, args)
  }
}
module.exports.tags = ["all", "fundMe"]
