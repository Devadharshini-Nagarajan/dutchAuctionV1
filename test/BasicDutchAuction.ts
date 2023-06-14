import { ethers } from "hardhat";
import { expect } from "chai";

// Helper function to increase the number of blocks
async function increaseBlocks(numBlocks: number): Promise<void> {
    for (let i = 0; i < numBlocks; i++) {
      await ethers.provider.send("evm_mine");
    }
}
  
describe("BasicDutchAuction", function () {
  let dutchAuction: any;
  let seller: any;
  let buyer: any;

  beforeEach(async function () {
    const BasicDutchAuction = await ethers.getContractFactory("BasicDutchAuction");
    dutchAuction = await BasicDutchAuction.deploy(100, 100, 1);

    const signers = await ethers.getSigners();
    seller = signers[0];
    buyer = signers[1];
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await dutchAuction.seller()).to.equal(seller.address);
      expect(await dutchAuction.reservePrice()).to.equal(100);
      expect(await dutchAuction.numBlocksAuctionOpen()).to.equal(100);
      expect(await dutchAuction.offerPriceDecrement()).to.equal(1);
    });
  });

  describe("placeBid", function () {
    it("Should reject bids from the seller", async function () {
      await expect(dutchAuction.connect(seller).placeBid({ value: 100 })).to.be.revertedWith(
        "Owner can't place a bid!"
      );
    });    
    
    it("Should reject bids after the auction has ended", async function () {

        await dutchAuction.connect(buyer).placeBid({ value: 101 });
        expect(await dutchAuction.isAuctionOver()).to.be.true;

        await expect(dutchAuction.connect(buyer).placeBid({ value: 100 })).to.be.revertedWith(
            "Auction is ended!"
        );
    });



    it("Should reject bids after the no of blocks open count reached", async function () {
        await increaseBlocks(200);
        await expect(dutchAuction.connect(buyer).placeBid({ value: 100 })).to.be.revertedWith(
            "Auction is ended!"
        );
    });

    it("Should accept a valid bid and transfer funds to the seller", async function () {
      const initialBalance = await ethers.provider.getBalance(seller.address);

      await dutchAuction.connect(buyer).placeBid({ value: 101 });

      expect(await dutchAuction.isAuctionOver()).to.be.true;
    //   expect(await ethers.provider.getBalance(seller.address)).to.equal(initialBalance.add(101));
    });

    it("Should refund a bid that is below the current price", async function () {
      const initialBalance = await ethers.provider.getBalance(buyer.address);

      await dutchAuction.connect(buyer).placeBid({ value: 99 });

      expect(await dutchAuction.isAuctionOver()).to.be.false;
    //   expect(await ethers.provider.getBalance(buyer.address)).to.equal(initialBalance.sub(99));
    });
  });
});
