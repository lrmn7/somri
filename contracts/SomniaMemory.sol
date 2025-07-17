// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SomniaMemory is Ownable {
    
    enum Difficulty { Easy, Medium, Hard }

    struct PlayerScore {
        address player;
        uint256 score;
    }

    mapping(address => uint256) public totalScore;
    address[] public players;
    mapping(address => bool) private isPlayer;
    mapping(address => mapping(Difficulty => bool)) public hasClaimedReward;
    mapping(Difficulty => uint256) public rewardAmounts;
    uint256 public minScoreForReward;
    uint256 public playFee = 0.001 ether;

    event PaymentReceived(address indexed player, uint256 amount);
    event ScoreSubmitted(address indexed player, uint256 newScore, uint256 totalScore);
    event RewardClaimed(address indexed player, uint256 amount, Difficulty difficulty);
    event PlayFeeSet(uint256 newFee);
    event RewardAmountSet(Difficulty difficulty, uint256 newAmount);
    event MinScoreSet(uint256 newMinScore);
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(uint256 _initialMinScore) Ownable(msg.sender) {
        minScoreForReward = _initialMinScore;
        rewardAmounts[Difficulty.Easy] = 0.5 ether;
        rewardAmounts[Difficulty.Medium] = 1 ether;
        rewardAmounts[Difficulty.Hard] = 1.5 ether;
    }

    function play() external payable {
        require(msg.value == playFee, "SomniaMemory: Incorrect play fee.");
        emit PaymentReceived(msg.sender, msg.value);
    }

    function submitScore(uint256 _score) external {
        totalScore[msg.sender] += _score;
        if (!isPlayer[msg.sender]) {
            players.push(msg.sender);
            isPlayer[msg.sender] = true;
        }
        emit ScoreSubmitted(msg.sender, _score, totalScore[msg.sender]);
    }

    function claimReward(Difficulty _difficulty) external {
        uint256 reward = rewardAmounts[_difficulty];
        require(totalScore[msg.sender] >= minScoreForReward, "Total score not high enough");
        require(!hasClaimedReward[msg.sender][_difficulty], "Reward for this difficulty already claimed");
        require(address(this).balance >= reward, "Insufficient funds");
        hasClaimedReward[msg.sender][_difficulty] = true;
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Failed to send reward");
        emit RewardClaimed(msg.sender, reward, _difficulty);
    }
    
    function getTopScores(uint256 _count) external view returns (address[] memory, uint256[] memory) {
        uint256 playerCount = players.length;
        if (_count > playerCount) { _count = playerCount; }
        PlayerScore[] memory tempScores = new PlayerScore[](playerCount);
        for (uint256 i = 0; i < playerCount; i++) {
            tempScores[i] = PlayerScore(players[i], totalScore[players[i]]);
        }
        for (uint256 i = 0; i < playerCount - 1; i++) {
            for (uint256 j = 0; j < playerCount - i - 1; j++) {
                if (tempScores[j].score < tempScores[j + 1].score) {
                    PlayerScore memory temp = tempScores[j];
                    tempScores[j] = tempScores[j + 1];
                    tempScores[j + 1] = temp;
                }
            }
        }
        address[] memory topPlayers = new address[](_count);
        uint256[] memory topScoresList = new uint256[](_count);
        for (uint256 i = 0; i < _count; i++) {
            topPlayers[i] = tempScores[i].player;
            topScoresList[i] = tempScores[i].score;
        }
        return (topPlayers, topScoresList);
    }

    // --- Admin Functions ---
    function setPlayFee(uint256 _newFee) external onlyOwner { playFee = _newFee; }
    function setRewardAmount(Difficulty _difficulty, uint256 _newAmount) external onlyOwner { rewardAmounts[_difficulty] = _newAmount; }
    function setMinScore(uint256 _newMinScore) external onlyOwner { minScoreForReward = _newMinScore; }
    function deposit() external payable onlyOwner {}
    function withdraw(uint256 _amount) external onlyOwner { require(_amount <= address(this).balance, "Cannot withdraw more than balance"); (bool success, ) = owner().call{value: _amount}(""); require(success, "Withdrawal failed"); }
    receive() external payable {}
    fallback() external payable {}
}