import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import '@rainbow-me/rainbowkit/styles.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="p-4 border-b border-gray-700">
              <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-purple-400">
                  {siteConfig.name}
                </Link>
                <div className="flex items-center gap-4">
                  <Link href="/play" className="hover:text-purple-300 transition-colors">Play</Link>
                  <Link href="/leaderboard" className="hover:text-purple-300 transition-colors">Leaderboard</Link>
                  <Link href="/admin" className="hover:text-purple-300 transition-colors">Admin</Link>
                  <WalletButton />
                </div>
              </nav>
            </header>
            <main className="flex-grow container mx-auto p-4">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}