//SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IGO is ERC1155Holder, Ownable {
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

    uint256 constant Decimals = 1e18;
    uint256 public amount;
    /// @dev address , token1155.ids
    /// @dev address,tokenID, only mint once
    mapping(address => uint256) public rewards;
    /// @dev token1155.id , total
    mapping(uint256 => TokenTotal) public tokenIds;
    /// @dev token1155.id
    uint256[] public ids;
    uint256 nonce;
    uint256[] private leftIds;

    event Raffled(address indexed user, uint256 nftId, uint256 blockNumber);

    constructor(
        address _tokenAddress,
        uint256 _amount,
        address _nftAddress,
        uint256[] memory _ids
    ) {
        payToken = IERC20(_tokenAddress);
        nftToken = IERC1155(_nftAddress);
        amount = _amount;
        ids = _ids;
        leftIds = _ids;
        for (uint256 i = 0; i < _ids.length; i++) {
            tokenIds[_ids[i]] = TokenTotal(_ids[i], 0, 0, true);
        }
    }

    function raffle() public {
        require(rewards[msg.sender] == 0, "already received");

        uint256 _id = getNftId();

        require(_id > 0, "left nft zero");

        tokenIds[_id].mintedTotal = tokenIds[_id].mintedTotal.add(1);
        require(tokenIds[_id].total >= tokenIds[_id].mintedTotal, "max total");

        payToken.safeTransferFrom(msg.sender, address(this), amount);

        nftToken.safeTransferFrom(address(this), msg.sender, _id, 1, "0x00");

        rewards[msg.sender] = _id;

        emit Raffled(msg.sender, _id, block.number);
    }

    function setRewardTotal(uint256 _id, uint256 _total) external onlyOwner {
        require(tokenIds[_id].isValid == true, "invalid id");
        require(tokenIds[_id].total == 0, "already been set up");
        tokenIds[_id].total = _total;
    }

    function idsCount() external view returns (uint256) {
        return ids.length;
    }

    function balance() public view returns (uint256) {
        return payToken.balanceOf(address(this));
    }

    function balanceOf(address _addr) external view returns (uint256) {
        return payToken.balanceOf(_addr);
    }

    function nftBalance(uint256 _id) public view returns (uint256) {
        return nftToken.balanceOf(address(this), _id);
    }

    function nftBalanceOf(address _address, uint256 _id)
        external
        view
        returns (uint256)
    {
        return nftToken.balanceOf(_address, _id);
    }

    function withdraw() external onlyOwner {
        require(balance() > 0, "balance zero");
        payToken.safeTransfer(owner(), balance());
    }

    function withdrawNft(uint256 _id) external onlyOwner {
        uint256 count = nftBalance(_id);
        require(count > 0, "balance zero");
        nftToken.safeTransferFrom(address(this), owner(), _id, count, "0x00");
    }

    function getNftId() internal returns (uint256) {
        uint256 left = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (tokenIds[ids[i]].total > tokenIds[ids[i]].mintedTotal) {
                leftIds[left] = ids[i];
                left++;
            }
        }
        uint256 nftId = 0;
        if (left > 0) {
            uint256 rand = _psuedoRandomness(left);
            nftId = leftIds[rand];
        }

        return nftId;
    }

    function _psuedoRandomness(uint256 mod) internal returns (uint256) {
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    nonce,
                    block.timestamp,
                    block.difficulty,
                    block.gaslimit,
                    block.number,
                    msg.sender
                )
            )
        ) % mod;
        nonce++;
        return rand;
    }
}
