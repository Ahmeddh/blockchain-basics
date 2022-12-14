// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";
import "hardhat/console.sol";

pragma solidity ^0.8.8;

error ERC721Metadata__URI_QueryFor_NonExistentToken();

contract DynamicSvgNft is ERC721 {
    //Variables Declaration
    uint256 private s_tokenCounter;
    string private s_happyImage;
    string private s_sadImage;
    string private constant base64EncodedPrefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;

    //Mappings
    mapping(uint256 => int256) public s_tokenUriToHighValue;

    //Events
    event NftMinted(uint256 indexed tokenURI, address owner, int256 highValue);

    constructor(
        address _priceFeedAddress,
        string memory _happySVG,
        string memory _sadSVG
    ) ERC721("DynamicSvgNft", "DSVG") {
        s_tokenCounter = 0;
        s_happyImage = svgToImageUri(_happySVG);
        s_sadImage = svgToImageUri(_sadSVG);
        i_priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function svgToImageUri(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedPrefix, svgBase64Encoded));
    }

    /**
     * Mint
     * Store SVG image on chain
     * Some logic to show one of two images
     */
    function mintNft(int256 highValue) public {
        s_tokenUriToHighValue[s_tokenCounter] = highValue;
        s_tokenCounter += 1;
        _safeMint(msg.sender, s_tokenCounter);
        emit NftMinted(s_tokenCounter, msg.sender, highValue);
    }

    function _baseUri() internal pure returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        /**
         * '{"name":"" , "description":"An adorable Pup" , "image":"" , "attribute":{"trait_type":"Cutest","value":"100"}}'
         */
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory imageURI = s_sadImage;
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        if (price >= s_tokenUriToHighValue[tokenId]) {
            imageURI = s_happyImage;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '" , "description":"An adorable Pup" , "image":"',
                                imageURI,
                                '" , "attribute":{"trait_type":"Cutest","value":"100"}}'
                            )
                        )
                    )
                )
            );
    }
}
