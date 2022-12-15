import styles from "../styles/Home.module.css"
import { Form, useNotification } from "web3uikit"
import { ethers } from "ethers"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import nftAbi from "../constants/BasicNft.json"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"

export default function Home() {
    const { chainId } = useMoralis()
    const chainIdString = chainId ? parseInt(chainId).toString() : "5"
    const marketplaceAddress = networkMapping[chainIdString].NftMarketplace[0]
    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract({})

    const approveAndList = async (data) => {
        console.log("Approving.....")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseEther(data.data[2].inputResult).toString()

        const approveOption = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: { to: marketplaceAddress, tokenId: tokenId },
        }

        await runContractFunction({
            params: approveOption,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => console.log(error),
        })
    }

    const handleApproveSuccess = async (nftAddress, tokenId, price) => {
        //List the NFT on the marketplace
        const listingOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: { _nftAddress: nftAddress, _tokenId: tokenId, _price: price },
        }

        await runContractFunction({
            params: listingOptions,
            onSuccess: handleListingSuccess, //TODO: send notification
            onError: (error) => console.log(error),
        })
    }

    const handleListingSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            title: "Item Listed ",
            message: "Item Listed Successfully!",
            position: "topR",
        })
    }
    return (
        <div className={styles.container}>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "Nft Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token Id",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price in ETH",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "price",
                    },
                ]}
                title={"Hi from sell page"}
                id="Main Form"
            />
        </div>
    )
}
