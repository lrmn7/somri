import { memoryGameABI } from './abi';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
export const contractConfig = {
  address: contractAddress,
  abi: memoryGameABI,
} as const;
