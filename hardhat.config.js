/** @type import('hardhat/config').HardhatUserConfig */

require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

const { API_URL ,PRIVATE_KEY } = process.env; 

module.exports = {
  solidity: "0.8.8",
  defaultNetwork: "maticmum",
  networks:{
    hardhat:{},
    maticmum: {
      url: API_URL,
      accounts:[PRIVATE_KEY]
    }
  }
};
