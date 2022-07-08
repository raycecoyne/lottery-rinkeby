// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lottery{
    address public manager;
    address[] public players;
    uint public constant ENTRY_PRICE = .01 ether;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable{
        require(msg.value > ENTRY_PRICE);
        players.push(msg.sender);
    }
    
    function pickWinner() public restricted{
        uint index = randomNumber() % players.length;
        payable(players[index]).transfer(address(this).balance);
        players = new address[](0);
    }

    function getPlayers() public view restricted returns(address[] memory){
        return players;
    }

    function randomNumber() private view returns (uint){
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    modifier restricted() {
        require(msg.sender==manager);
        _;
    }

}