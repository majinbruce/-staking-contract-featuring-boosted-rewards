const { ethers } = require("hardhat");

async function main() {
  const [owner, addr1] = await ethers.getSigners();

  const totalsupply = ethers.utils.parseUnits("100000000", 18);
  const hunderdTokensParsed = ethers.utils.parseUnits("100", 18);

  const claimDelay = 864000; // Set the claim delay to 10 days in seconds
  const maxLockingPeriod = 3.154e7; // Set the claim delay to 365 days in seconds
  const maxLockMultiplier = 5;
  const apy = 20;

  // Deploy RewardToken
  const RewardToken = await ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy(totalsupply);
  await rewardToken.deployed();
  console.log("RewardToken deployed at", rewardToken.address);

  // Deploy StakingToken
  const StakingToken = await ethers.getContractFactory("StakingToken");
  const stakingToken = await StakingToken.deploy(totalsupply);
  await stakingToken.deployed();
  console.log("StakingToken deployed at", stakingToken.address);

  // Deploy StakingContract
  const StakingContract = await ethers.getContractFactory("StakingContract");
  const stakingContract = await StakingContract.deploy(
    stakingToken.address,
    rewardToken.address,
    maxLockingPeriod,
    maxLockMultiplier,
    claimDelay,
    apy
  );
  await stakingContract.deployed();
  console.log("StakingContract deployed at", stakingContract.address);

  // Transfer some RewardToken to the StakingContract
  let tx = await rewardToken.transfer(
    stakingContract.address,
    hunderdTokensParsed
  );
  console.log("Transfer RewardToken transaction hash:", tx.hash);

  // Transfer some StakingToken to addr1
  tx = await stakingToken.transfer(addr1.address, hunderdTokensParsed);
  console.log("Transfer StakingToken transaction hash:", tx.hash);

  // Approve StakingContract to spend StakingToken
  tx = await stakingToken.approve(stakingContract.address, hunderdTokensParsed);
  console.log("Approve StakingToken transaction hash:", tx.hash);

  // Stake tokens
  tx = await stakingContract.stake(hunderdTokensParsed);
  console.log("Stake transaction hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
