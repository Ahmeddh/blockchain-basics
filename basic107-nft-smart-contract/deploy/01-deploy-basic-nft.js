const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("---------------------------------------------------")
    const arguments = []
    const BasicNft = await deploy("BasicNft", {
        from: deployer,
        args: arguments,
        log: true,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying.....")
        await verify(BasicNft.address, arguments)
        log("---------------------------------------------------")
    }
}
module.exports.tags = ["all", "basic", "main"]
