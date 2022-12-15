import { useMoralis } from "react-moralis"
import { useQuery, gql, useLazyQuery } from "@apollo/client"
import NftBox from "../components/NftBox"
import networkMapping from "../constants/networkMapping.json"
import GET_ACTIVE_ITEMS from "../constants/subgraphQuery"
import { useEffect, useState } from "react"

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()
    const chainIdString = chainId ? parseInt(chainId).toString() : "5"
    const marketplaceAddress = networkMapping[chainIdString].NftMarketplace[0]
    // const [listedNfts, setListedNfts] = useState("")
    const { data, loading, refetch } = useQuery(GET_ACTIVE_ITEMS)

    // const [listedNfts, setListedNfts] = useState()

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl"> Recently Listed</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    loading || !data ? (
                        <div>Loading...</div>
                    ) : (
                        data.activeItems.map((nft) => {
                            const { nftAddress, price, seller, tokenId } = nft
                            return (
                                <div>
                                    <NftBox
                                        refetch={refetch}
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
