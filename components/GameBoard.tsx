"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "./Card";
import { ClaimReward } from "./ClaimReward";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import toast from "react-hot-toast";
import { WalletButton } from "./WalletButton";
import { contractConfig } from "@/lib/config";
import { parseEther } from "viem";

// ... (const cardImages, types, dan fungsi helper lainnya tetap sama) ...
const cardImages = [
  { id: 1, name: "1.png" },
  { id: 2, name: "2.png" },
  { id: 3, name: "3.png" },
  { id: 4, name: "4.png" },
  { id: 5, name: "5.png" },
  { id: 6, name: "6.png" },
  { id: 7, name: "7.png" },
  { id: 8, name: "8.png" },
  { id: 9, name: "9.png" },
  { id: 10, name: "10.png" },
  { id: 11, name: "11.png" },
  { id: 12, name: "12.png" },
  { id: 13, name: "13.png" },
  { id: 14, name: "14.png" },
  { id: 15, name: "15.png" },
  { id: 16, name: "16.png" },
  { id: 17, name: "17.png" },
  { id: 18, name: "18.png" },
  { id: 19, name: "19.png" },
  { id: 20, name: "20.png" },
];
type CardType = {
  id: number;
  uniqueId: number;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
};
enum Difficulty {
  Easy,
  Medium,
  Hard,
}
const difficultySettings = {
  [Difficulty.Easy]: { pairs: 4, grid: "grid-cols-4" },
  [Difficulty.Medium]: { pairs: 6, grid: "grid-cols-4" },
  [Difficulty.Hard]: { pairs: 8, grid: "grid-cols-6" },
};
const createShuffledDeck = (pairCount: number): CardType[] => {
  const shuffledImages = [...cardImages].sort(() => 0.5 - Math.random());
  const neededCards = shuffledImages.slice(0, pairCount);
  const duplicatedCards = [...neededCards, ...neededCards];
  return duplicatedCards
    .map((card, index) => ({
      id: card.id,
      uniqueId: index,
      imageUrl: `/cards/${card.name}`,
      isFlipped: false,
      isMatched: false,
    }))
    .sort(() => Math.random() - 0.5);
};
const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

