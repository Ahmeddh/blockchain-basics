// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

contract Math {
    uint256 results;
    address public owner;
    event addNumbers(uint256 firstNo, uint256 secondNo, uint256 results);
    
    constructor (){
        owner=msg.sender;
    }
    
    function add(uint256 a,uint256 b)public returns (uint256){
        results=a*b;
        emit addNumbers(a, b, results);

        return results;
    }
}