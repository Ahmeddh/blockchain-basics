//SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

// import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

contract FundMe {
  // uint254 is PriceConsumerV3;

  address private i_owner;
  uint256 public constant MINIMUM_USD = 50 * 1e18;
  address[] private s_funders;
  mapping(address => uint256) public s_addressToAmountFunded;
  AggregatorV3Interface private s_priceFeed;

  using PriceConverter for uint256;

  constructor(address _priceFeedAddress) public {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(_priceFeedAddress);
  }

  modifier onlyowner() {
    require(i_owner == msg.sender, "Sender is not the owner");
    _;
  }

  //Fund function
  function fund() public payable {
    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
      "Amount sent is not enough"
    );
    s_funders.push(msg.sender);
    s_addressToAmountFunded[msg.sender] = msg.value;
  }

  //Cheaper Withdraw function
  function cheaperWithdraw() public onlyowner {}

  //Withdraw function
  function withdraw() public onlyowner {
    for (
      uint256 fundersIndex = 0;
      fundersIndex < s_funders.length;
      fundersIndex++
    ) {
      address funderAddress = s_funders[fundersIndex];
      s_addressToAmountFunded[funderAddress] = 0;
    }

    //reset s_funders address array
    s_funders = new address[](0);

    bool sendSuccess = payable(msg.sender).send(address(this).balance);

    require(sendSuccess, "Send Failed");
  }

  function getAddressToAmountFunded(address _fundingAddress)
    public
    view
    returns (uint256)
  {
    return s_addressToAmountFunded[_fundingAddress];
  }

  function getFunder(uint256 _index) public view returns (address) {
    return s_funders[_index];
  }

  function getOwner() public view returns (address) {
    return i_owner;
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}
