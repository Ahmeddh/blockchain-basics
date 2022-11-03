const { assert } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("DynamicNFT Unit Tests", () => {
          let deployer, dynamicSvgNft, tx, txResponse, mockV3Aggregator
          beforeEach(async () => {
              await deployments.fixture(["all"])
              deployer = (await getNamedAccounts()).deployer
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
              console.clear()
              console.log("Minting Dynamic SVG NFT on-chain.......")
          })
          describe("mint NFT", () => {
              it("Can mint NFT and set tokenURI", async () => {
                  const highValue = ethers.utils.parseEther("0.1")
                  tx = await dynamicSvgNft.mintNft(highValue)
                  txResponse = await tx.wait(1)
                  await new Promise(async (resolve, reject) => {
                      dynamicSvgNft.once("NftMinted", async () => {
                          try {
                              //get tokenId
                              console.log(
                                  "DynamicNft - dynamic SVG NFT has been minted @ this Big SVG URL place"
                              )

                              const tokenURI = await dynamicSvgNft.tokenURI(
                                  txResponse.events[0].args.tokenId
                              )

                              assert(tokenURI.includes("data:application/json;base64,"))
                              console.log("---------------------------------------------------")
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                  })
              })
          })
      })
