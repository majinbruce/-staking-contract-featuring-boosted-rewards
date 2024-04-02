
## Overview

The Staking Contract features boosted rewards for users based on the duration for which they lock their funds. Booster multipliers are determined by the length of time users keep their tokens locked in the contract. Additionally, the contract includes mechanisms for locking funds, claiming rewards, and a configurable claim delay feature to ensure fair distribution of rewards.

## Features

1. **Boosted Rewards**: Users receive booster multipliers based on the length of time their tokens remain locked in the staking contract. Longer locking periods result in higher multiplier values, enhancing users' overall rewards.

2. **Maximum Locking Period**: The contract allows for setting a maximum locking period. Users can lock their funds for up to this specified duration, with booster multipliers capped accordingly.

3. **Locking Mechanism**: Only the staked funds are subject to locking. Users can withdraw their reward tokens once their claimable delay reaches zero, providing flexibility in managing their staked assets.

4. **Claim Delay**: The contract integrates a claim delay feature, requiring users to wait for a specified period after claiming their rewards before they can claim tokens again. This prevents users from claiming rewards too frequently and promotes fair distribution.

5. **Comprehensive Testing**: The Staking Contract has undergone thorough testing to validate its functionality and robustness. Various scenarios involving different locking periods, claim delays, and reward calculations have been tested to ensure accuracy and reliability.

6. **Configurability**: Designed to be highly configurable, the contract allows for easy adjustment of parameters such as maximum locking period, lock multipliers, claim delay, and APY. This flexibility enables customization to meet diverse user requirements and project specifications.

## Reward Calculation Formula

To calculate the rewards earned by a user, the following formula is used:

```plaintext
userRewards = (userStakedAmount * apy / 100) * multiplier

Where:
userStakedAmount: The amount of tokens staked by the user.
apy: Annual Percentage Yield, representing the annual interest rate for staking.
multiplier: The booster multiplier calculated based on the locking period.

For example, considering:
userStakedAmount = 100
apy = 20%
multiplier = 1.36986 (calculated based on locking period)

The calculation would be:
userRewards = (100 * 20 / 100) * 1.36986
             = 20 * 1.36986
             = 27.3972
Hence, the user would earn approximately 27.3972 tokens as rewards.
```

## Requirements For Initial Setup

- Install NodeJS

- Install Hardhat

## Setting Up

1. Clone/Download the Repository </br>

> git clone https://github.com/majinbruce/-staking-contract-featuring-boosted-rewards.git

2. Install Dependencies:

> npm init --yes </br>

> npm install --save-dev hardhat </br>

> npm install dotenv --save </br>

3. Install Plugins:

> npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai </br>

> npm install --save-dev @nomiclabs/hardhat-etherscan </br>

> npm install @openzeppelin/contracts

4. Compile:

> npx hardhat compile

5. Migrate Smart Contracts

> npx hardhat run scripts/deploy.js --network <network-name>

6. Run Tests

> npx hardhat test

7. verify contract

> npx hardhat verify <contract address> --constructor-args --network <network-name>
