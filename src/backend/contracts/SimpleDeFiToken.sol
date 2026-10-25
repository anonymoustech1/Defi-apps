// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SimpleDeFiToken
 * @dev Very simple meme token that is used for demonstrating various of DeFi applications
 */


contract SimpleDeFiToken is ERC20 {
    
    constructor() ERC20("Simple DeFi Token", "SDFT") {
        // Initial supply of 1,000,000,000 tokens are given to msg.sender
        _mint(msg.sender, 1e27);
    }


    function transferWithAutoBurn(address to, uint256 amount) public {
        require(this.balanceOf(msg.sender) >= amount, "Not enough tokens");
        uint256 burnAmount = amount / 10; // Burn 10% of the amount
        uint256 transferAmount = amount - burnAmount;

    _burn(msg.sender, burnAmount); // Burn the tokens
    _transfer(msg.sender, to, transferAmount); // Transfer the remaining tokens

}

}

