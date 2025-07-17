"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/Card";
import { ClaimReward } from "@/components/ClaimReward";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import toast from "react-hot-toast";
import { WalletButton } from "@/components/WalletButton";
import { contractConfig } from "@/lib/config";
import { parseEther } from "viem";
import { LeaderboardTable } from "@/components/LeaderboardTable";

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
  { id: 21, name: "21.png" },
  { id: 22, name: "22.png" },
  { id: 23, name: "23.png" },
  { id: 24, name: "24.png" },
  { id: 25, name: "25.png" },
  { id: 26, name: "26.png" },
  { id: 27, name: "27.png" },
  { id: 28, name: "28.png" },
  { id: 29, name: "29.png" },
  { id: 30, name: "30.png" },
  { id: 31, name: "31.png" },
  { id: 32, name: "32.png" },
  { id: 33, name: "33.png" },
  { id: 34, name: "34.png" },
  { id: 35, name: "35.png" },
  { id: 36, name: "36.png" },
  { id: 37, name: "37.png" },
  { id: 38, name: "38.png" },
  { id: 39, name: "39.png" },
  { id: 40, name: "40.png" },
  { id: 41, name: "41.png" },
  { id: 42, name: "42.png" },
  { id: 43, name: "43.png" },
  { id: 44, name: "44.png" },
  { id: 45, name: "45.png" },
  { id: 46, name: "46.png" },
  { id: 47, name: "47.png" },
  { id: 48, name: "48.png" },
  { id: 49, name: "49.png" },
  { id: 50, name: "50.png" },
  { id: 51, name: "51.png" },
  { id: 52, name: "52.png" },
  { id: 53, name: "53.png" },
  { id: 54, name: "54.png" },
  { id: 55, name: "55.png" },
  { id: 56, name: "56.png" },
  { id: 57, name: "57.png" },
  { id: 58, name: "58.png" },
  { id: 59, name: "59.png" },
  { id: 60, name: "60.png" },
  { id: 61, name: "61.png" },
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
  [Difficulty.Easy]: {
    pairs: { mobile: 3, desktop: 4 },
    grid: "grid-cols-3 sm:grid-cols-4",
  },
  [Difficulty.Medium]: {
    pairs: { mobile: 6, desktop: 6 },
    grid: "grid-cols-3 sm:grid-cols-4",
  },
  [Difficulty.Hard]: {
    pairs: { mobile: 9, desktop: 9 },
    grid: "grid-cols-3 sm:grid-cols-4 md:grid-cols-6",
  },
};
const scoreSettings = {
  [Difficulty.Easy]: { maxScore: 500, timePenalty: 2, attemptPenalty: 10 },
  [Difficulty.Medium]: { maxScore: 1000, timePenalty: 5, attemptPenalty: 15 },
  [Difficulty.Hard]: { maxScore: 1500, timePenalty: 9, attemptPenalty: 20 },
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

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  const {
    data: payHash,
    writeContract: payToPlay,
    isPending: isPaying,
    reset: resetPay,
  } = useWriteContract();
  const {
    data: scoreHash,
    writeContract: submitScore,
    isPending: isSubmitting,
    reset: resetSubmitScore,
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

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed for mobile
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial value
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const setupGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const pairCount = isMobile
      ? difficultySettings[selectedDifficulty].pairs.mobile
      : difficultySettings[selectedDifficulty].pairs.desktop;
    setCards(createShuffledDeck(pairCount));
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
    resetPay();
    resetSubmitScore();
  }, [resetPay, resetSubmitScore]);

  useEffect(() => {
    const initialPairCount = isMobile
      ? difficultySettings[Difficulty.Easy].pairs.mobile
      : difficultySettings[Difficulty.Easy].pairs.desktop;
    setCards(createShuffledDeck(initialPairCount));
  }, [isMobile]); // Re-shuffle on mobile state change

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
    if (isMounted && isConnected && gamePhase === "playing") {
      timer = setInterval(
        () => setElapsedTime((prevTime) => prevTime + 1),
        1000
      );
    }
    return () => clearInterval(timer);
  }, [gamePhase, isConnected, isMounted]);

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
        }, 600);
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
      const settings = scoreSettings[difficulty];
      const calculatedScore =
        settings.maxScore -
        elapsedTime * settings.timePenalty -
        attempts * settings.attemptPenalty;
      const finalCalculatedScore = Math.max(calculatedScore, 50);
      setFinalScore(finalCalculatedScore);
      toast.success(`You won! Your score is ${finalCalculatedScore}.`);
    }
  }, [cards, gamePhase, elapsedTime, attempts, difficulty]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center px-4 mt-8 lg:mt-20">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-orange bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          SOMNIA MEMORY
        </h1>
        <p className="mt-4 text-md md:text-lg text-gray-400">
          Just flip, match, and have fun! Rewards will follow!
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center w-full">
        <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
          {gamePhase === "playing" && (
            <div className="flex gap-8 text-lg bg-transparent px-6 py-3 rounded-lg w-full justify-center">
              <div>
                Attempts:{" "}
                <span className="font-bold text-yellow-300">{attempts}</span>
              </div>
              <div>
                Time:{" "}
                <span className="font-bold text-yellow-300">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>
          )}

          <div className="relative rounded-lg overflow-hidden">
            <div
              className={`grid ${difficultySettings[difficulty].grid} gap-2 sm:gap-4`}
            >
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
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-10 backdrop-blur-sm text-white p-4 text-center">
                {!isConnected ? (
                  <>
                    {" "}
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Connect Wallet to Play
                    </h2>{" "}
                    <WalletButton />{" "}
                  </>
                ) : gamePhase === "difficulty_select" ? (
                  <>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">
                      Pick Card Count
                    </h2>
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                      <button
                        onClick={() => setupGame(Difficulty.Easy)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-1.5 sm:px-5 sm:py-2 text-sm rounded-lg font-bold"
                      >
                        Easy (
                        {isMobile
                          ? difficultySettings[Difficulty.Easy].pairs.mobile * 2
                          : difficultySettings[Difficulty.Easy].pairs
                              .desktop * 2}{" "}
                        Cards)
                      </button>
                      <button
                        onClick={() => setupGame(Difficulty.Medium)}
                        className="bg-yellow-600 hover:bg-yellow-700 px-4 py-1.5 sm:px-5 sm:py-2 text-sm rounded-lg font-bold"
                      >
                        Medium (
                        {isMobile
                          ? difficultySettings[Difficulty.Medium].pairs.mobile *
                            2
                          : difficultySettings[Difficulty.Medium].pairs
                              .desktop * 2}{" "}
                        Cards)
                      </button>
                      <button
                        onClick={() => setupGame(Difficulty.Hard)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-1.5 sm:px-5 sm:py-2 text-sm rounded-lg font-bold"
                      >
                        Hard (
                        {isMobile
                          ? difficultySettings[Difficulty.Hard].pairs.mobile * 2
                          : difficultySettings[Difficulty.Hard].pairs
                              .desktop * 2}{" "}
                        Cards)
                      </button>
                    </div>
                  </>
                ) : gamePhase === "payment" ? (
                  <>
                    {" "}
                    <p className="mb-4 text-sm text-gray-400">
                      Fee 0.001 STT
                    </p>{" "}
                    <button
                      onClick={() =>
                        payToPlay({
                          ...contractConfig,
                          functionName: "play",
                          value: parseEther("0.001"),
                        })
                      }
                      disabled={isPaying || isConfirmingPayment}
                      className="bg-brand-orange hover:bg-orange-600 disabled:bg-gray-500 font-bold px-4 py-1.5 rounded-lg text-xl"
                    >
                      {" "}
                      {isPaying
                        ? "Confirm..."
                        : isConfirmingPayment
                        ? "Processing..."
                        : "Ready to Play?"}{" "}
                    </button>{" "}
                  </>
                ) : gamePhase === "countdown" ? (
                  <div className="text-9xl font-bold animate-ping">
                    {countdown}
                  </div>
                ) : gamePhase === "won" ? (
                  <div className="w-full max-w-md">
                    <h2 className="text-2xl md:text-4xl font-bold text-brand-orange mb-2">
                      Congratulations!
                    </h2>
                    <p className="text-lg md:text-xl mb-4">
                      Your final score:{" "}
                      <span className="font-bold text-yellow-300">
                        {finalScore}
                      </span>
                    </p>
                    {!isSubmitted ? (
                      <button
                        onClick={() =>
                          submitScore({
                            ...contractConfig,
                            functionName: "submitScore",
                            args: [BigInt(finalScore)],
                          })
                        }
                        disabled={isSubmitting || isConfirmingScore}
                        className="bg-brand-orange hover:bg-brand-orange-600 disabled:bg-gray-500 font-bold px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg text-lg"
                      >
                        {" "}
                        {isSubmitting
                          ? "Confirm..."
                          : isConfirmingScore
                          ? "Submitting..."
                          : "Submit Score"}{" "}
                      </button>
                    ) : (
                      <div className="mt-4">
                        {" "}
                        <p className="text-brand-orange mb-2 font-semibold">
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
          {gamePhase !== "difficulty_select" && (
            <button
              onClick={resetGame}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-brand-orange font-bold py-2 px-4 rounded"
            >
              Back to Menu
            </button>
          )}
        </div>
<div className="w-full lg:max-w-md flex-shrink-0">
  <h2 className="text-3xl text-brand-orange font-bold text-center mb-4">
    Leaderboard
  </h2>

  {/* reward explanation */}
  <p className="text-sm text-gray-400 text-center mb-2">
    🎯 Reach at least <span className="font-semibold text-brand-orange">1000 points</span> to claim rewards
    <br />
    Easy: <span className="text-brand-orange">1 STT</span>, Medium: <span className="text-brand-orange">1.5 STT</span>, Hard: <span className="text-brand-orange">2 STT</span>
  </p>

  <LeaderboardTable />
</div>

      </div>
    </div>
  );
}