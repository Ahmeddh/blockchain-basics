require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const MATICMUM_RPC_URL = process.env.MATICMUM_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const OPT_GOERLI_RPC_URL = process.env.OPT_GOERLI_RPC_URL
const COIN_MARKETCAP_API_KEY = process.env.COIN_MARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    maticmum: {
      url: MATICMUM_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      blockConfirmation: 6,
    },
    optimism_goreli: {
      url: OPT_GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 420,
      blockConfirmation: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COIN_MARKETCAP_API_KEY,
    token: "MATIC",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.4.6" }],
  },
  mocha: {
    timeout: 200000, //200 seconds max
  },
}
