import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "@rainbow-me/rainbowkit/styles.css";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SOMRI",
  description: "Just flip, match, and have fun! Rewards will follow!",
  keywords:
    "Somnia, Somnia Network, Testnet, Faucet, ERC20, ERC721, Multi-sender, Blockchain Tools, dApp, Web3, Smart Contract Deployment, Test Tokens, Crypto",
  authors: [{ name: "L RMN", url: "https://lrmn.link" }],
  creator: "L RMN",
  publisher: "L RMN",
  alternates: {
    canonical: "https://somri.lrmn.link/",
  },
  icons: {
    icon: "/somri.png",
    shortcut: "/somri.png",
    apple: "/somri.png",
  },
  openGraph: {
    title: "SOMNIA MEMORY GAME",
    description: "Just flip, match, and have fun! Rewards will follow!",
    url: "https://somri.lrmn.link/",
    siteName: "SOMRI",
    images: [
      {
        url: "https://somri.lrmn.link/somri-og.png",
        width: 1200,
        height: 630,
        alt: "SOMRI - SOMNIA MEMORY GAME",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@romanromannya",
    creator: "@romanromannya",
    title: "SOMRI: Just flip, match, and have fun! Rewards will follow!",
    description: "Just flip, match, and have fun! Rewards will follow!",
    images: ["https://somri.lrmn.link/somri-og.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

const ClientOnlyProviders = dynamic(() => import("@/app/providers-client"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <ClientOnlyProviders>
          <div className="min-h-screen flex flex-col bg-gray-900">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 flex justify-center">
              {children}
            </main>
            <Footer />
          </div>
        </ClientOnlyProviders>
      </body>
    </html>
  );
}
