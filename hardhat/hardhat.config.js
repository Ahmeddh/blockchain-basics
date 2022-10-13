require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("./tasks/block-number")
require("hardhat-gas-reporter")
require("solidity-coverage")

const MATICMUM_RPC_URL= process.env.MATICMUM_RPC_URL
const PRIVATE_KEY= process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY
const OPT_GOERLI_RPC_URL=process.env.OPT_GOERLI_RPC_URL
const COIN_MARKETCAP_API_KEY = process.env.COIN_MARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork:"hardhat",
  networks:{
    maticmum:{
      url: MATICMUM_RPC_URL,
      accounts:[PRIVATE_KEY],
      chainId:80001
    },
    optimism_goreli:{
      url:OPT_GOERLI_RPC_URL,
      accounts:[PRIVATE_KEY],
      chainId:420
    },
    localhost:{
      url: "http://127.0.0.1:8545",
      chainId:31337,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter:{
    enabled:false,
    currency:"USD",
    noColors:true,
    coinmarketcap:COIN_MARKETCAP_API_KEY,
    token:"MATIC"
  },
  solidity: "0.8.17",
};
