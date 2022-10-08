const API_KEY= process.env.API_KEY;
const PRIVATE_KEY=process.env.PRIVATE_KEY;
const MATH_CONTRACT_ADDRESS=process.env.MATH_CONTRACT_ADDRESS

const { ethers } = require("hardhat");
const contract = require("../artifacts/contracts/Math.sol/Math.json");


//Provider - Alchemy
const alchemyProvider= new ethers.providers.AlchemyProvider(network="maticmum", API_KEY);

//Signer - Me
const signer= new ethers.Wallet(PRIVATE_KEY,alchemyProvider);

//Contract Instance
const mathContract= new ethers.Contract(MATH_CONTRACT_ADDRESS,contract.abi,signer);

async function main(){

   const ownerAddress = await mathContract.owner();
   console.log("Here is the owner address: "+ownerAddress);
   console.log("Adding two numbers 10 & 12");
   let result = await mathContract.add(10,12);
   console.log("The result is: "+ result);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
