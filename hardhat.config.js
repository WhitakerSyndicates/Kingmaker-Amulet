require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: "0.8.20", // match the compiler used at deployment
  networks: {
    base: {
      url: process.env.ALCHEMY_BASE_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.ETHERSCAN_API_KEY,
    },
  },
};
