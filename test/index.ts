import { expect } from "chai";
import { ethers } from "hardhat";

before(async function () {
  this.accounts = await ethers.getSigners();
});

describe("NFT", function () {
  it("Should increment current tokenId after minted", async function () {
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    await nft.deployed();
    expect(await nft.currentTokenId()).to.equal(0);

    const mintTx = await nft.mint(this.accounts[0].address);

    await mintTx.wait();
    expect(await nft.currentTokenId()).to.equal(1);
  });

  it("Should update merkleroot after minted", async function () {
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    await nft.deployed();

    const initialMerkleroot =
      "0xfadbd3c7f79fa2bdc4f24857709cd4a4e870623dc9e9abcdfd6e448033e35212";
    expect(await nft.merkleroot()).to.equal(initialMerkleroot);

    const mintTx = await nft.mint(this.accounts[0].address);
    await mintTx.wait();

    // 0x8418e278790df1f39830fbb12ff9b0dcdbe25a25be9eb374cf3f61b7d997eaeb
    expect(await nft.merkleroot()).to.not.equal(initialMerkleroot);

    console.log(await nft.merkleroot());
  });
});
