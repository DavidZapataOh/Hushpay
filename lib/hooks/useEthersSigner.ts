import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useState, useCallback } from 'react';

export function useEthersSigner() {
  console.log("🔍 useEthersSigner - Hook initialized");
  
  const { authenticated } = usePrivy();
  const { wallets, ready } = useWallets();
  const [signer, setSigner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');

  console.log("🔍 useEthersSigner - Current state:", { 
    hasSigner: !!signer, 
    authenticated, 
    ready,
    connectedWallet: !!connectedWallet,
    connectedWalletAddress: connectedWallet?.address,
    isLoading
  });

  const createSigner = useCallback(async () => {
    console.log("🔍 useEthersSigner - createSigner called");
    
    if (!authenticated || !ready || !connectedWallet || !connectedWallet.address) {
      console.log("🔍 useEthersSigner - Conditions not met");
      setSigner(null);
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log("🔍 useEthersSigner - Creating signer...");
      const ethereumProvider = await connectedWallet.getEthereumProvider();
      console.log("🔍 useEthersSigner - Got provider:", !!ethereumProvider);
      
      const provider = new ethers.providers.Web3Provider(ethereumProvider);
      console.log("🔍 useEthersSigner - Created BrowserProvider");
      
      const newSigner = await provider.getSigner();
      console.log("🔍 useEthersSigner - Got signer:", !!newSigner);
      
      // Test getting address to ensure signer is working
      try {
        const address = await newSigner.getAddress();
        console.log("🔍 useEthersSigner - Signer address:", address);
      } catch (error) {
        console.error("❌ useEthersSigner - Error getting signer address:", error);
      }
      
      setSigner(newSigner);
      console.log("🔍 useEthersSigner - Signer set successfully");
      return newSigner;
    } catch (error) {
      console.error('❌ useEthersSigner - Failed to get Ethers signer:', error);
      setSigner(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, ready, connectedWallet]);

  // Auto-create signer when conditions are met
  if (authenticated && ready && connectedWallet && !signer && !isLoading) {
    console.log("🔍 useEthersSigner - Auto-creating signer");
    createSigner();
  }

  return { 
    signer, 
    createSigner,
    isLoading,
    isReady: authenticated && ready && !!connectedWallet
  };
}
