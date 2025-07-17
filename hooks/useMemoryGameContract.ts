import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractConfig } from '@/lib/config';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';

// Hook untuk membaca data dari kontrak
export function useReadMemoryGame(functionName: any, args: any[] = []) {
  return useReadContract({
    ...contractConfig,
    functionName,
    args,
  });
}

// Hook untuk menulis data ke kontrak
export function useWriteMemoryGame(functionName: any, onSettled?: () => void) {
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
      hash,
  });

  const execute = (args?: any[], value?: string) => {
    writeContract({
      ...contractConfig,
      functionName,
      args: args || [],
      ...(value && { value: parseEther(value) }),
    }, {
      onSuccess: (hash) => toast.success(`Transaction sent: ${hash.slice(0, 10)}...`),
      onError: (err) => toast.error(err.shortMessage || 'An error occurred'),
      onSettled
    });
  };

  return { execute, hash, error, isPending, isConfirming, isConfirmed };
}