// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MemoryGame
 * @dev A smart contract for a memory game where users can submit scores and claim rewards.
 */
contract MemoryGame is Ownable {
    
    struct Score {
        address player;
        uint256 value;
        uint256 timestamp;
    }

    Score[] public scores;
    mapping(address => uint256) public highestScore;
    mapping(address => bool) public hasClaimedReward;

    uint256 public rewardAmount;
    uint256 public minScoreForReward;

    event ScoreSubmitted(address indexed player, uint256 score);
    event RewardClaimed(address indexed player, uint256 amount);
    event RewardAmountSet(uint256 newAmount);
    event MinScoreSet(uint256 newMinScore);
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(uint256 _initialRewardAmount, uint256 _initialMinScore) Ownable(msg.sender) {
        rewardAmount = _initialRewardAmount;
        minScoreForReward = _initialMinScore;
    }

    /**
     * @dev Allows players to submit their score.
     * Only the player's highest score is stored to prevent spam.
     */
    function submitScore(uint256 _score) external {
        if (_score > highestScore[msg.sender]) {
            highestScore[msg.sender] = _score;
            scores.push(Score(msg.sender, _score, block.timestamp));
            emit ScoreSubmitted(msg.sender, _score);
        }
    }

    /**
     * @dev Allows players to claim a reward if their score is high enough.
     * A player can only claim once.
     */
    function claimReward() external {
        require(highestScore[msg.sender] >= minScoreForReward, "Score not high enough to claim reward");
        require(!hasClaimedReward[msg.sender], "Reward already claimed");
        require(address(this).balance >= rewardAmount, "Contract has insufficient funds for reward");

        hasClaimedReward[msg.sender] = true;
        (bool success, ) = msg.sender.call{value: rewardAmount}("");
        require(success, "Failed to send reward");

        emit RewardClaimed(msg.sender, rewardAmount);
    }

    /**
     * @dev Returns the top N scores.
     * Note: This function can be gas-intensive if the scores array is very large.
     * For production DApps with many users, consider off-chain sorting.
     */
    function getTopScores(uint256 _count) external view returns (Score[] memory) {
        uint256 totalScores = scores.length;
        if (_count > totalScores) {
            _count = totalScores;
        }
        
        Score[] memory allScores = scores;
        Score[] memory topScores = new Score[](_count);

        // Simple bubble sort - not gas efficient for large arrays
        for (uint256 i = 0; i < totalScores - 1; i++) {
            for (uint256 j = 0; j < totalScores - i - 1; j++) {
                if (allScores[j].value < allScores[j + 1].value) {
                    Score memory temp = allScores[j];
                    allScores[j] = allScores[j + 1];
                    allScores[j + 1] = temp;
                }
            }
        }

        for (uint256 i = 0; i < _count; i++) {
            topScores[i] = allScores[i];
        }

        return topScores;
    }

    // --- Admin Functions ---

    /**
     * @dev Sets the minimum score required to claim a reward. Only owner.
     */
    function setMinScore(uint256 _newMinScore) external onlyOwner {
        minScoreForReward = _newMinScore;
        emit MinScoreSet(_newMinScore);
    }

    /**
     * @dev Sets the reward amount. Only owner.
     */
    function setRewardAmount(uint256 _newAmount) external onlyOwner {
        rewardAmount = _newAmount;
        emit RewardAmountSet(_newAmount);
    }

    /**
     * @dev Allows the owner to deposit ETH into the contract to fund rewards.
     */
    function deposit() external payable onlyOwner {
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @dev Allows the owner to withdraw a specific amount of ETH from the contract.
     */
    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Cannot withdraw more than balance");
        (bool success, ) = owner().call{value: _amount}("");
        require(success, "Withdrawal failed");
        emit Withdrawn(owner(), _amount);
    }

    /**
     * @dev Fallback function to receive ETH.
     */
    receive() external payable {}

    /**
     * @dev Fallback function to receive ETH.
     */
    fallback() external payable {}
}