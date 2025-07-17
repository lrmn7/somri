"use client";
import { useAccount } from 'wagmi';
import { useReadMemoryGame, useWriteMemoryGame } from '@/hooks/useMemoryGameContract';
import { formatEther } from 'viem';

type ClaimRewardProps = {
  userScore: number;
};

export function ClaimReward({ userScore }: ClaimRewardProps) {
  const { address } = useAccount();
  const { data: minScore, isLoading: isLoadingMinScore } = useReadMemoryGame("minScoreForReward");
  const { data: rewardAmount, isLoading: isLoadingReward } = useReadMemoryGame("rewardAmount");
  const { data: hasClaimed, isLoading: isLoadingClaimStatus } = useReadMemoryGame("hasClaimedReward", [address]);

  const { execute: claimReward, isPending, isConfirmed } = useWriteMemoryGame("claimReward", () => {
    // Optionally refetch claim status after transaction
  });

  const canClaim = !hasClaimed && userScore >= (minScore as bigint || 0);

  if (!address || isLoadingMinScore || isLoadingReward || isLoadingClaimStatus) {
    return <div className="text-gray-400">Loading reward status...</div>;
  }
  
  if (hasClaimed) {
    return <p className="text-green-400">You have already claimed your reward!</p>;
  }

  if (userScore < (minScore as bigint || 0)) {
    return <p className="text-yellow-500">Your score of {userScore} is not high enough for a reward. You need at least {minScore?.toString()}.</p>;
  }

  return (
    <div className="mt-4 border-t border-gray-600 pt-4">
      <h3 className="text-xl font-semibold">Reward Available!</h3>
      <p>Your score qualifies you to claim a reward of <span className="font-bold text-yellow-400">{formatEther(rewardAmount as bigint || BigInt(0))} ETH</span>.</p>
      <button
        onClick={() => claimReward()}
        disabled={!canClaim || isPending || isConfirmed}
        className="mt-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        {isPending ? 'Claiming...' : isConfirmed ? 'Reward Claimed!' : 'Claim Reward'}
      </button>
    </div>
  );
}