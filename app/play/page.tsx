import { GameBoard } from '@/components/GameBoard';

export default function PlayPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-8">Memory Game</h1>
      <GameBoard />
    </div>
  );
}