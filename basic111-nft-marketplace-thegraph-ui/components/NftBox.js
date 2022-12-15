import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import nftAbi from "../constants/BasicNft.json"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"

const truncateString = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const separatorLength = separator.length
    const charsToShow = strLen - separatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
    )
}
export default function NftBox({
    nftAddress,
    marketplaceAddress,
    price,
    seller,
    tokenId,
    refetch,
}) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const dispatch = useNotification()
    const hideModal = () => setShowModal(false)

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: { tokenId: tokenId },
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        params: {
            _nftAddress: nftAddress,
            _tokenId: tokenId,
        },
        msgValue: price,
    })

    const updateUI = async () => {
        const tokenURI = await getTokenURI()
        console.log(`The tokenURI is ${tokenURI}`)
        if (tokenURI) {
            //Change from IPFS URI to HTTPS
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenUriResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenUriResponse.image
            setImageURI(imageURI)
            setTokenName(tokenUriResponse.name)
            setTokenDescription(tokenUriResponse.description)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwner = seller == account || seller == undefined
    const formattedSellerAddress = isOwner ? "You" : truncateString(seller || "", 15)
    const handleCardClick = () => {
        isOwner
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: handleBuyItemSuccess,
              })
    }
    const handleBuyItemSuccess = async (tx) => {
        dispatch({
            type: "warning",
            title: "Confirming... ",
            message: " Waiting for Tx to confirm",
            position: "topR",
        })
        await tx.wait(2)
        refetch()
        dispatch({
            type: "success",
            title: "Item bought",
            message: " Item bought",
            position: "topR",
        })
    }
    return (
        <div>
            <div>
                {imageURI ? (
                    <div className="p-3">
                        <UpdateListingModal
                            refetch={refetch}
                            isVisible={showModal}
                            marketplaceAddress={marketplaceAddress}
                            tokenId={tokenId}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by {formattedSellerAddress}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold">
                                        {ethers.utils.formatUnits(price, "ether")} ETH
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading.....</div>
                )}
            </div>
        </div>
    )
}
