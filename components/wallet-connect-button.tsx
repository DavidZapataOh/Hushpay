'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';

export function WalletConnectButton() {
  const { login, logout, authenticated, user, ready } = usePrivy();

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
          {user?.wallet?.address ? 
            `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 
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
