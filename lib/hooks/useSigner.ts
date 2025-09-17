import { useState, useEffect } from "react";
import { Signer } from "ethers";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

export function useSigner() {
  const { authenticated } = usePrivy();
  const { wallets, ready } = useWallets();
  const [signer, setSigner] = useState<Signer | null>(null);

  useEffect(() => {
    const initSigner = async () => {
      if (!authenticated || !ready) {
        setSigner(null);
        return;
      }

      try {
        // Obtener la wallet conectada
        const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');
        
        if (!connectedWallet) {
          console.warn("No connected Ethereum wallet found");
          setSigner(null);
          return;
        }

        // Obtener el provider de Ethereum
        const ethereumProvider = await connectedWallet.getEthereumProvider();
        
        // Crear un provider de Ethers v6
        const provider = new ethers.BrowserProvider(ethereumProvider);
        
        // Obtener el signer de Ethers
        const ethersSigner = await provider.getSigner();
        
        // Verificar que el signer funciona obteniendo la dirección
        const address = await ethersSigner.getAddress();
        console.log("Signer initialized with address:", address);
        
        setSigner(ethersSigner);
      } catch (error) {
        console.error("Error initializing signer:", error);
        setSigner(null);
      }
    };

    initSigner();
  }, [authenticated, ready, wallets]);

  return { signer };
}
