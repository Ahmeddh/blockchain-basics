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
    console.log("--------------------------------------------------------")

    //Approve the NFT to be spended by the NftMarketplace contract
    console.log("Approving.....")
    const approveTx = await basicNft.approve(nftMarketplace.address, tokenId)
    await approveTx.wait(1)
    console.log("--------------------------------------------------------")

    //List the NFT
    console.log("Listing.....")
    const listTx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
    await listTx.wait(1)
    console.log("Listed succussfully!")
    console.log("--------------------------------------------------------")
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
