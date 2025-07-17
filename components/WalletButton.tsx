'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export const WalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3" aria-hidden={!ready}>
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="bg-brand-orange hover:bg-yellow-700 px-4 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded-md font-semibold transition-all"
                type="button"
              >
                Connect Wallet
              </button>
            ) : chain?.unsupported ? (
              <button
                onClick={openChainModal}
                className="bg-brand-orange hover:bg-yellow-700 px-4 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded-md font-semibold transition-all"
                type="button"
              >
                Wrong Network
              </button>
            ) : (
              <>
                <button
                  onClick={openChainModal}
                  className="flex items-center gap-2 bg-brand-orange hover:bg-yellow-700 px-4 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded-md font-semibold transition-all"
                  type="button"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    <img
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      style={{ width: 16, height: 16, borderRadius: 999 }}
                    />
                  )}
                  {chain.name}
                </button>

                <button
                  onClick={openAccountModal}
                  className="bg-brand-orange hover:bg-yellow-700 px-4 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base rounded-md font-semibold transition-all"
                  type="button"
                >
                  {account.displayName}
                </button>
              </>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
