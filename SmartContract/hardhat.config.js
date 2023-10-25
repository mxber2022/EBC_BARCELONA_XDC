require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.18",

  networks: {
    'xdc-apothem': {
      url: 'https://erpc.apothem.network/',
      accounts: [process.env.PRIVATE_KEY],
    },
  },

  etherscan: {
    apiKey: {
      "xdc-apothem": "abc",
    },

    customChains: [
      {
        network: "xdc-apothem",
        chainId: 51,
        urls: {
          apiURL: "https://explorer.apothem.network/api",
          browserURL: '',
        },
      },
    ],

  },
}