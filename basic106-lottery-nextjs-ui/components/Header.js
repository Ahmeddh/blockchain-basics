import { ConnectButton } from "web3uikit"

const Header = () => {
    return (
        <div>
            <span>Decentralized Lottery</span>
            <ConnectButton moralisAuth={false} />
        </div>
    )
}

export default Header
