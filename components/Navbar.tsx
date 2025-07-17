"use client";

import Link from "next/link";
import Image from "next/image";
import { WalletButton } from "./WalletButton";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900 backdrop-blur-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center w-[60px] md:w-auto">
          <div className="block md:hidden" />
          <Image
            src="/somri.png"
            alt="Somri Logo"
            width={60}
            height={60}
            className="hidden md:block"
          />
        </Link>
        <div className="flex items-center gap-4">
          <WalletButton />
        </div>
      </nav>
    </header>
  );
}
