import { LeaderboardTable } from '@/components/LeaderboardTable';

export default function LeaderboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-8">Leaderboard</h1>
      <p className="text-center text-gray-400 mb-8">Top 10 players with the highest scores.</p>
      <LeaderboardTable />
    </div>
  );
}