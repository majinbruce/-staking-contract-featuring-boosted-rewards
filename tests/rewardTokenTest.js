const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardToken", () => {
  const token_name = "Reward Token";
  const token_symbol = "RTKN";
  const tokenSupply = 10000;

  let owner;
  let MYTOKEN;
  let mytoken;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    MYTOKEN = await ethers.getContractFactory("RewardToken");
    mytoken = await MYTOKEN.deploy(tokenSupply);
    await mytoken.deployed();
  });

  it("Sets correct name and symbol", async () => {
    const tokenName = await mytoken.name();
    expect(tokenName).to.equal(token_name);

    const tokenSymbol = await mytoken.symbol();
    expect(tokenSymbol).to.equal(token_symbol);
  });

  it("Sets correct initial supply", async () => {
    const totalSupply = await mytoken.totalSupply();
    expect(totalSupply).to.equal(tokenSupply);
  });

  it("Mints all tokens to owner", async () => {
    const ownerBalance = await mytoken.balanceOf(owner.address);
    const totalSupply = await mytoken.totalSupply();
    expect(ownerBalance).to.equal(totalSupply);
  });
});
