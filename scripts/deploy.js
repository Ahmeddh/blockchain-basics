const { ethers } = require("hardhat");

async function main() {
    // const HelloWorld= await ethers.getContractFactory("HelloWorld");
    // const hello_world= await HelloWorld.deploy("Hello Blockchain");

    // console.log("Contract has been deployed to address: ",hello_world.address);
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
