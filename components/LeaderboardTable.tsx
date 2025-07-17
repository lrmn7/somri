"use client";
import { useReadContract } from 'wagmi';
import { contractConfig } from '@/lib/config';
import { formatAddress } from '@/lib/utils';
import { useEffect } from 'react';

// ✨ Tipe 'Score' diperbarui sesuai struct di smart contract
type Score = {
  player: `0x${string}`;
  value: bigint;
  timestamp: bigint;
  difficulty: number; // 0: Easy, 1: Medium, 2: Hard
}

// Fungsi pembantu untuk mengubah angka difficulty menjadi teks
const getDifficultyName = (difficulty: number) => {
  switch (difficulty) {
    case 0: return 'Easy';
    case 1: return 'Medium';
    case 2: return 'Hard';
    default: return 'Unknown';
  }
};

export function LeaderboardTable() {
  // ✨ Menggunakan useReadContract secara langsung
  const { data: topScores, isLoading, error, refetch } = useReadContract({
    ...contractConfig,
    functionName: 'getTopScores',
    args: [BigInt(10)],
  });

  // Refresh data setiap 30 detik untuk menjaga papan peringkat tetap update
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) return <p className="text-center">Loading leaderboard...</p>;
  // ✨ Menggunakan error.message untuk menampilkan pesan error
  if (error) return <p className="text-center text-red-500">Error fetching leaderboard: {error.message}</p>;
  if (!topScores || (topScores as Score[]).length === 0) return <p className="text-center">No scores submitted yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 rounded-lg">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-4 text-left">Rank</th>
            <th className="p-4 text-left">Player</th>
            <th className="p-4 text-left">Score</th>
            {/* ✨ Kolom baru untuk Difficulty */}
            <th className="p-4 text-left">Difficulty</th>
            <th className="p-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {(topScores as Score[]).map((score, index) => (
            <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
              <td className="p-4 font-bold">{index + 1}</td>
              <td className="p-4 font-mono" title={score.player}>{formatAddress(score.player)}</td>
              <td className="p-4 text-yellow-300 font-bold">{score.value.toString()}</td>
              {/* ✨ Menampilkan nama Difficulty */}
              <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  score.difficulty === 0 ? 'bg-green-500/20 text-green-300' :
                  score.difficulty === 1 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {getDifficultyName(score.difficulty)}
                </span>
              </td>
              <td className="p-4">{new Date(Number(score.timestamp) * 1000).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}