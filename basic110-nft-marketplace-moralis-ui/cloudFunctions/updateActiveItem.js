// const Moralis = require("moralis").default
const Parse = require("parse/react-native.js")
require("dotenv").config()

const contractAddresses = require("../constants/networkMapping.json")
let chainId = process.env.CHAIN_ID || 5
const address = contractAddresses[chainId]["NftMarketplace"][0]

async function updateActiveItem() {
    await Parse.initialize({
        apiKey: process.env.NEXT_PUBLIC_API_KEY,
        serverUrl: process.env.NEXT_PUBLIC_SERVER_URL,
        appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
        webhook: process.env.NEXT_PUBLIC_WEB_HOOK_URL,
        masterKey: process.env.NEXT_PUBLIC_MASTER_KEY,
    })

    await Parse.Cloud.afterSave("ItemlistedLogs", async (request) => {
        const confirmed = request.object.get("confirmed")
        const logger = Parse.Cloud.getLogger()
        if (confirmed) {
            // Get the data from the request
            Parse.Cloud.useMasterKey()
            const marketplaceAddress = request.params.marketplaceAddress
            const seller = request.params.seller
            const price = request.params.price
            const tokenId = request.params.tokenId

            // Use the data to update the 'ActiveListing' document
            const activeListing = new Parse.Object.extend("ActiveListing")
            activeListing.set("marketplaceAddress", marketplaceAddress)
            activeListing.set("seller", seller)
            activeListing.set("price", price)
            activeListing.set("tokenId", tokenId)

            //Log information to the logger
            logger.info(
                `Adding address: ${request.object.get(
                    "address"
                )} ,  TokenId: request.object.get('tokenId')`
            )
            logger.info("Saving.......")

            // Save the updated 'ActiveListing' document to the database
            await activeListing.save()

            // await activeItem.save(null, token);
        }
    })
}

updateActiveItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
