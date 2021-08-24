pragma solidity ^0.6.0;

contract Manager {

    uint public totalSize;

    constructor(uint size) public {
        totalSize = size;
    }
}