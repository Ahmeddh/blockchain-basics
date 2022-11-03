// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

error RandomNft__RangeOutOfBounds();
error RandomNft__NotEnoughEthSent();
error RandomNft__WithdrawFailed();

/**
 * 1. Use Chainlink VRF to get a random number
 * 2. Use that number to mint a Random Nft
 * 3. Pug, Shiba-Inu, or St. Bernard
 * Pug - Super rare
 * Shiba-Inu - sort of rare
 * St. Bernard - common
 * 4. Users has to pay to get the NFT
 * 5. Deployer can withdraw the ETH from the contract
 */
contract RandomNft is VRFConsumerBaseV2, ERC721URIStorage {
    //Type Declaration
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    //Chainlink VRF variables
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinatorV2;

    //Events
    event RequestRandomWord(uint256 requestId, address sender);
    event NftMinted(address owner, Breed dogType);

    //VRF Helper
    mapping(uint256 => address) public s_requestIdToAddress;

    //NFT Variables
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;
    uint256 internal immutable i_mintPrice;
    address public s_owner;

    constructor(
        address _vrfCoordinatorV2,
        uint64 _subscriptionId,
        bytes32 _gasLane,
        uint32 _callbackGasLimit,
        string[3] memory _dogTokenUris,
        uint256 _mintPrice
    ) VRFConsumerBaseV2(_vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
        //Initialize all
        i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(_vrfCoordinatorV2);
        i_subscriptionId = _subscriptionId;
        i_gasLane = _gasLane;
        i_callbackGasLimit = _callbackGasLimit;
        s_dogTokenUris = _dogTokenUris;
        i_mintPrice = _mintPrice;
        s_owner = msg.sender;
    }

    modifier onlyOwner() {
        s_owner = msg.sender;
        _;
    }

    //request RandomNft
    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintPrice) {
            revert RandomNft__NotEnoughEthSent();
        }

        requestId = i_vrfCoordinatorV2.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToAddress[requestId] = msg.sender;
        emit RequestRandomWord(requestId, msg.sender);
    }

    //fullfill random word using chainlink
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address owner = s_requestIdToAddress[requestId];
        uint256 newTokenId = s_tokenCounter;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        Breed dogType = getBreedFromModdedRng(moddedRng);
        s_tokenCounter += 1;
        _safeMint(owner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogType)]);
        emit NftMinted(owner, dogType);
    }

    function getBreedFromModdedRng(uint256 _moddedRng) public pure returns (Breed) {
        uint256 cummulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();

        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (_moddedRng >= cummulativeSum && _moddedRng < chanceArray[i]) {
                return Breed(i);
            }
            cummulativeSum += chanceArray[i];
        }
        revert RandomNft__RangeOutOfBounds();
    }

    //get chance array function
    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function withdraw() public payable onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomNft__WithdrawFailed();
        }
    }

    function getMintPrice() public view returns (uint256) {
        return i_mintPrice;
    }

    function getDogTokenUris(uint256 _index) public view returns (string memory) {
        return s_dogTokenUris[_index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getOwnerByRequestId(uint256 requestId) public view returns (address) {
        return s_requestIdToAddress[requestId];
    }
}
