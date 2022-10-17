const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe")
  await fundMe.fund({ value: ethers.utils.parseEther("0.1") })
  console.log("Funded the contract with 0.1 ETH")
  const transactionResponse = await fundMe.withdraw()
  transactionResponse.wait(1)
  console.log("Withdrawed the ETH")
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
