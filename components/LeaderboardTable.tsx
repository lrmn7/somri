"use client";
import { useReadMemoryGame } from '@/hooks/useMemoryGameContract';
import { formatAddress } from '@/lib/utils';

type Score = {
  player: `0x${string}`;
  value: bigint;
  timestamp: bigint;
}

export function LeaderboardTable() {
  const { data: topScores, isLoading, error } = useReadMemoryGame('getTopScores', [10]);

  if (isLoading) return <p>Loading leaderboard...</p>;
  if (error) return <p className="text-red-500">Error fetching leaderboard: {error.shortMessage}</p>;
  if (!topScores || (topScores as Score[]).length === 0) return <p>No scores submitted yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 rounded-lg">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-4 text-left">Rank</th>
            <th className="p-4 text-left">Player</th>
            <th className="p-4 text-left">Score</th>
            <th className="p-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {(topScores as Score[]).map((score, index) => (
            <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
              <td className="p-4 font-bold">{index + 1}</td>
              <td className="p-4 font-mono">{formatAddress(score.player)}</td>
              <td className="p-4 text-yellow-300 font-bold">{score.value.toString()}</td>
              <td className="p-4">{new Date(Number(score.timestamp) * 1000).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}