export function GameBoard() {
  type GamePhase =
    | "difficulty_select"
    | "payment"
    | "countdown"
    | "playing"
    | "won";
  const [gamePhase, setGamePhase] = useState<GamePhase>("difficulty_select");
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [countdown, setCountdown] = useState(3);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [missedCards, setMissedCards] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { isConnected } = useAccount();

  // ✨ Pisahkan hook untuk setiap aksi agar statusnya tidak tumpang tindih
  const {
    data: payHash,
    writeContract: payToPlay,
    isPending: isPaying,
  } = useWriteContract();
  const {
    data: scoreHash,
    writeContract: submitScore,
    isPending: isSubmitting,
  } = useWriteContract();

  const { isLoading: isConfirmingPayment, isSuccess: hasPaid } =
    useWaitForTransactionReceipt({ hash: payHash });
  const { isLoading: isConfirmingScore, isSuccess: isSubmitted } =
    useWaitForTransactionReceipt({ hash: scoreHash });

  const playSound = (sound: "flip" | "match" | "win" | "miss") => {
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.volume = 0.3;
    audio.play();
  };

  const setupGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setCards(createShuffledDeck(difficultySettings[selectedDifficulty].pairs));
    setGamePhase("payment");
  };
  const resetGame = useCallback(() => {
    setGamePhase("difficulty_select");
    setFlippedCards([]);
    setMissedCards([]);
    setAttempts(0);
    setFinalScore(0);
    setElapsedTime(0);
    setCountdown(3);
  }, []);

  useEffect(() => {
    setCards(createShuffledDeck(difficultySettings[Difficulty.Easy].pairs));
  }, []);
  useEffect(() => {
    if (hasPaid) {
      toast.success("Payment successful!");
      setGamePhase("countdown");
    }
  }, [hasPaid]);
  useEffect(() => {
    if (gamePhase === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === "countdown" && countdown === 0) {
      setGamePhase("playing");
    }
  }, [gamePhase, countdown]);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gamePhase === "playing") {
      timer = setInterval(
        () => setElapsedTime((prevTime) => prevTime + 1),
        1000
      );
    }
    return () => clearInterval(timer);
  }, [gamePhase]);
  const handleCardClick = (uniqueId: number) => {
    if (
      gamePhase !== "playing" ||
      flippedCards.length === 2 ||
      flippedCards.includes(uniqueId)
    )
      return;
    playSound("flip");
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.uniqueId === uniqueId ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards((prev) => [...prev, uniqueId]);
  };
  useEffect(() => {
    if (gamePhase !== "playing" || flippedCards.length !== 2) return;
    const [firstId, secondId] = flippedCards;
    const firstCard = cards.find((c) => c.uniqueId === firstId);
    const secondCard = cards.find((c) => c.uniqueId === secondId);
    if (!firstCard || !secondCard) return;
    const checkTimeout = setTimeout(() => {
      setAttempts((prev) => prev + 1);
      if (firstCard.id === secondCard.id) {
        playSound("match");
        setCards((currentCards) =>
          currentCards.map((card) =>
            card.uniqueId === firstId || card.uniqueId === secondId
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedCards([]);
      } else {
        playSound("miss");
        setMissedCards([firstId, secondId]);
        const flipBackTimeout = setTimeout(() => {
          setCards((currentCards) =>
            currentCards.map((card) =>
              card.uniqueId === firstId || card.uniqueId === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setMissedCards([]);
        }, 1200);
        return () => clearTimeout(flipBackTimeout);
      }
    }, 600);
    return () => clearTimeout(checkTimeout);
  }, [flippedCards, cards, gamePhase]);
  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every((c) => c.isMatched);
    if (gamePhase === "playing" && allMatched) {
      playSound("win");
      setGamePhase("won");
      const score = Math.max(10000 - elapsedTime * 10 - attempts * 50, 100);
      setFinalScore(score);
      toast.success(`You won! Your score is ${score}.`);
    }
  }, [cards, gamePhase, elapsedTime, attempts]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`grid ${difficultySettings[difficulty].grid} gap-4`}>
          {cards.map((card, index) => (
            <Card
              key={index}
              {...card}
              onCardClick={handleCardClick}
              isMissed={missedCards.includes(card.uniqueId)}
            />
          ))}
        </div>
        {gamePhase !== "playing" && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg z-10 backdrop-blur-sm text-white p-4 text-center">
            {!isConnected ? (
              <>
                {" "}
                <h2 className="text-3xl font-bold mb-4">
                  Connect Wallet to Play
                </h2>{" "}
                <WalletButton />{" "}
              </>
            ) : gamePhase === "difficulty_select" ? (
              <>
                {" "}
                <h2 className="text-3xl font-bold mb-6">
                  Choose Difficulty
                </h2>{" "}
                <div className="flex flex-wrap justify-center gap-4">
                  {" "}
                  <button
                    onClick={() => setupGame(Difficulty.Easy)}
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold"
                  >
                    Easy (8 Cards)
                  </button>{" "}
                  <button
                    onClick={() => setupGame(Difficulty.Medium)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-bold"
                  >
                    Medium (12 Cards)
                  </button>{" "}
                  <button
                    onClick={() => setupGame(Difficulty.Hard)}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold"
                  >
                    Hard (16 Cards)
                  </button>{" "}
                </div>{" "}
              </>
            ) : gamePhase === "payment" ? (
              <>
                {" "}
                <h2 className="text-3xl font-bold mb-2">Ready to Play?</h2>{" "}
                <p className="mb-4">Pay 0.001 ETH to start.</p>
                {/* ✨ Tombol Pembayaran Diperbarui */}
                <button
                  onClick={() =>
                    payToPlay({
                      ...contractConfig,
                      functionName: "play",
                      value: parseEther("0.001"),
                    })
                  }
                  disabled={isPaying || isConfirmingPayment}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 font-bold py-3 px-8 rounded-lg text-xl"
                >
                  {isPaying
                    ? "Confirm in wallet..."
                    : isConfirmingPayment
                    ? "Processing payment..."
                    : "Pay & Play"}
                </button>
              </>
            ) : gamePhase === "countdown" ? (
              <div className="text-9xl font-bold animate-ping">{countdown}</div>
            ) : gamePhase === "won" ? (
              <div className="w-full max-w-md">
                <h2 className="text-4xl font-bold text-green-400 mb-2">
                  Congratulations!
                </h2>
                <p className="text-xl mb-4">
                  Your final score:{" "}
                  <span className="font-bold text-yellow-300">
                    {finalScore}
                  </span>
                </p>
                {/* ✨ Tombol Submit Skor Diperbarui */}
                {!isSubmitted ? (
                  <button
                    onClick={() =>
                      submitScore({
                        ...contractConfig,
                        functionName: "submitScore",
                        args: [BigInt(finalScore), difficulty],
                      })
                    }
                    disabled={isSubmitting || isConfirmingScore}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 font-bold py-3 px-6 rounded-lg text-lg"
                  >
                    {isSubmitting
                      ? "Confirm in wallet..."
                      : isConfirmingScore
                      ? "Submitting to blockchain..."
                      : "Submit Score"}
                  </button>
                ) : (
                  <div className="mt-4">
                    {" "}
                    <p className="text-green-400 mb-2 font-semibold">
                      ✅ Score Submitted!
                    </p>{" "}
                    <ClaimReward
                      userScore={finalScore}
                      difficulty={difficulty}
                    />{" "}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex gap-8 text-lg mt-8 mb-4 bg-gray-800 px-6 py-3 rounded-lg">
        {" "}
        <div>
          Attempts:{" "}
          <span className="font-bold text-yellow-300">{attempts}</span>
        </div>{" "}
        <div>
          Time:{" "}
          <span className="font-bold text-yellow-300">
            {formatTime(elapsedTime)}
          </span>
        </div>{" "}
      </div>
      {gamePhase !== "difficulty_select" && (
        <button
          onClick={resetGame}
          className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Menu
        </button>
      )}
    </div>
  );
}
