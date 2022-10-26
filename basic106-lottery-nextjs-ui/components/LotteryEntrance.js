import { useMoralis, useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ethers, network } from "ethers"

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        params: {},
        functionName: "getEntranceFee",
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            const updateUI = async () => {
                const entranceFeeFromCall = (await getEntranceFee()).toString()
                setEntranceFee(entranceFeeFromCall)
            }
            updateUI()
        }
    }, [isWeb3Enabled])

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        params: {},
        functionName: "enterRaffle",
        msgValue: entranceFee,
    })
    return (
        <div>
            {raffleAddress ? (
                <>
                    <button
                        onClick={async () => {
                            await enterRaffle()
                        }}
                    >
                        Enter Raffle
                    </button>
                    <div>
                        Entrance Fee is {ethers.utils.formatUnits(entranceFee, "ether")} ETH{" "}
                    </div>
                </>
            ) : (
                <div>There is no contract address detected!</div>
            )}
        </div>
    )
}
export default LotteryEntrance
