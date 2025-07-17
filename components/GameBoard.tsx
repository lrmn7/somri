"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card } from './Card';
import { ClaimReward } from './ClaimReward';
import { useWriteMemoryGame } from '@/hooks/useMemoryGameContract';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { WalletButton } from './WalletButton';
import { parseEther } from 'viem';

// ... (const cardImages, type CardType, createShuffledDeck tetap sama) ...
const cardImages = [ { id: 1, name: '1.png' }, { id: 2, name: '2.png' }, { id: 3, name: '3.png' }, { id: 4, name: '4.png' }, { id: 5, name: '5.png' }, { id: 6, name: '6.png' }, ];
type CardType = { id: number; uniqueId: number; imageUrl: string; isFlipped: boolean; isMatched: boolean; };
const createShuffledDeck = (): CardType[] => { const duplicatedCards = [...cardImages, ...cardImages]; return duplicatedCards .map((card, index) => ({ id: card.id, uniqueId: index, imageUrl: `/cards/${card.name}`, isFlipped: false, isMatched: false, })) .sort(() => Math.random() - 0.5); };
const formatTime = (totalSeconds: number): string => { const minutes = Math.floor(totalSeconds / 60); const seconds = totalSeconds % 60; return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; };

export function GameBoard() {
  // ✨ State baru untuk mengontrol alur permainan
  type GamePhase = 'initial' | 'countdown' | 'playing' | 'won';
  const [gamePhase, setGamePhase] = useState<GamePhase>('initial');
  const [countdown, setCountdown] = useState(3);

  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [missedCards, setMissedCards] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { isConnected } = useAccount();

  // Hook untuk fungsi 'play' dari smart contract
  const { execute: payToPlay, isPending: isPaying, isConfirmed: hasPaid } = useWriteMemoryGame("play");
  
  // ... (playSound, submitScore tetap sama) ...
  const playSound = (sound: 'flip' | 'match' | 'win' | 'miss') => { const audio = new Audio(`/sounds/${sound}.mp3`); audio.volume = 0.3; audio.play(); };
  const { execute: submitScore, isPending: isSubmitting, isConfirmed: isSubmitted } = useWriteMemoryGame("submitScore");

  const resetGame = useCallback(() => {
    setCards(createShuffledDeck());
    setFlippedCards([]);
    setMissedCards([]);
    setAttempts(0);
    setGamePhase('initial'); // Kembali ke tahap awal
    setFinalScore(0);
    setElapsedTime(0);
    setCountdown(3);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  // Efek untuk memulai countdown setelah pembayaran berhasil
  useEffect(() => {
    if (hasPaid) {
      toast.success("Payment successful! The game will begin shortly.");
      setGamePhase('countdown');
    }
  }, [hasPaid]);

  // Efek untuk menjalankan countdown
  useEffect(() => {
    if (gamePhase !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGamePhase('playing');
    }
  }, [gamePhase, countdown]);

  // Efek untuk menjalankan timer permainan
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gamePhase === 'playing') {
      timer = setInterval(() => setElapsedTime(prevTime => prevTime + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gamePhase]);

  // ... (handleCardClick, useEffects lain disesuaikan agar hanya berjalan saat 'playing') ...
  const handleCardClick = (uniqueId: number) => {
    if (gamePhase !== 'playing' || flippedCards.length === 2 || flippedCards.includes(uniqueId)) return;
    playSound('flip');
    setCards(currentCards => currentCards.map(card => card.uniqueId === uniqueId ? { ...card, isFlipped: true } : card));
    setFlippedCards(prev => [...prev, uniqueId]);
  };

  useEffect(() => {
    if (gamePhase !== 'playing' || flippedCards.length !== 2) return;
    // ... sisa logika pengecekan match/miss tetap sama
    const [firstId, secondId] = flippedCards; const firstCard = cards.find(c => c.uniqueId === firstId); const secondCard = cards.find(c => c.uniqueId === secondId); if (!firstCard || !secondCard) return; const checkTimeout = setTimeout(() => { setAttempts(prev => prev + 1); if (firstCard.id === secondCard.id) { playSound('match'); setCards(currentCards => currentCards.map(card => card.uniqueId === firstId || card.uniqueId === secondId ? { ...card, isMatched: true } : card)); setFlippedCards([]); } else { playSound('miss'); setMissedCards([firstId, secondId]); const flipBackTimeout = setTimeout(() => { setCards(currentCards => currentCards.map(card => card.uniqueId === firstId || card.uniqueId === secondId ? { ...card, isFlipped: false } : card)); setFlippedCards([]); setMissedCards([]); }, 1200); return () => clearTimeout(flipBackTimeout); } }, 600); return () => clearTimeout(checkTimeout);
  }, [flippedCards, cards, gamePhase]);

  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every(c => c.isMatched);
    if (gamePhase === 'playing' && allMatched) {
      playSound('win');
      setGamePhase('won');
      const score = Math.max(10000 - (elapsedTime * 10) - (attempts * 50), 100);
      setFinalScore(score);
      toast.success(`You won! Your score is ${score}.`);
    }
  }, [cards, gamePhase, elapsedTime, attempts]);

  const handlePlayButtonClick = () => {
    payToPlay(undefined, '0.001');
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="grid grid-cols-4 gap-4">
          {cards.map(card => (
            <Card key={card.uniqueId} {...card} onCardClick={handleCardClick} isMissed={missedCards.includes(card.uniqueId)}/>
          ))}
        </div>

        {/* --- OVERLAY UTAMA UNTUK SEMUA TAHAPAN --- */}
        {gamePhase !== 'playing' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg z-10 backdrop-blur-sm text-white">
            {!isConnected ? (
              <>
                <p className="text-2xl font-bold mb-4">Connect Your Wallet to Play</p>
                <WalletButton />
              </>
            ) : gamePhase === 'initial' ? (
              <>
                <h2 className="text-3xl font-bold mb-2">Ready to Play?</h2>
                <p className="mb-4">Pay 0.001 ETH to start the game.</p>
                <button 
                  onClick={handlePlayButtonClick} 
                  disabled={isPaying}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors"
                >
                  {isPaying ? 'Processing Payment...' : 'Play Now'}
                </button>
              </>
            ) : gamePhase === 'countdown' ? (
              <div className="text-8xl font-bold animate-ping">{countdown}</div>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex gap-8 text-lg mt-8 mb-4 bg-gray-800 px-6 py-3 rounded-lg">
        <div>Attempts: <span className="font-bold text-yellow-300">{attempts}</span></div>
        <div>Time: <span className="font-bold text-yellow-300">{formatTime(elapsedTime)}</span></div>
      </div>
      
      {gamePhase === 'won' && isConnected && (
        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl mt-4">
          <h2 className="text-3xl font-bold text-green-400 mb-2">Congratulations!</h2>
          <p className="text-xl mb-4">Your final score is: <span className="font-bold text-yellow-300">{finalScore}</span></p>
          <button onClick={() => { if (finalScore > 0) { submitScore([BigInt(finalScore)]); } }} disabled={isSubmitting || isSubmitted} className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            {isSubmitting ? 'Submitting...' : isSubmitted ? 'Score Submitted!' : 'Submit Score'}
          </button>
          <div className="mt-6"><ClaimReward userScore={finalScore} /></div>
        </div>
      )}

      <button onClick={resetGame} className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">New Game</button>
    </div>
  );
}