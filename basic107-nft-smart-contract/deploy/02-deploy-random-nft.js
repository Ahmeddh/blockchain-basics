const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadFilesToPinata")

const imagesLocation = "./images/randomNfts"
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cute Dog",
            value: 100,
        },
    ],
}
let tokenUris = [
    "ipfs://QmUqq92bn3baAmM1tiDxbdQWX1kYvmMkKLT543RYc9wC8N",
    "ipfs://QmX3yoGyzyRZUz2LUcwKfCGhZ6HEs5jtjm3yujyYHiCxyB",
    "ipfs://QmURPrqLh5z6s3D2fBc76no9uKFDu4qbnkVitNhe3mwmtP",
]
module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("---------------------------------------------------")
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUri()
    }
    const VRF_FUND_AMOUNT = ethers.utils.parseEther("10")
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events[0].args.subId //SubscriptionCreated
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    // const vrfCoordinatorV2=
    const arguments = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["callbackGasLimit"],
        tokenUris,
        networkConfig[chainId]["mintFee"],
    ]
    const randomNft = await deploy("RandomNft", {
        from: deployer,
        args: arguments,
        log: true,
    })
    if (developmentChains.includes(network.name)) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomNft.address)
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying.....")
        await verify(randomNft.address, arguments)
        log("---------------------------------------------------")
    }
}

async function handleTokenUri() {
    tokenUris = []
    //store images to IPFS
    //store metadata to IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponsesIndex in imageUploadResponses) {
        //Create image metadata
        let tokenUrisMetadata = { ...metadataTemplate }
        tokenUrisMetadata.name = files[imageUploadResponsesIndex].replace(".png", "")
        tokenUrisMetadata.description = `An adorable ${tokenUrisMetadata.name}`
        tokenUrisMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponsesIndex].IpfsHash}`

        //Store image metadata to IPFS
        const metadataResponse = await storeTokenUriMetadata(tokenUrisMetadata)
        console.log(`Uploading ${tokenUrisMetadata.name}`)
        tokenUris.push(`ipfs://${metadataResponse.IpfsHash}`)
    }
    console.log("Token URI uploaded, they are")
    console.log(tokenUris)

    return tokenUris
}
module.exports.tags = ["all", "random", "main"]
