// Raffle

// Enter the lottery (Pay ticket fees)
// Pick a random winner (verifiablly random)
// Winner to be selected every x minutes automatically
// Chainlink Oracle -> Randomness, Automatic execution (Chainlink Keeper)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

/* Errors */
error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle_NotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/**
 * @title A sample raffle contract
 * @author Ahmed Ibrahim
 * @notice This contract is for creating an untamparable decentralized smart contract
 * @dev This implement Chainlink VRF V2 and Chainlink Keepers
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
  enum RaffleState {
    OPEN,
    CALCULATING
  }
  /* State Varriable */
  address payable[] private s_player;
  uint256 private immutable i_entrance_fee;
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  bytes32 private immutable i_gasLane;
  uint64 private immutable i_subscriptionId;
  uint32 private immutable i_callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATION = 3;
  uint32 private constant NUM_WORDS = 1;

  /* Lettery Variables */
  address private s_recentWinner;
  RaffleState private s_raffleState;
  uint256 private s_lastTimeStamp;
  uint256 private immutable i_interval;

  /* Events */
  event RaffleEntered(address indexed player);
  event RequestedRaffleWinner(uint256 indexed requestId);
  event WinnerPicked(address indexed winner);

  /* Functions */
  constructor(
    address vrfCoordinatorV2,
    uint256 _entraceFee,
    bytes32 _gasLane,
    uint64 _subscriptionId,
    uint32 _callbackGasLimit,
    uint256 _interval
  ) VRFConsumerBaseV2(vrfCoordinatorV2) {
    i_entrance_fee = _entraceFee;
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_gasLane = _gasLane;
    i_subscriptionId = _subscriptionId;
    i_callbackGasLimit = _callbackGasLimit;
    s_raffleState = RaffleState.OPEN;
    s_lastTimeStamp = block.timestamp;
    i_interval = _interval;
  }

  function enterRaffle() public payable {
    if (msg.value < i_entrance_fee) {
      revert Raffle__NotEnoughETHEntered();
    }
    if (s_raffleState != RaffleState.OPEN) {
      revert Raffle_NotOpen();
    }
    s_player.push(payable(msg.sender));
    //Emit an event when updating a mapping or array
    emit RaffleEntered(msg.sender);
  }

  /** Upkeep function
   * @dev This is the function that the chainlink Keeper nodes call
   * they look for the 'upkeepNeeded' to return true
   * The following should be true in order to return true 'upkeepNeeded'
   * 1. Our time interval has passed
   * 2. The lottery should hace at least one player, and have some ETH
   * 3. Our subscripttion need to be funded with LINK
   * 4. The lottery should be in "open" state
   */
  function checkUpkeep(
    bytes memory /*checkData*/
  )
    public
    override
    returns (
      bool upkeepNeeeded,
      bytes memory /* performData */
    )
  {
    bool isOpened = s_raffleState == RaffleState.OPEN;
    bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
    bool hasPlayers = s_player.length > 0;
    bool hasBalance = address(this).balance > 0;
    upkeepNeeeded = (isOpened && timePassed && hasPlayers && hasBalance);
  }

  //Pick winner
  function performUpkeep(
    bytes calldata /* performData */
  ) external override {
    // Request random number
    // Once we get it, do something with it
    // 2 transaction process
    (bool upkeepNeeded, ) = checkUpkeep("");
    if (!upkeepNeeded) {
      revert Raffle__UpkeepNotNeeded(
        address(this).balance,
        s_player.length,
        uint256(s_raffleState)
      );
    }
    s_raffleState = RaffleState.CALCULATING;
    uint256 requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane, //gasLane
      i_subscriptionId,
      REQUEST_CONFIRMATION,
      i_callbackGasLimit,
      NUM_WORDS
    );
    emit RequestedRaffleWinner(requestId);
  }

  function fulfillRandomWords(
    uint256, /*requestId*/
    uint256[] memory randomWords
  ) internal override {
    uint256 indexOfWinner = randomWords[0] % s_player.length;
    address payable recentWinner = s_player[indexOfWinner];
    s_recentWinner = recentWinner;
    s_raffleState = RaffleState.OPEN;
    s_player = new address payable[](0);
    s_lastTimeStamp = block.timestamp;
    (bool success, ) = recentWinner.call{value: address(this).balance}("");
    if (!success) {
      revert Raffle__TransferFailed();
    }
    emit WinnerPicked(recentWinner);
  }

  /* Views / Pure functions*/
  function getEntranceFee() public view returns (uint256) {
    return i_entrance_fee;
  }

  function getPlayer(uint256 _index) public view returns (address) {
    return s_player[_index];
  }

  function getRecentWinner() public view returns (address) {
    return s_recentWinner;
  }

  function getNumWords() public pure returns (uint256) {
    return NUM_WORDS;
  }

  function getRaffleState() public view returns (RaffleState) {
    return s_raffleState;
  }

  function getNumberOfPlayer() public view returns (uint256) {
    return s_player.length;
  }

  function getLatestTimestamp() public view returns (uint256) {
    return s_lastTimeStamp;
  }

  function getRequestConfirmation() public pure returns (uint256) {
    return REQUEST_CONFIRMATION;
  }

  function getInterval() public view returns (uint256) {
    return i_interval;
  }
}
