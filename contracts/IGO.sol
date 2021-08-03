//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract IGO {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public payToken;
  IERC1155 public nftToken;

  struct TokenTotal {
    uint256 id;
    uint256 total;
    uint256 mintedTotal;
    bool isValid;
  }

  uint constant Decimals = 1e18;
  /// @dev address , token1155.ids
  /// @dev address,tokenID, only mint once
  mapping(address => uint256) public rewards;
  //@dev token1155.id , total
  mapping(uint256 => TokenTotal) public tokenIds;
  //@dev token1155.id
  uint256[] public ids;


  constructor(address _tokenAddress, address _nftAddress, uint256[] memory _ids) {
    payToken = IERC20(_tokenAddress);
    nftToken = IERC1155(_nftAddress);
    ids = _ids;
    for(uint256 i=0; i<_ids.length ;i++){
      tokenIds[_ids[i]] = TokenTotal(_ids[i],0,0,true);
    }
  }

  function mint(uint256 _id) public {
    console.log("mint '%s' '%s'",msg.sender,_id);
    require(rewards[msg.sender]==0, "already received");

    /// @dev total rule
    tokenIds[_id].mintedTotal = tokenIds[_id].mintedTotal.add(1);
    require(tokenIds[_id].total >= tokenIds[_id].mintedTotal,"max total");
    /// TODO random number
    /// TODO call 1155
    /// TODO payable

    rewards[msg.sender] = _id;
    console.log("success");
  }

  function setRewardTotal(uint256 _id, uint256 _total) external  {
    require(tokenIds[_id].isValid==true,"invalid id");
    require(tokenIds[_id].total==0,"already been set up");
    tokenIds[_id].total =  _total;
    console.log("set total",_id,_total);
  }

  function idsCount() external view returns (uint256) {
     return ids.length;
 }

 function balance() public view returns (uint256){
       return payToken.balanceOf(address(this));
 }
}
