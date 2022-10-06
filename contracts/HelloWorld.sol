// SPDX-License-Identifier: MIT

pragma solidity >=0.7.3;

contract HelloWorld {

    string public message; 
    event updateMessages(string oldMsg, string newMsg);

    constructor (string memory initMessage){
        message= initMessage;
    }

    function update(string memory newMsg) public {
        string memory oldMsg = message;
        message= newMsg;
        emit updateMessages(oldMsg, newMsg);
    }

}