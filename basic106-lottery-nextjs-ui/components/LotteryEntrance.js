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

    //TODO: Add listener to WinnerPicked event
    // const listenToWinnerEvent = async () => {
    //     const provider = new ethers.providers.Web3Provider(window.ethereum)
    //     const contract = new ethers.Contract(raffleAddress, abi, provider)
    //     contract.on("WinnerPicked", (newWinner) => {
    //         setRecentWinner(newWinner)
    //     })
    // }

    // useEffect(() => {
    //     updateUI()
    // }, [recentWinner])

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

    const {
        runContractFunction: enterRaffle,
        isFetching,
        isLoading,
    } = useWeb3Contract({
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
        <div className="p-5">
            {raffleAddress ? (
                <div className="">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded ml-auto"
                        disabled={isLoading || isFetching}
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (e) => {
                                    console.log(e)
                                },
                            })
                        }}
                    >
                        {isFetching || isLoading ? (
                            <>
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                            </>
                        ) : (
                            <div>Enter Raffle</div>
                        )}{" "}
                    </button>
                    <div>
                        Entrance Fee is {ethers.utils.formatUnits(entranceFee, "ether")} ETH{" "}
                    </div>
                    <div>Number of Players is {numOfPlayers.toString()}</div>
                    <div>Recent Winner is {recentWinner}</div>
                </div>
            ) : (
                <div>There is no contract address detected!</div>
            )}
        </div>
    )
}
export default LotteryEntrance
