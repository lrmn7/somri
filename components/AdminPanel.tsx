"use client";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractConfig } from '@/lib/config';
import { formatEther, parseEther } from 'viem';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
enum Difficulty { Easy, Medium, Hard }

export function AdminPanel() {
  const { address, isConnected } = useAccount();
  const { data: contractBalance, refetch: refetchBalance } = useBalance({ address: contractConfig.address });
  const { data: owner } = useReadContract({ ...contractConfig, functionName: 'owner' });
  const { data: minScore, refetch: refetchMinScore } = useReadContract({ ...contractConfig, functionName: 'minScoreForReward' });
  const { data: playFee, refetch: refetchPlayFee } = useReadContract({ ...contractConfig, functionName: 'playFee' });
  const { data: easyReward, refetch: refetchEasyReward } = useReadContract({ ...contractConfig, functionName: 'rewardAmounts', args: [Difficulty.Easy] });
  const { data: mediumReward, refetch: refetchMediumReward } = useReadContract({ ...contractConfig, functionName: 'rewardAmounts', args: [Difficulty.Medium] });
  const { data: hardReward, refetch: refetchHardReward } = useReadContract({ ...contractConfig, functionName: 'rewardAmounts', args: [Difficulty.Hard] });

  const [newPlayFee, setNewPlayFee] = useState('');
  const [newRewardAmount, setNewRewardAmount] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [newMinScore, setNewMinScore] = useState('');
  const [depositValue, setDepositValue] = useState('');
  const [withdrawValue, setWithdrawValue] = useState('');
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      toast.success('Transaction confirmed!');
      refetchBalance(); refetchPlayFee(); refetchEasyReward(); refetchMediumReward(); refetchHardReward(); refetchMinScore();
    }
    if (error) {
      toast.error(error.message);
    }
  }, [isConfirmed, error]);

  const isOwner = isConnected && address === owner;

  if (!isConnected) return <p>Please connect your wallet.</p>;
  if (!owner) return <p>Loading contract data...</p>;
  if (!isOwner) return <p className="text-red-500">You are not the owner.</p>;
  
  const handleSetPlayFee = () => {
    if (!newPlayFee || parseFloat(newPlayFee) < 0) return toast.error('Invalid fee');
    writeContract({ ...contractConfig, functionName: 'setPlayFee', args: [parseEther(newPlayFee)] });
  };
  const handleSetRewardAmount = () => {
    if (!newRewardAmount || parseFloat(newRewardAmount) < 0) return toast.error('Invalid reward');
    writeContract({ ...contractConfig, functionName: 'setRewardAmount', args: [selectedDifficulty, parseEther(newRewardAmount)] });
  };
  const handleSetMinScore = () => {
    if (!newMinScore || parseInt(newMinScore) < 0) return toast.error('Invalid score');
    writeContract({ ...contractConfig, functionName: 'setMinScore', args: [BigInt(newMinScore)] });
  };
  const handleDeposit = () => {
    if (!depositValue || parseFloat(depositValue) <= 0) return toast.error('Invalid deposit');
    writeContract({ ...contractConfig, functionName: 'deposit', value: parseEther(depositValue) });
  };
  const handleWithdraw = () => {
    if (!withdrawValue || parseFloat(withdrawValue) <= 0) return toast.error('Invalid withdraw');
    writeContract({ ...contractConfig, functionName: 'withdraw', args: [parseEther(withdrawValue)] });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center">Admin Dashboard</h2>
      {isPending && <p className="text-center text-yellow-400 animate-pulse">Transaction pending...</p>}
      {isConfirming && <p className="text-center text-blue-400 animate-pulse">Confirming transaction...</p>}
      
      {/* Tampilan status */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-400">Balance</p><p className="text-xl font-bold">{contractBalance ? `${parseFloat(contractBalance.formatted).toFixed(4)} STT` : '...'}</p></div>
        <div className="bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-400">Play Fee</p><p className="text-xl font-bold">{playFee !== undefined ? `${formatEther(playFee as bigint)} STT` : '...'}</p></div>
        <div className="bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-400">Min Score</p><p className="text-xl font-bold">{minScore !== undefined ? (minScore as bigint).toString() : '...'}</p></div>
        <div className="bg-green-900/50 p-4 rounded-lg"><p className="text-sm text-green-300">Easy Reward</p><p className="text-xl font-bold">{easyReward !== undefined ? `${formatEther(easyReward as bigint)} STT` : '...'}</p></div>
        <div className="bg-yellow-900/50 p-4 rounded-lg"><p className="text-sm text-yellow-300">Medium Reward</p><p className="text-xl font-bold">{mediumReward !== undefined ? `${formatEther(mediumReward as bigint)} STT` : '...'}</p></div>
        <div className="bg-red-900/50 p-4 rounded-lg"><p className="text-sm text-red-300">Hard Reward</p><p className="text-xl font-bold">{hardReward !== undefined ? `${formatEther(hardReward as bigint)} STT` : '...'}</p></div>
      </div>

      {/* Panel Aksi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold">Game Settings</h3>
          <div className="flex gap-2"><input type="number" value={newPlayFee} onChange={e => setNewPlayFee(e.target.value)} placeholder="New Play Fee (STT)" className="input-field" /><button onClick={handleSetPlayFee} disabled={isPending} className="btn-primary w-40">{isPending ? 'Pending...' : 'Set Fee'}</button></div>
          <div className="flex gap-2"><select onChange={(e) => setSelectedDifficulty(Number(e.target.value))} className="input-field"><option value={Difficulty.Easy}>Easy</option><option value={Difficulty.Medium}>Medium</option><option value={Difficulty.Hard}>Hard</option></select><input type="number" value={newRewardAmount} onChange={e => setNewRewardAmount(e.target.value)} placeholder="New Reward (STT)" className="input-field" /><button onClick={handleSetRewardAmount} disabled={isPending} className="btn-primary w-48">{isPending ? 'Pending...' : 'Set Reward'}</button></div>
          <div className="flex gap-2"><input type="number" value={newMinScore} onChange={e => setNewMinScore(e.target.value)} placeholder="New Min Score" className="input-field" /><button onClick={handleSetMinScore} disabled={isPending} className="btn-primary w-48">{isPending ? 'Pending...' : 'Set Min Score'}</button></div>
        </div>
        <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold">Funds Management</h3>
          <div className="flex gap-2"><input type="number" value={depositValue} onChange={e => setDepositValue(e.target.value)} placeholder="Amount to Deposit (STT)" className="input-field" /><button onClick={handleDeposit} disabled={isPending} className="btn-primary w-40">{isPending ? 'Pending...' : 'Deposit'}</button></div>
          <div className="flex gap-2"><input type="number" value={withdrawValue} onChange={e => setWithdrawValue(e.target.value)} placeholder="Amount to Withdraw (STT)" className="input-field" /><button onClick={handleWithdraw} disabled={isPending} className="btn-secondary w-40">{isPending ? 'Pending...' : 'Withdraw'}</button></div>
        </div>
      </div>
    </div>
  );
}