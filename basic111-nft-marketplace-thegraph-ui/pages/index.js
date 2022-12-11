import { useMoralisQuery, useMoralis } from "react-moralis"
import { useQuery, gql } from "@apollo/client"
import NftBox from "../components/NftBox"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "../constants/subgraphQuery"
import { useState } from "react"
export default function Home() {
    // const { data: listedNft, isFetching: fetchingNfts } = useMoralisQuery(
    //     "ItemlistedLogs", //will change this to ActiveItems in the graph
    //     (query) => query.limit(10).descending("tokenId")
    // )
    const { isWeb3Enabled, chainId } = useMoralis()
    const chainIdString = chainId ? parseInt(chainId).toString() : "5"
    const marketplaceAddress = networkMapping[chainIdString].NftMarketplace[0]
    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS)
    // const [listedNfts, setListedNfts] = useState(data)
    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl"> Recently Listed</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    loading || !listedNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            console.log(nft)
                            const { nftAddress, price, seller, tokenId } = nft
                            return (
                                <div>
                                    <NftBox
                                        nftAddress={nftAddress}
                                        marketplaceAddress={marketplaceAddress}
                                        price={price}
                                        seller={seller}
                                        tokenId={tokenId}
                                        key={`${nftAddress}${tokenId}`}
                                    />
                                </div>
                            )
                        })
                    )
                ) : (
                    <div>WEB3 currently not enabled</div>
                )}
            </div>
        </div>
    )
}
