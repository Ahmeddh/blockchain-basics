const {task} = require("hardhat/config")

//Task: Block-Number
task("block-number","Prints the current block number").setAction(
   async (taskArgs,hre) => {
    const blockNumber = await hre.ethers.provider.getBlockNumber()
    console.log("Block number is: "+blockNumber)
   }
)
