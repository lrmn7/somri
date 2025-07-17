'use client';
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { somniaTestnet } from 'wagmi/chains';
import { Toaster } from 'react-hot-toast';
import { CustomAvatar } from '../lib/avatar';

const config = getDefaultConfig({
  appName: 'Somtool',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [somniaTestnet],
  ssr: false,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#f97316',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'rounded',
            overlayBlur: 'small',
          })}
          avatar={CustomAvatar}
          appInfo={{
            appName: 'Somnia Network',
            learnMoreUrl: 'https://somnia.network/',
          }}
        >
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}