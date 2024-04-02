/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: "../.env" });
require("@nomiclabs/hardhat-etherscan");

const { SEPOLIA_URL, PRIVATE_KEY_1, PRIVATE_KEY_2, ETHERSCAN_API_KEY } =
  process.env;

module.exports = {
  solidity: "0.8.24",

  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [`0x${PRIVATE_KEY_1}`, `0x${PRIVATE_KEY_2}`],
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
