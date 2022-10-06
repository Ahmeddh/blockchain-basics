const API_KEY= process.env.API_KEY;
const PRIVATE_KEY=process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS=process.env.CONTRACT_ADDRESS

const { ethers } = require("hardhat");
const contract = require("../artifacts/contracts/HelloWorld.sol/HelloWorld.json");


// //Provider - Alchemy
// const alchemyProvider= new ethers.providers.AlchemyProvider(network="maticmum", API_KEY);

// //Signer - Me
// const signer= new ethers.Wallet(PRIVATE_KEY,alchemyProvider);

// //Contract Instance
// const helloWorldContract= new ethers.Contract(CONTRACT_ADDRESS,contract.abi,signer);

async function main(){

   const Math= await ethers.getContractFactory("Math");
   const math= await Math.deploy();

   console.log("Contract has been created at: "+math.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
