//imports
const {ethers,run, network} = require("hardhat")

async function main(){
  const simpleStorageFactory =  await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying the contract....")
  const simpleStorage= await simpleStorageFactory.deploy()
  await simpleStorage.deployed()
  console.log('Deployed contract at:'+simpleStorage.address)
}

async function verify(contractAddress,args){
  try{
    await run.verify("verify:verify",{
      address:contractAddress,
      constructorArgs:args
    })
  }
  catch(error){console.error(error)}
}

main()
.then(()=>{process.exit(0)})
.catch((error)=>{
  console.error(error);
  process.exit(1);
})