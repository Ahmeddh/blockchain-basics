const { ethers } = require("hardhat")

const networkConfig = {
  80001: {
    name: "maticmum",
    vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: 2259,
    callbackGasLimit: "500000",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    callbackGasLimit: "5000000",
    interval: "30",
  },
}

const devChains = ["hardhat", "localhost"]

module.exports = {
  networkConfig,
  devChains,
}
