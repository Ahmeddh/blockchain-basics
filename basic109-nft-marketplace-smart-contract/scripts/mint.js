const { ethers } = require("hardhat")

async function mintAndList() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const PRICE = ethers.utils.parseEther("0.01")

    //Mint NFT from BasicNft contract
    console.log("Minting.....")
    const mintTx = await basicNft.mintNFT()
    const mintTxResponse = await mintTx.wait(1)
    const tokenId = await mintTxResponse.events[0].args.tokenId
    console.log(`Got token Id: ${tokenId}`)
    console.log(`Nft Address: ${basicNft.address}`)
    console.log("--------------------------------------------------------")
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
