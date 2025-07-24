export const runtime = 'edge';

import { NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { somniaTestnet } from "viem/chains";
import { memoryGameABI } from "@/lib/abi";

const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
});

const contractConfig = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
  abi: memoryGameABI,
};

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  const playerAddress = params.address;

  if (!isAddress(playerAddress)) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 }
    );
  }

  try {
    const score = await publicClient.readContract({
      ...contractConfig,
      functionName: "totalScore",
      args: [playerAddress],
    });

    const numericScore = Number(score);

    // completed jika skor >= 1000
    const completed = numericScore >= 1000;

    return NextResponse.json({
      wallet: playerAddress.toLowerCase(),
      score: numericScore,
      completed: completed,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch player data" },
      { status: 500 }
    );
  }
}
