//SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

// import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

contract FundMe {
  // uint254 is PriceConsumerV3;

  address public i_owner;
  uint256 public constant MINIMUM_USD = 50 * 1e18;
  address[] public funders;
  mapping(address => uint256) public addressToAmountFunded;
  AggregatorV3Interface public priceFeed;

  using PriceConverter for uint256;

  constructor(address _priceFeedAddress) public {
    i_owner = msg.sender;
    priceFeed = AggregatorV3Interface(_priceFeedAddress);
  }

  modifier onlyOwner() {
    require(i_owner == msg.sender, "Sender is not the owner");
    _;
  }

  //Fund function
  function fund() public payable {
    require(
      msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
      "Amount sent is not enough"
    );
    funders.push(msg.sender);
    addressToAmountFunded[msg.sender] = msg.value;
  }

  //Withdraw function
  function withdraw() public onlyOwner {
    for (
      uint256 fundersIndex = 0;
      fundersIndex < funders.length;
      fundersIndex++
    ) {
      address funderAddress = funders[fundersIndex];
      addressToAmountFunded[funderAddress] = 0;
    }

    //reset funders address array
    funders = new address[](0);

    bool sendSuccess = payable(msg.sender).send(address(this).balance);

    require(sendSuccess, "Send Failed");
  }

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }
}
