// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20, Ownable {
    constructor(uint256 totalSupply) ERC20("Reward Token", "RTKN") {
        _mint(msg.sender, totalSupply);
    }
}
