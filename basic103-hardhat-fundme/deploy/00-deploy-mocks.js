
const {devChains,INITIAL_ANSWER, DECIMALS}= require("../helper-hardhat-config")
const {network}= require("hardhat")

module.exports= async({getNamedAccounts,deployments})=>{
    const {deploy,log}= deployments
    const {deployer}= await getNamedAccounts()

    if(devChains.includes(network.name)){
        log("Local network detected!.....")
        await deploy("MockV3Aggregator",{
            from: deployer,
            args:[DECIMALS,INITIAL_ANSWER],
            log:true
        })
        log("Mock Deployed!...")
        log("-----------------------------------------------------------------------------")
    }
}

module.exports.tags=["all","mocks"]