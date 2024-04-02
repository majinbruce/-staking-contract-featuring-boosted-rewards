/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: "../.env" });
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: "0.8.24",
};
