// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MemoryGame
 * @dev Contract for a memory game with difficulty levels, play fees, and rewards.
 */
contract MemoryGame is Ownable {
    
    // Enum untuk tingkat kesulitan
    enum Difficulty { Easy, Medium, Hard }

    // Struct untuk menyimpan data skor
    struct Score {
        address player;
        uint256 value;
        uint256 timestamp;
        Difficulty difficulty; // Menyimpan tingkat kesulitan saat skor dibuat
    }

    Score[] public scores;
    
    // Mapping untuk menyimpan skor tertinggi pemain per tingkat kesulitan
    mapping(address => mapping(Difficulty => uint256)) public highestScore;
    // Mapping untuk menyimpan status klaim hadiah pemain per tingkat kesulitan
    mapping(address => mapping(Difficulty => bool)) public hasClaimedReward;

    // Mapping untuk menyimpan jumlah hadiah per tingkat kesulitan
    mapping(Difficulty => uint256) public rewardAmounts;
    
    uint256 public minScoreForReward;
    uint256 public playFee;

    // Events
    event PaymentReceived(address indexed player, uint256 amount);
    event ScoreSubmitted(address indexed player, uint256 score, Difficulty difficulty);
    event RewardClaimed(address indexed player, uint256 amount, Difficulty difficulty);
    // (Event lain yang sudah ada sebelumnya)
    event RewardAmountSet(Difficulty difficulty, uint256 newAmount);
    event MinScoreSet(uint256 newMinScore);
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(uint256 _initialMinScore, uint256 _initialPlayFee) Ownable(msg.sender) {
        minScoreForReward = _initialMinScore;
        playFee = _initialPlayFee;
        
        // Atur jumlah hadiah awal untuk setiap tingkat kesulitan
        rewardAmounts[Difficulty.Easy] = 0.5 ether;
        rewardAmounts[Difficulty.Medium] = 1 ether;
        rewardAmounts[Difficulty.Hard] = 1.5 ether;
    }

    /**
     * @dev Fungsi yang dipanggil pemain untuk membayar biaya permainan.
     */
    function play() external payable {
        require(msg.value == playFee, "MemoryGame: Incorrect play fee.");
        emit PaymentReceived(msg.sender, msg.value);
    }

    /**
     * @dev Mengizinkan pemain untuk mengirimkan skor mereka untuk tingkat kesulitan tertentu.
     */
    function submitScore(uint256 _score, Difficulty _difficulty) external {
        if (_score > highestScore[msg.sender][_difficulty]) {
            highestScore[msg.sender][_difficulty] = _score;
            scores.push(Score(msg.sender, _score, block.timestamp, _difficulty));
            emit ScoreSubmitted(msg.sender, _score, _difficulty);
        }
    }

    /**
     * @dev Mengizinkan pemain untuk mengklaim hadiah untuk tingkat kesulitan tertentu.
     */
    function claimReward(Difficulty _difficulty) external {
        uint256 reward = rewardAmounts[_difficulty];
        require(highestScore[msg.sender][_difficulty] >= minScoreForReward, "Score not high enough for this difficulty");
        require(!hasClaimedReward[msg.sender][_difficulty], "Reward for this difficulty already claimed");
        require(address(this).balance >= reward, "Contract has insufficient funds for this reward");

        hasClaimedReward[msg.sender][_difficulty] = true;
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Failed to send reward");

        emit RewardClaimed(msg.sender, reward, _difficulty);
    }
    
    /**
     * @dev Mengembalikan N skor teratas dari semua permainan.
     */
    function getTopScores(uint256 _count) external view returns (Score[] memory) {
        uint256 totalScores = scores.length;
        if (_count > totalScores) {
            _count = totalScores;
        }
        
        Score[] memory allScores = scores;
        Score[] memory topScores = new Score[](_count);

        // Bubble sort sederhana (catatan: tidak efisien untuk gas pada array besar)
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

    function setPlayFee(uint256 _newFee) external onlyOwner {
        playFee = _newFee;
    }

    function setRewardAmount(Difficulty _difficulty, uint256 _newAmount) external onlyOwner {
        rewardAmounts[_difficulty] = _newAmount;
        emit RewardAmountSet(_difficulty, _newAmount);
    }
    
    function setMinScore(uint256 _newMinScore) external onlyOwner {
        minScoreForReward = _newMinScore;
        emit MinScoreSet(_newMinScore);
    }

    function deposit() external payable onlyOwner {
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Cannot withdraw more than balance");
        (bool success, ) = owner().call{value: _amount}("");
        require(success, "Withdrawal failed");
        emit Withdrawn(owner(), _amount);
    }

    // --- Fallback Functions ---
    receive() external payable {}
    fallback() external payable {}
}