const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const fs = require("fs")
const { verify } = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let mockV3Aggregator, ethUsdPriceFeed, dynamicNft

    log("---------------------------------------------------")

    //SET CHAINLINK PRICE FEED
    if (developmentChains.includes(network.name)) {
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeed = mockV3Aggregator.address
    } else {
        ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const happySvg = await fs.readFileSync("../images/dynamicNft/happy.svg", { encoding: "utf8" })
    const sadSvg = await fs.readFileSync("../images/dynamicNft/sad.svg", { encoding: "utf8" })
    const arguments = [ethUsdPriceFeed, happySvg, sadSvg]

    dynamicNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: arguments,
    })
    log("---------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying.....")
        await verify(dynamicNft.address, arguments)
        log("---------------------------------------------------")
    }
}

module.exports.tags = ["all", "dynamicNft"]
