const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imageFilePath) {
    const fullImagePath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fullImagePath)
    const responses = []
    console.log("Uploading to IPFS")
    for (fileIndex in files) {
        //read stream, then push to pinata
        const readableStreamForFile = fs.createReadStream(`${fullImagePath}/${files[fileIndex]}`)
        try {
            //do pinata stuff
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}
module.exports = {
    storeImages,
    storeTokenUriMetadata,
}
