// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

///////////////////////////
////////  Errors  /////////
///////////////////////////
error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotTheNftOwner();
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NoProceedsForThisAddress(address seller);
error NftMarketplace__TransferFailed(address seller, uint256 amount);

contract NftMarketplace is ReentrancyGuard {
    ///////////////////////////
    ////////  Events  /////////
    ///////////////////////////
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ListingCancelled(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed spender
    );
    //ListingUpdated(_nftAddress, _tokenId, _price, oldListing.price)
    event ListingUpdated(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed spender,
        uint256 oldPrice,
        uint256 updatedPrice
    );

    //Listing struct
    struct Listing {
        uint256 price;
        address seller;
    }
    //Mapping between NFT address => NFT token Id => Listing (price, seller)
    mapping(address => mapping(uint256 => Listing)) private s_Listing;

    //Mapping between seller and proceed (NFT value sold)
    mapping(address => uint256) private s_proceeds;

    ///////////////////////////
    ///////  Modifiers ////////
    ///////////////////////////

    modifier notListed(
        address _nftAddress,
        uint256 _tokenId,
        address _seller
    ) {
        Listing memory listing = s_Listing[_nftAddress][_tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(_nftAddress, _tokenId);
        }
        _;
    }

    modifier isListed(address _nftAddress, uint256 _tokenId) {
        Listing memory listing = s_Listing[_nftAddress][_tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(_nftAddress, _tokenId);
        }
        _;
    }

    modifier isOwner(
        address _nftAddress,
        uint256 _tokenId,
        address _spender
    ) {
        IERC721 nft = IERC721(_nftAddress);
        address owner = nft.ownerOf(_tokenId);
        if (_spender != owner) {
            revert NftMarketplace__NotTheNftOwner();
        }
        _;
    }

    modifier hasProceed(address seller) {
        if (s_proceeds[seller] <= 0) {
            revert NftMarketplace__NoProceedsForThisAddress(seller);
        }
        _;
    }

    ///////////////////////////
    ///// Main Functions //////
    ///////////////////////////

    /**
     * @notice Method for listing your NFT to the marketplace
     * @param _nftAddress: address of the NFT contract
     * @param _tokenId: the token ID of the NFT
     * @param _price: the price of  the NFT
     * @dev Technically we could have made the contract to be an escrow, but we made it this way so that
     * people can still keep their NFT in their wallet while listing it in the marketplace by just approving the
     * marketplace as a spender on the NFT
     */
    function listItem(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        notListed(_nftAddress, _tokenId, msg.sender)
        isOwner(_nftAddress, _tokenId, msg.sender)
    {
        if (_price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        // 1. Send the NFT to the NftMarketplace contract, Transfer => Contract hold the NFT
        // 2. Owner can still hold their NFT, and give the marketplace approval to sell the NFT for them
        IERC721 nft = IERC721(_nftAddress);
        if (nft.getApproved(_tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
        s_Listing[_nftAddress][_tokenId] = Listing(_price, msg.sender);

        emit ItemListed(msg.sender, _nftAddress, _tokenId, _price);
    }

    function buyItem(
        address _nftAddress,
        uint256 _tokenId
    ) external payable nonReentrant isListed(_nftAddress, _tokenId) {
        Listing memory listing = s_Listing[_nftAddress][_tokenId];
        if (msg.value < listing.price) {
            revert NftMarketplace__PriceNotMet(_nftAddress, _tokenId, msg.value);
        }
        s_proceeds[listing.seller] += listing.price;
        delete (s_Listing[_nftAddress][_tokenId]);

        IERC721(_nftAddress).safeTransferFrom(listing.seller, msg.sender, _tokenId);

        emit ItemBought(msg.sender, _nftAddress, _tokenId, listing.price);
    }

    function cancelListing(
        address _nftAddress,
        uint256 _tokenId
    ) external isListed(_nftAddress, _tokenId) isOwner(_nftAddress, _tokenId, msg.sender) {
        delete (s_Listing[_nftAddress][_tokenId]);
        emit ListingCancelled(_nftAddress, _tokenId, msg.sender);
    }

    function updateListing(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    ) external isListed(_nftAddress, _tokenId) isOwner(_nftAddress, _tokenId, msg.sender) {
        Listing memory oldListing = s_Listing[_nftAddress][_tokenId];
        s_Listing[_nftAddress][_tokenId].price = _price;

        emit ListingUpdated(_nftAddress, _tokenId, msg.sender, _price, oldListing.price);
    }

    function withdrawProceed() external payable hasProceed(msg.sender) {
        uint256 proceeds = s_proceeds[msg.sender];
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace__TransferFailed(msg.sender, proceeds);
        }
    }

    ///////////////////////////
    //// Getter Functions /////
    ///////////////////////////

    function getListing(
        address _nftAddress,
        uint256 _tokenId
    ) external view returns (Listing memory) {
        return s_Listing[_nftAddress][_tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
