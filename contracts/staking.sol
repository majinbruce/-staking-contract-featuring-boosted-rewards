// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title StakingContract
/// @notice This contract allows users to stake tokens and earn rewards.
contract StakingContract is Ownable {
    /// @notice User struct to keep track of user's staking details.
    struct User {
        uint amount;
        uint stakingStartTimeStamp;
        uint lastClaimTime;
        uint claimedAmount;
    }
    using SafeERC20 for IERC20;

    IERC20 private immutable stakingToken;
    IERC20 private immutable rewardToken;

    uint public maxLockingPeriod; // Maximum locking period in seconds
    uint public maxLockMultiplier;
    uint public claimDelay; // Claim delay in seconds
    uint public apy; // Annual Percentage Yield, represented in APY
    uint public totalStaked;
    uint public totalRewardsClaimed;

    mapping(address => User) public users;

    error AmountMustBeGreaterThanZero();
    error UserAlreadyHasStakedTokens();
    error UserHasNoStakedTokens();
    error ClaimDelayHasNotPassed();
    error NoRewardsToClaim();
    error LockTimeIsInTheFuture();

    event Staked(address indexed user, uint amount, uint stakingStartTimeStamp);
    event Unstaked(address indexed user, uint amount);
    event Claimed(address indexed user, uint amount);

    /// @notice Constructor for creating a new StakingContract.
    /// @param _stakingToken The token users will be staking.
    /// @param _rewardToken The token users will be earning as rewards.
    /// @param _maxLockingPeriod The maximum period a user can lock their tokens for.
    /// @param _maxLockMultiplier The maximum multiplier for locking tokens.
    /// @param _claimDelay The delay before a user can claim their rewards.
    /// @param _apy The annual percentage yield for staking rewards.
    constructor(
        address _stakingToken,
        address _rewardToken,
        uint _maxLockingPeriod,
        uint _maxLockMultiplier,
        uint _claimDelay,
        uint _apy
    ) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        maxLockingPeriod = _maxLockingPeriod;
        maxLockMultiplier = _maxLockMultiplier;
        claimDelay = _claimDelay;
        apy = _apy;
    }

    /// @notice Allows a user to stake a certain amount of tokens.
    /// @param amount The amount of tokens the user wants to stake.
    function stake(uint amount) external {
        if (amount <= 0) {
            revert AmountMustBeGreaterThanZero();
        }

        if (users[msg.sender].amount != 0) {
            revert UserAlreadyHasStakedTokens();
        }

        uint currentTimeStamp = block.timestamp;

        users[msg.sender].amount = amount;
        users[msg.sender].stakingStartTimeStamp = currentTimeStamp;
        users[msg.sender].lastClaimTime = currentTimeStamp;
        users[msg.sender].claimedAmount = 0;

        totalStaked += amount;

        stakingToken.transferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount, currentTimeStamp);
    }

    /// @notice Allows a user to unstake their tokens and claim their rewards.
    function unstake() external {
        User memory user = users[msg.sender];
        if (user.amount <= 0) {
            revert UserHasNoStakedTokens();
        }

        if (block.timestamp < user.stakingStartTimeStamp + claimDelay) {
            revert ClaimDelayHasNotPassed();
        }

        uint amount = user.amount;
        totalStaked -= amount;

        uint reward = calculateReward(msg.sender);

        delete users[msg.sender];

        rewardToken.transfer(msg.sender, reward);
        stakingToken.transfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    /// @notice Allows a user to claim their rewards.
    function claim() external {
        address msgSender = msg.sender;

        if (users[msgSender].amount <= 0) {
            revert UserHasNoStakedTokens();
        }

        if (block.timestamp < users[msgSender].lastClaimTime + claimDelay) {
            revert ClaimDelayHasNotPassed();
        }

        uint reward = calculateReward(msgSender);

        if (reward <= users[msgSender].claimedAmount) {
            revert NoRewardsToClaim();
        }

        reward -= users[msgSender].claimedAmount;

        users[msgSender].lastClaimTime = block.timestamp;
        users[msgSender].claimedAmount += reward;

        totalRewardsClaimed += reward;

        rewardToken.transfer(msgSender, reward);

        emit Claimed(msgSender, reward);
    }

    /// @notice Calculates the locking multiplier for a user's staked tokens.
    /// @param stakingStartTimeStamp The timestamp when the user started staking their tokens.
    /// @return The locking multiplier for the user's staked tokens.
    function calculateLockingMultiplier(
        uint stakingStartTimeStamp
    ) internal view returns (uint) {
        if (stakingStartTimeStamp > block.timestamp) {
            revert LockTimeIsInTheFuture();
        }
        uint timeElapsed = block.timestamp - stakingStartTimeStamp;

        if (timeElapsed > maxLockingPeriod) {
            timeElapsed = maxLockingPeriod;
        }
        uint numerator = timeElapsed * maxLockMultiplier * 1e18; // to handle decimals upto 18
        uint demoninator = maxLockingPeriod;
        uint calculation = numerator / demoninator;

        return calculation;
    }

    /// @notice Calculates the reward for a user.
    /// @param user The address of the user.
    /// @return The reward for the user.
    function calculateReward(address user) internal view returns (uint) {
        if (users[user].amount <= 0) {
            revert UserHasNoStakedTokens();
        }

        uint userAmount = users[user].amount;
        uint lockingMultiplier = calculateLockingMultiplier(
            users[user].stakingStartTimeStamp
        );

        uint numerator = userAmount * lockingMultiplier * apy;

        return numerator / (1e20); //
    }
    /// @notice Updates the parameters of the staking contract.
    /// @param _maxLockingPeriod The new maximum locking period.
    /// @param _maxLockMultiplier The new maximum locking multiplier.
    /// @param _claimDelay The new claim delay.
    /// @param _apy The new APY.
    function updateParameters(
        uint _maxLockingPeriod,
        uint _maxLockMultiplier,
        uint _claimDelay,
        uint _apy
    ) external onlyOwner {
        maxLockingPeriod = _maxLockingPeriod;
        maxLockMultiplier = _maxLockMultiplier;
        claimDelay = _claimDelay;
        apy = _apy;
    }
}
