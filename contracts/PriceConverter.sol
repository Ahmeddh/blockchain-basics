//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


library PriceConverter {
    function getPrice() internal view returns (uint256){
        AggregatorV3Interface priceFeed= AggregatorV3Interface(0x0715A7794a1dc8e42615F059dD6e406A6594651A);
        (,int256 price,,,) = priceFeed.latestRoundData();
        return uint256(price) * 1e10;
    }

    function getVersion() internal view returns (uint256){
        //Address 0x0715A7794a1dc8e42615F059dD6e406A6594651A
        AggregatorV3Interface priceFeed= AggregatorV3Interface(0x0715A7794a1dc8e42615F059dD6e406A6594651A);
        return priceFeed.version();
    }

    function getConversionRate(uint256 ethAmount) internal view returns (uint256){
        uint256 ethPrice=getPrice();
        return (ethPrice * ethAmount)/1e18;
    }
}