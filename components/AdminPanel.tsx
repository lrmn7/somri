"use client";
import { useAccount } from 'wagmi';
import { useReadMemoryGame, useWriteMemoryGame } from '@/hooks/useMemoryGameContract';
import { formatEther, parseEther } from 'viem';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function AdminPanel() {
  const { address, isConnected } = useAccount();
  const { data: owner } = useReadMemoryGame('owner');
  const { data: contractBalance } = useReadMemoryGame('balance'); // wagmi's useBalance
  const { data: minScore } = useReadMemoryGame('minScoreForReward');
  const { data: rewardAmount } = useReadMemoryGame('rewardAmount');

  const [depositValue, setDepositValue] = useState('');
  const [withdrawValue, setWithdrawValue] = useState('');
  const [newMinScore, setNewMinScore] = useState('');
  const [newRewardAmount, setNewRewardAmount] = useState('');

  const { execute: deposit, isPending: isDepositing } = useWriteMemoryGame('deposit');
  const { execute: withdraw, isPending: isWithdrawing } = useWriteMemoryGame('withdraw');
  const { execute: setMinScoreExec, isPending: isSettingMinScore } = useWriteMemoryGame('setMinScore');
  const { execute: setRewardAmountExec, isPending: isSettingReward } = useWriteMemoryGame('setRewardAmount');
  
  const isOwner = isConnected && address === owner;

  if (!isConnected) {
    return <p>Please connect your wallet to view this page.</p>;
  }

  if (!isOwner) {
    return <p className="text-red-500">You are not the owner of this contract.</p>;
  }
  
  const handleDeposit = () => {
    if (!depositValue || parseFloat(depositValue) <= 0) {
      toast.error('Please enter a valid amount to deposit.');
      return;
    }
    deposit(undefined, depositValue);
    setDepositValue('');
  };

  const handleWithdraw = () => {
    if (!withdrawValue || parseFloat(withdrawValue) <= 0) {
      toast.error('Please enter a valid amount to withdraw.');
      return;
    }
    withdraw([parseEther(withdrawValue)]);
    setWithdrawValue('');
  };
  
  const handleSetMinScore = () => {
    if (!newMinScore || parseInt(newMinScore) < 0) {
      toast.error('Please enter a valid score.');
      return;
    }
    setMinScoreExec([BigInt(newMinScore)]);
    setNewMinScore('');
  };
  
  const handleSetRewardAmount = () => {
    if (!newRewardAmount || parseFloat(newRewardAmount) < 0) {
      toast.error('Please enter a valid reward amount.');
      return;
    }
    setRewardAmountExec([parseEther(newRewardAmount)]);
    setNewRewardAmount('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-8">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      {/* Contract Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Contract Balance</p>
              <p className="text-xl font-bold">{contractBalance ? formatEther(contractBalance.value) : '0'} ETH</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Reward Amount</p>
              <p className="text-xl font-bold">{rewardAmount ? formatEther(rewardAmount as bigint) : '0'} ETH</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Min Score for Reward</p>
              <p className="text-xl font-bold">{minScore ? (minScore as bigint).toString() : '0'}</p>
          </div>
      </div>
      
      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Funds Management */}
        <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold">Funds Management</h3>
          <div className="flex gap-2">
            <input type="number" value={depositValue} onChange={e => setDepositValue(e.target.value)} placeholder="Amount in ETH" className="input-field" />
            <button onClick={handleDeposit} disabled={isDepositing} className="btn-primary">
              {isDepositing ? 'Depositing...' : 'Deposit'}
            </button>
          </div>
          <div className="flex gap-2">
            <input type="number" value={withdrawValue} onChange={e => setWithdrawValue(e.target.value)} placeholder="Amount in ETH" className="input-field" />
            <button onClick={handleWithdraw} disabled={isWithdrawing} className="btn-secondary">
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold">Game Settings</h3>
          <div className="flex gap-2">
            <input type="number" value={newMinScore} onChange={e => setNewMinScore(e.target.value)} placeholder="New minimum score" className="input-field" />
            <button onClick={handleSetMinScore} disabled={isSettingMinScore} className="btn-primary">
              {isSettingMinScore ? 'Setting...' : 'Set Min Score'}
            </button>
          </div>
          <div className="flex gap-2">
            <input type="number" value={newRewardAmount} onChange={e => setNewRewardAmount(e.target.value)} placeholder="New reward (ETH)" className="input-field" />
            <button onClick={handleSetRewardAmount} disabled={isSettingReward} className="btn-primary">
              {isSettingReward ? 'Setting...' : 'Set Reward'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tambahkan style helper di globals.css
// .input-field { @apply w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500; }
// .btn-primary { @apply bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors; }
// .btn-secondary { @apply bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors; }