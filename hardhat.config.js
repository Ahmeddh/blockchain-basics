/** @type import('hardhat/config').HardhatUserConfig */

require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

const { API_URL ,PRIVATE_KEY } = process.env; 

module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "mumbai",
  networks:{
    hardhat:{},
    mumbai: {
      url: API_URL,
      accounts:[PRIVATE_KEY]
    }
  }
};
