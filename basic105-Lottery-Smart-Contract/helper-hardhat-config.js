const { ethers } = require("hardhat")

const networkConfig = {
  80001: {
    name: "maticmum",
    vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    subscriptionId: "5080",
    callbackGasLimit: "1000000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    callbackGasLimit: "5000000",
    interval: "30",
  },
  5: {
    name: "goerli",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    subscriptionId: "5080",
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 30 gwei
    entranceFee: 1e17, // 0.1 ETH
    callbackGasLimit: "500000", // 500,000 gas
    interval: "30",
  },
}

const devChains = ["hardhat", "localhost"]

module.exports = {
  networkConfig,
  devChains,
}
