import { useMoralis, useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ethers, network } from "ethers"
import { Bell, useNotification } from "web3uikit"

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numOfPlayers, setNumOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        params: {},
        functionName: "getEntranceFee",
    })

    const { runContractFunction: getNumberOfPlayer } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        params: {},
        functionName: "getNumberOfPlayer",
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        params: {},
        functionName: "getRecentWinner",
    })

    const updateUI = async () => {
        const entranceFeeFromCall = await getEntranceFee()
        const numberOfPlayerFromCall = await getNumberOfPlayer()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumOfPlayers(numberOfPlayerFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
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

    const handleSuccess = async (tx) => {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = () => {
        dispatch({
            message: "Transaction Complete",
            type: "info",
            title: "Tx Notification",
            position: "topR",
            icon: "bell", //TODO: in the latest version of web3ui, find the alternative for icons
        })
    }

    return (
        <div>
            {raffleAddress ? (
                <>
                    <button
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (e) => {
                                    console.log(e)
                                },
                            })
                        }}
                    >
                        Enter Raffle
                    </button>
                    <div>Entrance Fee is {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <br />
                    <div>Number of Players is {numOfPlayers.toString()}</div>
                    <br />
                    <div>Recent winner is {recentWinner.toString()}</div>
                </>
            ) : (
                <div>There is no contract address detected!</div>
            )}
        </div>
    )
}
export default LotteryEntrance
