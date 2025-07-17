"use client";
import { useReadContract } from 'wagmi';
import { contractConfig } from '@/lib/config';
import { formatAddress } from '@/lib/utils';
import { useEffect } from 'react';

export function LeaderboardTable() {
  const { data: leaderboardData, isLoading, error, refetch } = useReadContract({
    ...contractConfig,
    functionName: 'getTopScores',
    args: [BigInt(10)], // Ambil 10 pemain teratas
  });

  // Refresh data papan peringkat setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) return <p className="text-center">Loading leaderboard...</p>;
  if (error) return <p className="text-center text-red-500">Error fetching leaderboard: {error.message}</p>;
  
  // Logika baru untuk menangani format data [address[], uint256[]]
  const players = leaderboardData?.[0];
  const scores = leaderboardData?.[1];

  if (!players || players.length === 0) {
    return <p className="text-center">No scores submitted yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 rounded-lg">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="p-4 text-left text-brand-orange">Rank</th>
            <th className="p-4 text-left text-brand-orange">Player</th>
            <th className="p-4 text-left text-brand-orange">Total Score</th>
          </tr>
        </thead>
        <tbody>
          {players.map((playerAddress, index) => (
            <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
              <td className="p-4 font-bold text-gray-400">{index + 1}</td>
              <td className="text-orange-300 p-4 font-mono" title={playerAddress}>{formatAddress(playerAddress)}</td>
              <td className="p-4 text-gray-400 font-bold">{scores?.[index]?.toString() || '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}