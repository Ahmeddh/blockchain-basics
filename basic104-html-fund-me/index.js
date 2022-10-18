//imports
import { ethers } from "./ethers.esm.min.js"
import { abi, contractAddress } from "./constants.js"
//const
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const withdrawButton = document.getElementById("withdrawButton")
const balanceButton = document.getElementById("balanceButton")

connectButton.onclick = connect
fundButton.onclick = fund
withdrawButton.onclick = withdraw
balanceButton.onclick = getBalance

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await ethereum.request({ method: "eth_requestAccounts" })
    connectButton.innerHTML = "Connected"
  } else {
    connectButton.innerHTML = "Please install Metamask"
  }
}

function listenToTransactionMine(transactionResponse, provider) {
  console.log("Mining transaction at " + transactionResponse.hash)
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        "Completed with " + transactionReceipt.confirmations + " confirmation"
      )
      resolve()
    })
  })
}
//fund function
async function fund() {
  if (typeof window.ethereum !== "undefined") {
    const ethAmount = document.getElementById("ethAmount").value
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    const transactionResponse = await contract.fund({
      value: ethers.utils.parseEther(ethAmount),
    })
    const transactionReceipt = await transactionResponse.wait(1)
    await listenToTransactionMine(transactionResponse, provider)
    console.log("Done!")
  } else {
    connectButton.innerHTML = "Please install Metamask"
  }
}
//withdraw function
async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer)
      console.log("Withdrawing fund from contract at " + contractAddress)
      const transactionResponse = await contract.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      await listenToTransactionMine(transactionResponse, provider)
      console.log("Withdrawing from contract was successful")
    } catch (error) {
      console.log(error)
    }
  } else {
    connectButton.innerHTML = "Please install Metamask"
  }
}
async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      console.log(ethers.utils.formatEther(balance))
    } catch (error) {
      console.log(ethers.utils.formatEther(error))
    }
  }
}
