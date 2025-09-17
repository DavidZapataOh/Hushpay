import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData, createWalletClient, custom } from 'viem';
import { CONFIDENTIAL_ERC20_ABI, getNetworkConfig } from '@/lib/constants';
import { toast } from 'sonner';

interface Auditor {
  address: string;
  name: string;
  isAllowed: boolean;
}

export function useAuditors(tokenAddress: string) {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  
  // **CAMBIADO: Usar la wallet conectada en lugar de la embebida**
  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');
  const userAddress = connectedWallet?.address;
  
  // Configuración de Sepolia
  const sepoliaConfig = getNetworkConfig('sepolia');
  
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = createPublicClient({
    chain: {
      id: sepoliaConfig.chainId,
      name: sepoliaConfig.name,
      nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
      },
      rpcUrls: {
        default: {
          http: [sepoliaConfig.rpcUrl],
        },
        public: {
          http: [sepoliaConfig.rpcUrl],
        },
      },
      blockExplorers: {
        default: {
          name: 'Etherscan',
          url: sepoliaConfig.blockExplorer,
        },
      },
    },
    transport: http(),
  });

  // Add a new auditor
  const addAuditor = async (auditorAddress: string) => {
    if (!authenticated || !userAddress || !connectedWallet) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!auditorAddress.trim() || !auditorAddress.startsWith('0x')) {
      toast.error('Please enter a valid Ethereum address');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the Ethereum provider from the connected wallet
      const ethereumProvider = await connectedWallet.getEthereumProvider();
      
      // Create a wallet client using the connected wallet with correct Sepolia chain config
      const walletClient = createWalletClient({
        account: userAddress as `0x${string}`,
        chain: {
          id: sepoliaConfig.chainId,
          name: sepoliaConfig.name,
          nativeCurrency: {
            decimals: 18,
            name: 'ETH',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: [sepoliaConfig.rpcUrl],
            },
            public: {
              http: [sepoliaConfig.rpcUrl],
            },
          },
          blockExplorers: {
            default: {
              name: 'Etherscan',
              url: sepoliaConfig.blockExplorer,
            },
          },
        },
        transport: custom(ethereumProvider),
      });

      // Encode the function call - usar allowAuditorOnMyBalance en lugar de addAuditor
      const txData = encodeFunctionData({
        abi: CONFIDENTIAL_ERC20_ABI,
        functionName: 'allowAuditorOnMyBalance',
        args: [auditorAddress as `0x${string}`]
      });

      // Prepare transaction
      const tx = {
        to: tokenAddress as `0x${string}`,
        data: txData,
      };

      const result = await walletClient.sendTransaction(tx);
      toast.success('Auditor allowed successfully!');
      
      // Add to local state
      const newAuditor: Auditor = {
        address: auditorAddress,
        name: `Auditor ${auditors.length + 1}`,
        isAllowed: true,
      };
      
      setAuditors(prev => [...prev, newAuditor]);
      
      return true;
    } catch (err) {
      console.error('Error allowing auditor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to allow auditor';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an auditor - nota: el contrato no tiene función para revocar, solo manejar localmente
  const removeAuditor = async (auditorAddress: string) => {
    if (!authenticated || !userAddress) {
      toast.error('Please connect your wallet first');
      return false;
    }

    // Como el contrato no tiene función para revocar, solo removemos localmente
    setAuditors(prev => prev.filter(auditor => auditor.address !== auditorAddress));
    toast.success('Auditor removed from local list');
    return true;
  };

  // Check if an auditor is allowed for the current user
  const checkAuditorAllowed = async (auditorAddress: string): Promise<boolean> => {
    if (!userAddress || !tokenAddress) return false;

    try {
      const isAllowed = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: CONFIDENTIAL_ERC20_ABI,
        functionName: 'isAuditorAllowed',
        args: [userAddress as `0x${string}`, auditorAddress as `0x${string}`],
      });

      return isAllowed as boolean;
    } catch (err) {
      console.error('Error checking auditor permission:', err);
      return false;
    }
  };

  // Load existing auditors - como no hay función getAuditors, usar lista local
  const fetchAuditors = async () => {
    if (!userAddress || !tokenAddress) return;

    try {
      setIsLoading(true);
      // Como el contrato no tiene getAuditors, mantenemos una lista local simple
      // En una implementación real, podrías escuchar eventos AuditorAllowed para construir la lista
      setAuditors([]);
    } catch (err) {
      console.error('Error fetching auditors:', err);
      setError('Failed to fetch auditors');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch auditors on mount and when dependencies change
  useEffect(() => {
    if (tokenAddress && userAddress) {
      fetchAuditors();
    }
  }, [tokenAddress, userAddress]);

  return {
    auditors,
    addAuditor,
    removeAuditor,
    checkAuditorAllowed,
    isLoading,
    error,
    refresh: fetchAuditors,
  };
}