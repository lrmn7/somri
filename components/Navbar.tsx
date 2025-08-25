"use client";

import Link from "next/link";
import Image from "next/image";
import { WalletButton } from "./WalletButton";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900 backdrop-blur-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link
            href="https://discord.com/invite/9HkKkkA9Jt"
            target="_blank"
            rel="noopener noreferrer"
            className="block md:hidden text-brand-orange"
            aria-label="Discord Community"
          >
            <FaDiscord size={32} />
          </Link>
          <Link
            href="/"
            className="hidden md:flex items-center"
            aria-label="Homepage"
          >
            <Image
              src="/somri.png"
              alt="Somri Logo"
              width={60}
              height={60}
            />
          </Link>

        </div>

        <div className="flex items-center gap-4">
          <Link
            href="https://discord.com/invite/9HkKkkA9Jt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-orange hover:text-white transition-colors hidden md:block"
            aria-label="Discord Community"
          >
            <FaDiscord size={40} />
          </Link>

          <WalletButton />
        </div>
      </nav>
    </header>
  );
}