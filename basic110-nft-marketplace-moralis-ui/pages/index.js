import { useMoralisQuery, useMoralis } from "react-moralis"
import NftBox from "../components/NftBox"
export default function Home() {
    const { data: listedNft, isFetching: fetchingNfts } = useMoralisQuery(
        "ItemlistedLogs", //will change this to ActiveItems in the graph
        (query) => query.limit(10).descending("tokenId")
    )

    const { isWeb3Enabled } = useMoralis()

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl"> Recently Listed</h1>
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    fetchingNfts ? (
                        <div>Loading...</div>
                    ) : (
                        listedNft.map((nft) => {
                            const { nftAddress, address, price, seller, tokenId } = nft.attributes
                            return (
                                <div>
                                    <NftBox
                                        nftAddress={nftAddress}
                                        marketplaceAddress={address}
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
