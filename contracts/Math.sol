// SPDX-License-Identifier: MIT

pragma solidity >=0.7.3;

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