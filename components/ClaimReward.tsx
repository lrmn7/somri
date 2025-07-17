"use client";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contractConfig } from "@/lib/config";
import { formatEther } from "viem";
import { useEffect } from "react";

type ClaimRewardProps = {
  userScore: number;
  difficulty: number;
};

export function ClaimReward({ userScore, difficulty }: ClaimRewardProps) {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <p className="text-gray-500 mt-4">
        Connect your wallet to see reward status.
      </p>
    );
  }

  const { data: minScore } = useReadContract({
    ...contractConfig,
    functionName: "minScoreForReward",
  });
  const { data: rewardAmount } = useReadContract({
    ...contractConfig,
    functionName: "rewardAmounts",
    args: [difficulty],
  });
  const { data: hasClaimed, refetch } = useReadContract({
    ...contractConfig,
    functionName: "hasClaimedReward",
    args: [address, difficulty],
  });

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
    }
  }, [isConfirmed, refetch]);

  const canClaim = !hasClaimed && userScore >= ((minScore as bigint) || 0);

  if (userScore < ((minScore as bigint) || 0)) return null;
  if (hasClaimed)
    return (
      <p className="text-green-400 mt-4">
        Reward for this difficulty has been claimed!
      </p>
    );

  return (
    <div className="mt-4 border-t border-gray-600 pt-4">
      <h3 className="text-xl font-semibold">Reward Available!</h3>
      <p>
        Claim your reward of{" "}
        <span className="font-bold text-yellow-400">
          {formatEther((rewardAmount as bigint) || BigInt(0))} STT
        </span>
        for completing{" "}
        {difficulty === 0 ? "Easy" : difficulty === 1 ? "Medium" : "Hard"}{" "}
        difficulty.
      </p>
      <button
        onClick={() =>
          writeContract({
            ...contractConfig,
            functionName: "claimReward",
            args: [difficulty],
          })
        }
        disabled={!canClaim || isPending || isConfirming || isConfirmed}
        className="mt-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        {isPending && "Waiting for confirmation..."}
        {isConfirming && "Claiming on blockchain..."}
        {isConfirmed && "Claimed!"}
        {!isPending && !isConfirming && !isConfirmed && "Claim Reward"}
      </button>
    </div>
  );
}
