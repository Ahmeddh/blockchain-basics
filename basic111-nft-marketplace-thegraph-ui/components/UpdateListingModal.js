import { useEffect, useState } from "react"
import { Modal, Input, useNotification } from "web3uikit"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    marketplaceAddress,
    isVisible,
    onClose,
    refetch,
}) {
    const [priceToUpdateListinWith, setPriceToUpdateListinWith] = useState(0)
    const [refreshDataNeeded, setRefreshDataNeeded] = useState(false)
    const dispatch = useNotification()

    const handleUpdateListingSuccess = async (tx) => {
        dispatch({
            type: "warning",
            title: "Confirming... ",
            message: "Pending: Waiting for Tx to confirm",
            position: "topR",
        })
        onClose && onClose()
        await tx.wait(2)
        refetch()
        dispatch({
            type: "success",
            message: " Listing updated!",
            title: "Listing Update - Please refresh",
            position: "topR",
        })
        setPriceToUpdateListinWith("0")
    }
    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            _nftAddress: nftAddress,
            _tokenId: tokenId,
            _price: ethers.utils.parseEther(priceToUpdateListinWith || "0"),
        }, //[nftAddress, tokenId, priceToUpdateListinWith],
    })
    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() =>
                updateListing({
                    onError: (error) => console.log(error),
                    onSuccess: handleUpdateListingSuccess,
                })
            }
        >
            <Input
                label="Update listing price in ETH"
                name="New listing price"
                type="number"
                onChange={(event) => {
                    setPriceToUpdateListinWith(event.target.value)
                }}
            />
        </Modal>
    )
}
