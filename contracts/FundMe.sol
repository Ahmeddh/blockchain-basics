//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

contract FundMe{

    // uint254 is PriceConsumerV3;

    address public owner;
    uint256 public minimumUSD= 50 * 1e18;  
    address[] public funders;
    mapping(address => uint256) addressToAmountFunded;

    using PriceConverter for uint256;

    constructor(){
        owner= msg.sender;
    }

    modifier onlyOwner(){
        require(owner==msg.sender);
        _;
    }

    //Fund function
    function fund() public payable{
        require(msg.value.getConversionRate() >= minimumUSD, "Amount sent is not enough");
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    //Withdraw function
    function withdraw() public onlyOwner {
        for(uint256 fundersIndex=0; fundersIndex<funders.length; fundersIndex++){
            address funderAddress= funders[fundersIndex];
            addressToAmountFunded[funderAddress]=0;
        }
        
        //reset funders address array
        funders= new address[](0);

        bool sendSuccess = payable(msg.sender).send(address(this).balance);

        require(sendSuccess, "Send Failed");
    }

}