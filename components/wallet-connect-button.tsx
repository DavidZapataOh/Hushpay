'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';

export function WalletConnectButton() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();

  // **CAMBIADO: Usar la wallet conectada en lugar de la embebida**
  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');
  const displayAddress = connectedWallet?.address || user?.wallet?.address;

  if (!ready) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-muted-foreground">
          {displayAddress ? 
            `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}` : 
            'Connected'
          }
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={logout}
          className="border-border hover:bg-card"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={login}
      className="bg-accent hover:bg-accent/90 text-accent-foreground"
    >
      Connect Wallet
    </Button>
  );
}
