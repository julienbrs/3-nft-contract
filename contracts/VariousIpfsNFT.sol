// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error VariousIpfsNFT__RangeOutOfBounds();
error VariousIpfsNFT__NeedMoreEthToMint();
error VariousIpfsNFT__TransferFailed();

contract VariousIpfsNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    uint256 internal immutable i_mintFee;

    // Type Declaration
    enum Type {
        ETHEREAL,
        ELECTRIC,
        HYPNOTIC
    }

    // Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Type gradientType, address minter);

    // VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT Variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[13] internal s_typeTokenURIS;

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[13] memory typeTokenURIS,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Various Ipfs NFT", "VIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        i_mintFee = mintFee;
        s_typeTokenURIS = typeTokenURIS;
    }

    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert VariousIpfsNFT__NeedMoreEthToMint();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;

        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address gradOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        Type gradientType = getTypeFromModdedRng(moddedRng);
        s_tokenCounter++;
        _safeMint(gradOwner, newTokenId);
        // _setTokenURI isn't the best for gas efficiency
        _setTokenURI(newTokenId, s_typeTokenURIS[uint256(gradientType)]);
        emit NftMinted(gradientType, gradOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert VariousIpfsNFT__TransferFailed();
        }
    }

    function getTypeFromModdedRng(uint256 moddedRng) public pure returns (Type) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
                return Type(i);
            }
            cumulativeSum += chanceArray[i];
        }
        // If something weird happens and we don't return Type, we revert
        revert VariousIpfsNFT__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getGradientTokenUris(uint256 index) public view returns (string memory) {
        return s_typeTokenURIS[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
