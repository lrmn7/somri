import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Welcome to the Web3 Memory Game
      </h1>
      <p className="mt-4 text-lg text-gray-300">
        Test your memory, climb the leaderboard, and earn crypto rewards!
      </p>
      <div className="mt-8">
        <Link href="/play">
          <span className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-xl transition-transform transform hover:scale-105 inline-block">
            Play Now
          </span>
        </Link>
      </div>
    </div>
  );
}