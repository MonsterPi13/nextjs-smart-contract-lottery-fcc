import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, isWeb3EnableLoading, Moralis, deactivateWeb3 } =
        useMoralis()
    useEffect(() => {
        if (isWeb3Enabled) return

        if (window.localStorage.getItem("connected") === "injected") {
            enableWeb3()
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged(async (account) => {
            console.log(`Account changed to ${account}`)
            if (account === null) {
                window.localStorage.removeItem("connected")
                await deactivateWeb3()
            }
        })
    }, [])
    // no dependency array: run anytime something re-renders
    // CAREFUL with this!! Because it can go circular render
    // blank dependency array run once on load
    // dependencies in the array, run anytime something in the dependencies changed

    return (
        <div>
            {account ? (
                <div>
                    connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    disabled={isWeb3EnableLoading}
                    onClick={async () => {
                        await enableWeb3()

                        window.localStorage.setItem("connected", "injected")
                    }}
                >
                    connect
                </button>
            )}
        </div>
    )
}
