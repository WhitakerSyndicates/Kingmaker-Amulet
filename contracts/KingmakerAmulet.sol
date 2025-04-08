// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KingmakerAmulet is ERC721URIStorage, Ownable {
    // Updated starting price to 0.001 ether.
    uint256 public constant INITIAL_PRICE = 0.001 ether;
    uint256 public constant PRICE_MULTIPLIER = 110; // 110% of last price
    uint256 public constant SELLER_PAYOUT = 101;    // 101% to previous owner

    uint256 public currentPrice;
    uint256 public lastTransferTimestamp;

    address public currentKing;
    address public maker;
    address public kingOfTime;
    address public kingOfUsurpers;

    uint256 public longestHeldTime;
    uint256 public currentHoldStart;

    uint256 public totalClaims;
    mapping(address => uint256) public claimCounts;

    address[] public kingsInExile;
    address[] public kingEternals;

    uint256 public amuletTokenId = 1;
    mapping(address => uint256) public totalHeldTime;

    constructor() ERC721("The Kingmaker Amulet", "AMULET") Ownable(msg.sender) {
        maker = msg.sender;
        _mint(maker, amuletTokenId);
        // Set the token URI to point to your hosted metadata JSON file.
        _setTokenURI(amuletTokenId, "https://WhitakerSyndicates.github.io/Kingmaker-Amulet/metadata/1.json");
        currentKing = maker;
        currentPrice = INITIAL_PRICE;
        lastTransferTimestamp = block.timestamp;
        currentHoldStart = block.timestamp;
    }

    function buy() external payable {
        require(msg.value >= currentPrice, "Insufficient payment.");

        // If 365 days have passed with no new claim, trigger a reset mechanism.
        if (block.timestamp - lastTransferTimestamp >= 365 days) {
            _triggerRebirth();
        }

        address previousKing = currentKing;
        uint256 payoutAmount = (currentPrice * SELLER_PAYOUT) / 100;
        payable(previousKing).transfer(payoutAmount);

        totalHeldTime[previousKing] += block.timestamp - currentHoldStart;
        if (totalHeldTime[previousKing] > longestHeldTime) {
            longestHeldTime = totalHeldTime[previousKing];
            kingOfTime = previousKing;
        }

        currentKing = msg.sender;
        claimCounts[msg.sender]++;
        totalClaims++;
        currentHoldStart = block.timestamp;
        lastTransferTimestamp = block.timestamp;

        if (claimCounts[msg.sender] > claimCounts[kingOfUsurpers]) {
            kingOfUsurpers = msg.sender;
        }

        _transfer(previousKing, msg.sender, amuletTokenId);
        currentPrice = (currentPrice * PRICE_MULTIPLIER) / 100;

        _distributeFees(msg.value - payoutAmount);
    }

    function _distributeFees(uint256 feePool) internal {
        uint256 exileCount = kingsInExile.length;
        uint256 councilSize = 3 + exileCount;
        if (councilSize > 7) councilSize = 7;

        uint256 councilPortion;
        uint256 eternalPortion;

        if (exileCount < 5) {
            councilPortion = feePool / councilSize;
            eternalPortion = 0;
        } else {
            councilPortion = (feePool * 7) / 100 / 7;
            eternalPortion = kingEternals.length > 0
                ? (feePool * 2) / 100 / kingEternals.length
                : 0;
        }

        if (councilSize >= 1) payable(maker).transfer(councilPortion);
        if (councilSize >= 2) payable(kingOfTime).transfer(councilPortion);
        if (councilSize >= 3) payable(kingOfUsurpers).transfer(councilPortion);

        uint256 start = exileCount > 4 ? exileCount - 4 : 0;
        uint256 count = exileCount - start;
        for (uint256 i = 0; i < count && i + start < exileCount; i++) {
            payable(kingsInExile[start + i]).transfer(councilPortion);
        }

        for (uint256 i = 0; i < kingEternals.length; i++) {
            payable(kingEternals[i]).transfer(eternalPortion);
        }
    }

    function _triggerRebirth() internal {
        address exile = currentKing;
        if (kingsInExile.length >= 4) {
            kingEternals.push(kingsInExile[0]);
            for (uint256 i = 0; i < 3; i++) {
                kingsInExile[i] = kingsInExile[i + 1];
            }
            kingsInExile[3] = exile;
        } else {
            kingsInExile.push(exile);
        }
        currentPrice = INITIAL_PRICE;
    }

    function getKingsInExile() external view returns (address[] memory) {
        return kingsInExile;
    }

    function getKingEternals() external view returns (address[] memory) {
        return kingEternals;
    }
}
