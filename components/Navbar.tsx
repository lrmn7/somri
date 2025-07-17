"use client";

import Link from "next/link";
import Image from "next/image";
import { WalletButton } from "./WalletButton";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900 backdrop-blur-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center w-[60px] md:w-auto">
          {/* Mobile: show X Twitter */}
          <div className="block md:hidden text-brand-orange">
            <FaXTwitter size={32} />
          </div>

          {/* Desktop: show logo */}
          <Image
            src="/somri.png"
            alt="Somri Logo"
            width={60}
            height={60}
            className="hidden md:block"
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop only: Twitter Icon on right side */}
          <Link
            href="https://twitter.com/romanromannya"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-orange hover:text-white transition-colors hidden md:block"
            aria-label="Twitter Profile"
          >
            <FaXTwitter size={40} />
          </Link>

          <WalletButton />
        </div>
      </nav>
    </header>
  );
}
