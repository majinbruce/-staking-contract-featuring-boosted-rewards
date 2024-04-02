const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingContract", function () {
  let owner, addr1;
  let StakingContract, stakingContract;
  let RewardToken, rewardToken;
  let StakingToken, stakingToken;

  const totalsupply = ethers.utils.parseUnits("1000", 18);
  const hunderdTokensParsed = ethers.utils.parseUnits("100", 18);

  console.log(totalsupply, "token amount parsed");

  const claimDelay = 864000; // Set the claim delay to 10 days in seconds
  const maxLockingPeriod = 3.154e7; // Set the claim delay to 365 days in seconds

  const maxLockMultiplier = 5;
  const apy = 20;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy(totalsupply);
    await rewardToken.deployed();

    StakingToken = await ethers.getContractFactory("StakingToken");
    stakingToken = await StakingToken.deploy(totalsupply);
    await stakingToken.deployed();

    StakingContract = await ethers.getContractFactory("StakingContract");
    stakingContract = await StakingContract.deploy(
      stakingToken.address,
      rewardToken.address,
      maxLockingPeriod, // maxLockingPeriod
      maxLockMultiplier, // maxLockMultiplier
      claimDelay, // claimDelay
      apy // apy
    );
    await stakingContract.deployed();
    // Transfer some RewardToken to the StakingContract
    await rewardToken.transfer(stakingContract.address, hunderdTokensParsed);
    await stakingToken.transfer(addr1.address, hunderdTokensParsed);
  });

  it("Should stake tokens", async function () {
    await stakingToken.approve(stakingContract.address, hunderdTokensParsed);
    await stakingContract.stake(hunderdTokensParsed);
    const userInfo = await stakingContract.users(owner.address);
    expect(userInfo.amount).to.equal(hunderdTokensParsed);
  });

  it("Should unstake tokens and claim reward", async function () {
    // First, stake some tokens
    await stakingToken.approve(stakingContract.address, hunderdTokensParsed);
    await stakingContract.stake(hunderdTokensParsed);

    // Fast forward time to pass the claim delay
    await ethers.provider.send("evm_increaseTime", [claimDelay]);
    await ethers.provider.send("evm_mine");

    // Save the initial balances
    const initialStakingTokenBalance = await stakingToken.balanceOf(
      owner.address
    );
    const initialRewardTokenBalance = await rewardToken.balanceOf(
      owner.address
    );

    // Unstake the tokens
    await stakingContract.unstake();

    // Check that the staked tokens have been returned
    const finalStakingTokenBalance = await stakingToken.balanceOf(
      owner.address
    );
    expect(finalStakingTokenBalance).to.equal(
      initialStakingTokenBalance.add(hunderdTokensParsed)
    );

    // Check that the reward has been claimed
    const finalRewardTokenBalance = await rewardToken.balanceOf(owner.address);
    expect(finalRewardTokenBalance).to.be.gt(initialRewardTokenBalance);

    // Check that the user's staking info has been deleted
    const userInfo = await stakingContract.users(owner.address);
    expect(userInfo.amount).to.equal(0);
  });

  it("Should update parameters", async function () {
    // Define new parameters
    const newMaxLockingPeriod = 2000;
    const newMaxLockMultiplier = 3;
    const newClaimDelay = 200;
    const newApy = 20;

    // Update the parameters
    await stakingContract.updateParameters(
      newMaxLockingPeriod,
      newMaxLockMultiplier,
      newClaimDelay,
      newApy
    );

    // Check that the parameters have been updated
    const maxLockingPeriod = await stakingContract.maxLockingPeriod();
    expect(maxLockingPeriod).to.equal(newMaxLockingPeriod);

    const maxLockMultiplier = await stakingContract.maxLockMultiplier();
    expect(maxLockMultiplier).to.equal(newMaxLockMultiplier);

    const claimDelay = await stakingContract.claimDelay();
    expect(claimDelay).to.equal(newClaimDelay);

    const apy = await stakingContract.apy();
    expect(apy).to.equal(newApy);
  });

  it("Should claim rewards", async function () {
    // First, stake some tokens
    await stakingToken.approve(stakingContract.address, hunderdTokensParsed);
    await stakingContract.stake(hunderdTokensParsed);

    // Fast forward time to pass the claim delay
    await ethers.provider.send("evm_increaseTime", [claimDelay]);
    await ethers.provider.send("evm_mine");

    // Save the initial balances
    const initialRewardTokenBalance = await rewardToken.balanceOf(
      owner.address
    );
    const initialTotalRewardsClaimed =
      await stakingContract.totalRewardsClaimed();

    // Claim the rewards
    await stakingContract.claim();

    // Check that the reward has been claimed
    const finalRewardTokenBalance = await rewardToken.balanceOf(owner.address);
    expect(finalRewardTokenBalance).to.be.gt(initialRewardTokenBalance);

    // Check that the total rewards claimed has been updated
    const finalTotalRewardsClaimed =
      await stakingContract.totalRewardsClaimed();
    expect(finalTotalRewardsClaimed).to.be.gt(initialTotalRewardsClaimed);

    // Check that the user's last claim time and claimed amount have been updated
    const userInfo = await stakingContract.users(owner.address);
    expect(userInfo.lastClaimTime).to.be.gt(0);
    expect(userInfo.claimedAmount).to.be.gt(0);
  });

  it("Should claim rewards twice correctly", async function () {
    // First, stake some tokens
    await stakingToken
      .connect(addr1)
      .approve(stakingContract.address, hunderdTokensParsed);
    await stakingContract.connect(addr1).stake(hunderdTokensParsed);

    // Fast forward time to pass the claim delay
    await ethers.provider.send("evm_increaseTime", [claimDelay]);
    await ethers.provider.send("evm_mine");

    // Claim the rewards for the first time
    await stakingContract.connect(addr1).claim();

    // Save the initial balances and user info after the first claim
    const initialRewardTokenBalance = await rewardToken.balanceOf(
      addr1.address
    );
    const initialUserInfo = await stakingContract.users(addr1.address);

    // Log the rewards received after the first claim
    console.log(
      `Rewards received after first claim: ${initialUserInfo.claimedAmount}`
    );

    // Fast forward time to 9x pass the claim delay again(total time passed is 10 days now)

    await ethers.provider.send("evm_increaseTime", [claimDelay * 9]);
    await ethers.provider.send("evm_mine");

    // Claim the rewards for the second time
    await stakingContract.connect(addr1).claim();

    // Check that the reward has been claimed
    const finalRewardTokenBalance = await rewardToken.balanceOf(addr1.address);
    console.log(finalRewardTokenBalance.toString(), "finalRewardTokenBalance");
    expect(finalRewardTokenBalance).to.be.gt(initialRewardTokenBalance);

    // Check that the user's last claim time and claimed amount have been updated
    const finalUserInfo = await stakingContract.users(addr1.address);
    expect(finalUserInfo.lastClaimTime).to.be.gt(initialUserInfo.lastClaimTime);
    expect(finalUserInfo.claimedAmount).to.be.gt(initialUserInfo.claimedAmount);

    // Log the rewards received after the second claim
    console.log(
      `Rewards received after second claim: ${finalUserInfo.claimedAmount}`
    );
  });
});
