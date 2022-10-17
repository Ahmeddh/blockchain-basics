const networkConfig = {
  80001: {
    name: "maticmum",
    ethUsdPricefeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
  },
  420: {
    name: "optimism_goreli",
    ethUsdPricefeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
}

const devChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 3000 * 1e8

module.exports = {
  networkConfig,
  devChains,
  DECIMALS,
  INITIAL_ANSWER,
}
