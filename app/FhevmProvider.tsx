"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useFhevm } from "../fhevm/useFhevm";
import type { FhevmInstance } from "../fhevm/fhevmTypes";

interface FhevmContextType {
  instance: any;
  refresh: () => void;
  error: Error | undefined;
  status: string;
  isInitialized: boolean;
  isLoading: boolean;
}

const FhevmContext = createContext<FhevmContextType | undefined>(undefined);

export function FhevmProvider({ children }: { children: ReactNode }) {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [provider, setProvider] = useState<any>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [isProviderReady, setIsProviderReady] = useState(false);

  // **CAMBIADO: Usar la wallet conectada en lugar de la embebida**
  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');
  const userAddress = connectedWallet?.address;

  // Log when the script loads
  React.useEffect(() => {
    const checkSDKLoaded = () => {
      if (typeof window !== 'undefined' && (window as any).relayerSDK) {
        console.log("✅ Relayer SDK CDN loaded successfully");
      } else {
        console.log("⏳ Waiting for Relayer SDK to load...");
        setTimeout(checkSDKLoaded, 100);
      }
    };
    
    checkSDKLoaded();
  }, []);

  // Get the provider from Privy wallet
  useEffect(() => {
    const getProvider = async () => {
      console.log("🔍 getProvider called:", { authenticated, userAddress, walletsLength: wallets.length });
      
      // **CAMBIADO: Verificar que hay wallet conectada**
      if (!authenticated || !userAddress || !connectedWallet) {
        console.log("🔍 Resetting provider - conditions not met");
        setProvider(undefined);
        setChainId(undefined);
        setIsProviderReady(false);
        return;
      }
      
      try {
        console.log("🔍 Getting Ethereum provider from connected wallet...");
        const ethereumProvider = await connectedWallet.getEthereumProvider();
        console.log("✅ Got provider:", !!ethereumProvider);
        setProvider(ethereumProvider);
        setChainId(parseInt(connectedWallet.chainId));
        setIsProviderReady(true);
        console.log("✅ Provider ready for FHEVM");
      } catch (error) {
        console.error("Failed to get Ethereum provider:", error);
        setProvider(undefined);
        setChainId(undefined);
        setIsProviderReady(false);
      }
    };

    getProvider();
  }, [authenticated, userAddress, connectedWallet]);

  const enabled = authenticated && !!userAddress && isProviderReady;
  console.log("🔍 FHEVM enabled:", enabled, { authenticated, userAddress: !!userAddress, isProviderReady });

  const fhevm = useFhevm({
    provider: provider,
    chainId: chainId,
    enabled: enabled,
  });

  const contextValue: FhevmContextType = {
    instance: fhevm.instance,
    refresh: fhevm.refresh,
    error: fhevm.error,
    status: fhevm.status,
    isInitialized: fhevm.status === "ready",
    isLoading: fhevm.status === "loading",
  };

  return (
    <FhevmContext.Provider value={contextValue}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevmContext() {
  const context = useContext(FhevmContext);
  if (context === undefined) {
    throw new Error("useFhevmContext must be used within a FhevmProvider");
  }
  return context;
}

// Mantener compatibilidad con el hook anterior
export { useFhevmContext as useFhevm };
