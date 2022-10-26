import { useMoralis } from "react-moralis"
import { useEffect } from "react"

const ManualHeader = () => {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()
    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account has changed to ${account}`)
            if (account == null) {
                if (typeof window !== "undefined") {
                    window.localStorage.removeItem("connected")
                    deactivateWeb3()
                    console.log("Null account found")
                }
            }
        })
    }, [])
    return (
        <div>
            {account ? (
                <div>
                    Connected to {account.slice(0, 5)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async (e) => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected")
                            console.log("localstorage added")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}

export default ManualHeader
