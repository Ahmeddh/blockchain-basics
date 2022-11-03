const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let tx, txResponse, vrfCoordinatorV2Mock, requestId
    //Mint a basic NFT

    const basicNft = await ethers.getContract("BasicNft", deployer)
    tx = await basicNft.mintNFT()
    await tx.wait(1)
    console.log("Minted an NFT from Basic NFT at index 0 and tokenUri @")
    console.log(await basicNft.tokenURI(0))
    console.log("---------------------------------------------------")

    //Mint a random IPFS NFT

    const randomNft = await ethers.getContract("RandomNft", deployer)
    const fee = await randomNft.getMintPrice()
    tx = await randomNft.requestNft({ value: fee })
    txResponse = await tx.wait(1)
    await new Promise(async (resolve, reject) => {
        randomNft.once("RequestRandomWord", async () => {
            try {
                console.log("RandomNft - RequestRandomWord event has been emitted")
                requestId = txResponse.events[1].args.requestId
                resolve()
            } catch (error) {
                console.log(error)
                reject(error)
            }
        })
    })
    //Call CHAINLINK VRF fulfillRandomWords
    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
    } else {
        vrfCoordinatorV2Mock = networkConfig[chainId]["vrfCoordinatorV2"]
    }
    tx = await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomNft.address)
    await tx.wait(1)
    await new Promise(async (resolve, reject) => {
        randomNft.once("NftMinted", async () => {
            try {
                console.log("RandomNft - NftMinted has been emitted")
                console.log(
                    "Minted an NFT from RandomNft contract and imaged has been saved to IPFS @"
                )
                console.log(await randomNft.getDogTokenUris(0))
                console.log("---------------------------------------------------")
                resolve()
            } catch (error) {
                console.log(error)
                reject(error)
            }
        })
    })

    //Mint Dynamic SVG NFT
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    tx = await dynamicSvgNft.mintNft(highValue)
    txResponse = await tx.wait(1)
    await new Promise(async (resolve, reject) => {
        dynamicSvgNft.once("NftMinted", async () => {
            try {
                //get tokenId
                console.log("DynamicNft - dynamic SVG NFT has been minted @ this Big SVG URL place")
                console.log(await dynamicSvgNft.tokenURI(txResponse.events[0].args.tokenId))
                console.log("---------------------------------------------------")
                resolve()
            } catch (error) {
                console.log(error)
                reject(error)
            }
        })
    })
}

module.exports.tags = ["all", "mintNFTs"]
