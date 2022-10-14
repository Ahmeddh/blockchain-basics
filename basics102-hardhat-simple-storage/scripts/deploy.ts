//imports
const {ethers,run, network} = require("hardhat")

async function main(){
  const simpleStorageFactory =  await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying the contract....")
  const simpleStorage= await simpleStorageFactory.deploy()
  await simpleStorage.deployed()
  console.log('Deployed contract at:'+simpleStorage.address)
  //what is the network
  // if(network.config.chainId === 420 && process.env.ETHERSCAN_API_KEY){
  //   console.log("Waiting for 6 confirmations...")
  //   await simpleStorage.deployTransaction.wait(6)
  //   console.log("Verifying...")
  //   await verify(simpleStorage.address,[])
  // }

  //Read current value
  const currentValue= await simpleStorage.retrieve()
  console.log('Current value: '+currentValue)

  //Update value
  const transactionResponse = await simpleStorage.store(9)
  await transactionResponse.wait(1)
  const updatedValue= await simpleStorage.retrieve()
  console.log('Updated value: '+updatedValue)
}

async function verify(contractAddress, args) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args
    })
  }
  catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!")
    } else {
      console.log(e)
    }
  }
}

main()
.then(()=>{process.exit(0)})
.catch((error)=>{
  console.error(error);
  process.exit(1);
})