const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")

describe("NftMarketplace Contract Unit Tests", () => {
    let nftMarketplace, deployer, basicNft, user, tokenId, tx, txResponse
    const PRICE = ethers.utils.parseEther("1")
    beforeEach(async () => {
        //Initialize accounts
        const accounts = await ethers.getSigners()
        user = accounts[1]
        deployer = accounts[0]
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
                nftMarketplace.listItem(basicNft.address, tokenId.toString(), PRICE)
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
            tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
            await tx.wait(1)
            await expect(
                nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
            ).to.be.revertedWith("NftMarketplace__AlreadyListed")
        })
        it("Can be listed and bought", async () => {
            tx = await basicNft.approve(nftMarketplace.address, tokenId)
            await tx.wait(1)
            tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
            await tx.wait(1)
            nftMarketplace = await nftMarketplace.connect(user)
            tx = await nftMarketplace.buyItem(basicNft.address, tokenId, { value: PRICE })
            await tx.wait(1)
            const newOwner = await basicNft.ownerOf(tokenId)
            const proceed = await nftMarketplace.getProceeds(deployer.address)
            assert(newOwner.toString() == user.address)
            assert(proceed.toString() == PRICE)
        })
    })
    describe("buyItem function", () => {
        it("Has to be listed to be bought", async () => {
            tx = await basicNft.approve(nftMarketplace.address, tokenId)
            await tx.wait(1)
            nftMarketplace = await nftMarketplace.connect(user)
            await expect(
                nftMarketplace.buyItem(basicNft.address, tokenId, { value: PRICE })
            ).to.be.revertedWith("NftMarketplace__NotListed")
        })
        it("Price has to match the listing price", async () => {
            //Approve NFT
            tx = await basicNft.approve(nftMarketplace.address, tokenId)
            await tx.wait(1)
            //List the NFT
            tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
            await tx.wait(1)
            //Try to buy it with price less than the listing price
            nftMarketplace = await nftMarketplace.connect(user)
            await expect(
                nftMarketplace.buyItem(basicNft.address, tokenId, { value: PRICE.sub(10) })
            ).to.be.revertedWith("NftMarketplace__PriceNotMet")
        })
    })
    describe("cancelListing function", () => {
        it("There has to be a listing to be cancelled", async () => {
            await expect(
                nftMarketplace.cancelListing(basicNft.address, tokenId)
            ).to.be.revertedWith("NftMarketplace__NotListed")
        })
        it("Only owner can cancel a listing", async () => {
            tx = await basicNft.approve(nftMarketplace.address, tokenId)
            await tx.wait(1)
            tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
            await tx.wait(1)
            nftMarketplace = await nftMarketplace.connect(user)
            await expect(
                nftMarketplace.cancelListing(basicNft.address, tokenId)
            ).to.be.revertedWith("NftMarketplace__NotTheNftOwner")
        })
        it("Can cancel listing and delete listing from mapping", async () => {
            tx = await basicNft.approve(nftMarketplace.address, tokenId)
            await tx.wait(1)
            tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
            await tx.wait(1)
            tx = await nftMarketplace.cancelListing(basicNft.address, tokenId)
            await tx.wait(1)
            const listing = await nftMarketplace.getListing(basicNft.address, tokenId)
            assert(listing.price == 0)
        })
    })
    describe("updateListing function", () => {
        it("There has to be a listing to be updated", async () => {
            await expect(
                nftMarketplace.updateListing(basicNft.address, tokenId, PRICE)
            ).to.be.revertedWith("NftMarketplace__NotListed")
        })
        it("Only owner can update a listing", async () => {
            tx = await basicNft.approve(nftMarketplace.address, tokenId)
            await tx.wait(1)
            tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
            await tx.wait(1)
            nftMarketplace = await nftMarketplace.connect(user)
            await expect(
                nftMarketplace.updateListing(basicNft.address, tokenId, PRICE)
            ).to.be.revertedWith("NftMarketplace__NotTheNftOwner")
        })
        it("Can can update the listing if the owner called updateListing and its listed already", async () => {
            tx = await basicNft.approve(nftMarketplace.address, tokenId)
            await tx.wait(1)
            tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
            await tx.wait(1)
            tx = await nftMarketplace.updateListing(basicNft.address, tokenId, PRICE.sub(1))
            await tx.wait(1)
            const listing = await nftMarketplace.getListing(basicNft.address, tokenId)
            assert(listing.price !== PRICE)
            assert.equal(listing.price.toString(), PRICE.sub(1))
        })
    })
    //withdrawProceed
    describe("withdrawProceed function", () => {
        beforeEach(async () => {
            tx = await basicNft.approve(nftMarketplace.address, tokenId)
            await tx.wait(1)
            tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
            await tx.wait(1)
        })
        it("Can't withdraw if there is no proceed", async () => {
            const proceeds = await nftMarketplace.getProceeds(deployer.address)
            await expect(nftMarketplace.withdrawProceed()).to.be.revertedWith(
                "NftMarketplace__NoProceedsForThisAddress"
            )
        })

        it("Can withdraw proceeds", async () => {
            nftMarketplace = await nftMarketplace.connect(user)
            tx = await nftMarketplace.buyItem(basicNft.address, tokenId, { value: PRICE })
            await tx.wait(1)
            nftMarketplace = await nftMarketplace.connect(deployer)
            const proceeds = await nftMarketplace.getProceeds(deployer.address)
            const balanceBeforeWithdraw = await deployer.getBalance()
            tx = await nftMarketplace.withdrawProceed()
            txResponse = await tx.wait(1)
            const balaceAfterWithdraw = await deployer.getBalance()
            const { gasUsed, effectiveGasPrice } = txResponse
            const gasCost = gasUsed.mul(effectiveGasPrice)
            assert(proceeds.toString() == PRICE)
            assert.equal(
                balaceAfterWithdraw.toString(),
                balanceBeforeWithdraw.add(PRICE).sub(gasCost)
            )
        })
    })
})
