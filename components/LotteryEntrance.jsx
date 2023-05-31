import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled, web3 } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayer, setNumPlayer] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })
    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
            listenFroWinnerToBePicked()
        }
    }, [isWeb3Enabled])

    async function listenFroWinnerToBePicked() {
        const lottery = new ethers.Contract(raffleAddress, abi, web3)
        console.log("Waiting for a winner...")
        await new Promise((resolve, reject) => {
            lottery.on("WinnerPicked", async () => {
                console.log("We got a winner!")
                try {
                    await updateUI()
                    resolve()
                } catch (error) {
                    console.log(error)
                    reject(error)
                }
            })
        })
    }

    async function updateUI() {
        if (isWeb3Enabled) {
            let entranceFeeFromCall = (await getEntranceFee()).toString()
            const numPlayerFromCall = (await getNumberOfPlayers()).toString()
            const recentWinnerFromCall = await getRecentWinner()
            setEntranceFee(entranceFeeFromCall)
            setNumPlayer(numPlayerFromCall)
            setRecentWinner(recentWinnerFromCall)
        }
    }

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification()
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>

            {raffleAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    <p>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</p>
                    <p>Number of players: {numPlayer}</p>
                    <p>Number of players: {recentWinner}</p>
                </>
            ) : (
                <p>No Raffle Address Detected.</p>
            )}
            <p>Powered by: MonsterPi13</p>
        </div>
    )
}
