import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-6xl font-bold mb-4 text-brand-orange">404</h1>
      <p className="text-xl mb-6 text-gray-400">Oops! The page you are looking for does not exist.</p>
      
      <Image
        src="/404.jpeg"
        alt="404 Illustration"
        width={400}
        height={300}
        priority
      />

      <Link
        href="/"
        className="mt-8 bg-brand-orange hover:bg-orange-600 px-4 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded-md font-semibold transition-all"
      >
        Back to Home
      </Link>
    </main>
  );
}
