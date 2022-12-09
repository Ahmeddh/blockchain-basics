const Moralis = require("moralis").default

const { EvmChain } = require("@moralisweb3/common-evm-utils")
require("dotenv").config()

const contractAddresses = require("./constants/networkMapping.json")
let chainId = process.env.CHAIN_ID || 5
const address = contractAddresses[chainId]["NftMarketplace"][0]
const itemListedAbi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "seller",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "ItemListed",
        type: "event",
    },
] // valid abi of the event

const itemBoughtAbi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "buyer",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "price",
                type: "uint256",
            },
        ],
        name: "ItemBought",
        type: "event",
    },
]

const listingCancelledAbi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
            },
        ],
        name: "ListingCancelled",
        type: "event",
    },
]

const listingUpdatedAbi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "nftAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "oldPrice",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "updatedPrice",
                type: "uint256",
            },
        ],
        name: "ListingUpdated",
        type: "event",
    },
]

async function main() {
    await Moralis.start({
        apiKey: process.env.NEXT_PUBLIC_API_KEY,
        // serverUrl: process.env.NEXT_PUBLIC_SERVER_URL,
        // appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
    })
    //ItemListed
    await startStream(
        "Monitor ItemListed",
        "ItemListed",
        "ItemListed(address,address,uint256,uint256)",
        itemListedAbi
    )

    //ItemBought
    await startStream(
        "Monitor ItemBought",
        "ItemBought",
        "ItemBought(address,address,uint256,uint256)",
        itemBoughtAbi
    )

    //ListingUpdated
    await startStream(
        "Monitor ListingUpdated",
        "ListingUpdated",
        "ListingUpdated(address,uint256,address,uint256,uint256)",
        listingUpdatedAbi
    )

    //ListingCancelled
    await startStream(
        "Monitor ListingCancelled",
        "ListingCancelled",
        "ListingCancelled(address,uint256,address)",
        listingCancelledAbi
    )
}

async function startStream(_desc, _tag, _topic, _abi) {
    const options = {
        chains: [EvmChain.GOERLI], // list of blockchains to monitor
        description: _desc, // your description
        tag: _tag, // give it a tag
        includeContractLogs: true,
        webhookUrl: process.env.NEXT_PUBLIC_WEB_HOOK_URL, // webhook url to receive events,
        abi: _abi,
        topic0: _topic,
        advancedOptions: [
            {
                topic0: _topic,
            },
        ],
    }

    const newStream = await Moralis.Streams.add(options)
    const { id } = newStream.toJSON() // { id: 'YOUR_STREAM_ID', ...newStream }

    // Now we attach bobs address to the stream

    await Moralis.Streams.addAddress({ address, id })
    console.log(`Stream created for ${_desc}`)
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
