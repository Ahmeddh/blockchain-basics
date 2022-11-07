const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")

describe("NftMarketplace Contract Unit Tests", () => {
    let nftMarketplace, deployer, basicNft, user, tokenId, tx, txResponse, price
    beforeEach(async () => {
        price = ethers.utils.parseEther("1")
        //Initialize accounts
        user = (await getNamedAccounts()).user
        deployer = (await getNamedAccounts()).deployer
        //deploy contracts
        await deployments.fixture(["all"])
        //get contracts
        nftMarketplace = await ethers.getContract("NftMarketplace", deployer)
        basicNft = await ethers.getContract("BasicNft", deployer)
        //Mint an NFT and approve the marketplace to spend it
        tx = await basicNft.mintNFT()
        txResponse = await tx.wait(1)
        tokenId = txResponse.events[0].args.tokenId
        await basicNft.approve(nftMarketplace.address, tokenId)
    })
    describe("listItem function", () => {
        it("Only NFT Owner can list NFT", async () => {
            nftMarketplace = await ethers.getContract("NftMarketplace", user)
            await expect(
                nftMarketplace.listItem(basicNft.address, tokenId.toString(), price)
            ).to.be.revertedWith("NftMarketplace__NotTheNftOwner")
            assert(true)
        })

        it("Listing price must be greater than 0", async () => {
            await expect(nftMarketplace.listItem(basicNft.address, tokenId, 0)).to.be.revertedWith(
                "NftMarketplace__PriceMustBeAboveZero"
            )
        })

        it("Listed NFTs can't be listed again", async () => {
            tx = await basicNft.approve(nftMarketplace.address, tokenId)
            await tx.wait(1)
            tx = await nftMarketplace.listItem(basicNft.address, tokenId, price)
            await tx.wait(1)
            await expect(
                nftMarketplace.listItem(basicNft.address, tokenId, price)
            ).to.be.revertedWith("NftMarketplace__AlreadyListed")
        })
    })
})
