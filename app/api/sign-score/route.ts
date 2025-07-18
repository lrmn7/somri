import { type NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, encodePacked } from "viem";

export async function POST(req: NextRequest) {
  try {
    let signerKey = process.env.SIGNER_PRIVATE_KEY;
    if (!signerKey) {
      throw new Error("SIGNER_PRIVATE_KEY is not set in environment variables");
    }
    if (!signerKey.startsWith("0x")) {
      signerKey = `0x${signerKey}`;
    }
    const account = privateKeyToAccount(signerKey as `0x${string}`);
    const { userAddress, score } = await req.json();

    if (!userAddress || typeof score !== "number") {
      return NextResponse.json(
        { error: "Invalid address or score" },
        { status: 400 }
      );
    }

    const nonce = Date.now();

    const hash = keccak256(
      encodePacked(
        ["address", "uint256", "uint256"],
        [userAddress as `0x${string}`, BigInt(score), BigInt(nonce)]
      )
    );

    const signature = await account.sign({ hash });

    return NextResponse.json({ signature, nonce });
  } catch (error: any) {
    console.error("Signing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign score" },
      { status: 500 }
    );
  }
}