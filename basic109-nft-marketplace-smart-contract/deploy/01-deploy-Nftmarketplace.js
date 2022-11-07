const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        log: true,
        args: [],
    })
    log("---------------------------------------------------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying.....")
        await verify(nftMarketplace.address, [])
        log("---------------------------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "nft-marketplace"]
