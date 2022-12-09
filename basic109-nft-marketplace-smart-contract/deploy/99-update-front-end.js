const { ethers, network } = require("hardhat")
const fs = require("fs")
const frontEndContractFile = "../basic110-nft-marketplace-moralis-ui/constants/networkMapping.json"
const frontAbiLocation = "../basic110-nft-marketplace-moralis-ui/constants/"

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating Front-end....")
        await updateContractAddresses()
        await updateAbi()
    }
}

const updateAbi = async () => {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    fs.writeFileSync(
        `${frontAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )

    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(
        `${frontAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}

const updateContractAddresses = async () => {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractFile, "utf-8"))

    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }
    fs.writeFileSync(frontEndContractFile, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
