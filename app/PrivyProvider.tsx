'use client';

import {PrivyProvider} from '@privy-io/react-auth';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#6366f1',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: true,
        },
        supportedChains: [
          {
            id: 4202,
            name: 'Lisk Sepolia L2',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://rpc.sepolia-api.lisk.com'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Lisk Explorer',
                url: 'https://explorer.lisk.com',
              },
            },
          },
          {
            id: 11155111,
            name: 'Ethereum Sepolia',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://sepolia.infura.io/v3/3946648922db455c8876e5d727e1cc40'],
              },
            },
            blockExplorers: {
              default: {
                name: 'Etherscan',
                url: 'https://sepolia.etherscan.io',
              },
            },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
