// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract BasicDutchAuction {
    address payable public seller;
    uint256 public reservePrice;
    uint256 public  numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public initialPrice;
    uint256 public auctionStartBlock;
    uint256 public auctionEndBlock;
    bool public isAuctionOver;

    constructor(
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        seller = payable(msg.sender);
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        initialPrice = reservePrice + numBlocksAuctionOpen * offerPriceDecrement;
        auctionStartBlock = block.number;
        auctionEndBlock = block.number + numBlocksAuctionOpen;
        isAuctionOver = false;
    }

    function placeBid() public payable returns(address) {
        require(msg.sender != seller, "Owner can't place a bid!");
        require(isAuctionOver == false, "Auction is ended!");
        require(block.number <= auctionEndBlock, "Auction is ended!");

        uint256 goneBlocks = auctionEndBlock - block.number;
        uint256 currentPrice = initialPrice - goneBlocks * offerPriceDecrement;

        if(msg.value >= currentPrice) { 
            seller.transfer(msg.value);
            isAuctionOver = true;
        } else {
            address payable bidder = payable (msg.sender);
            bidder.transfer(msg.value);
        }
         return msg.sender;
    }

}