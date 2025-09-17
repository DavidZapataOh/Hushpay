'use client';

import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { 
  getClient, 
  getTokenBalance, 
  getTokenInfo, 
  getTokenAllowance,
  waitForTransaction,
  estimateGas,
  depositToBridge,
  requestUnlock,
  getLockInfo,
} from '../contracts';
import { getTokenAddress, getNetworkConfig, type LiskTokenSymbol, type SepoliaTokenSymbol, type NetworkName } from '../constants';
import { toast } from 'sonner';
import { parseUnits, encodeFunctionData, formatUnits } from 'viem';
import { LISK_LOCKER_ABI, SEPOLIA_BRIDGE_ABI } from '../contracts';
import { ERC20_ABI } from '../constants';

export function useContracts() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener la wallet conectada (no embebida)
  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');
  const userAddress = connectedWallet?.address as `0x${string}` | undefined;

  // Configuración de cadenas
  const liskConfig = getNetworkConfig('lisk');
  const sepoliaConfig = getNetworkConfig('sepolia');

  const getLiskBalance = useCallback(async (
    token: LiskTokenSymbol
  ): Promise<string> => {
    if (!authenticated || !userAddress) {
      return '0';
    }

    try {
      const client = getClient('lisk');
      const tokenAddress = getTokenAddress(token, 'lisk') as `0x${string}`;
      
      return await getTokenBalance(tokenAddress, userAddress!, client);
    } catch (err) {
      console.error('Error getting Lisk balance:', err);
      return '0';
    }
  }, [authenticated, userAddress]);

  const getSepoliaBalance = useCallback(async (
    token: SepoliaTokenSymbol
  ): Promise<string> => {
    if (!authenticated || !userAddress) {
      return '0';
    }

    try {
      const client = getClient('sepolia');
      const tokenAddress = getTokenAddress(token, 'sepolia') as `0x${string}`;
      
      return await getTokenBalance(tokenAddress, userAddress!, client);
    } catch (err) {
      console.error('Error getting Sepolia balance:', err);
      return '0';
    }
  }, [authenticated, userAddress]);

  // Deposit tokens in Lisk to create eTokens in Sepolia
  const depositTokens = useCallback(async (
    token: LiskTokenSymbol,
    amount: string
  ): Promise<boolean> => {
    if (!authenticated || !userAddress || !connectedWallet) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the Ethereum provider from the connected wallet
      const ethereumProvider = await connectedWallet.getEthereumProvider();
      
      // Create a wallet client using the connected wallet with correct Lisk chain config
      const walletClient = createWalletClient({
        account: userAddress,
        chain: {
          id: liskConfig.chainId,
          name: liskConfig.name,
          nativeCurrency: {
            decimals: 18,
            name: 'ETH',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: [liskConfig.rpcUrl],
            },
            public: {
              http: [liskConfig.rpcUrl],
            },
          },
          blockExplorers: {
            default: {
              name: 'Lisk Explorer',
              url: liskConfig.blockExplorer,
            },
          },
        },
        transport: custom(ethereumProvider),
      });

      const client = getClient('lisk');
      const tokenAddress = getTokenAddress(token, 'lisk') as `0x${string}`;
      const lockerAddress = '0x441851573E634588657B59F8fA8b93480d90D86F' as `0x${string}`;

      // Check ETH balance first
      const ethBalance = await client.getBalance({ address: userAddress! });
      const minEthRequired = parseUnits('0.02', 18); // Increased to 0.02 ETH for gas + CCIP fees
      
      if (ethBalance < minEthRequired) {
        toast.error(`Insufficient ETH balance. You need at least 0.02 ETH for gas fees and CCIP fees. Current balance: ${formatUnits(ethBalance, 18)} ETH`);
        return false;
      }

      // Get token info
      const tokenInfo = await getTokenInfo(tokenAddress, client);
      const amountWei = parseUnits(amount, tokenInfo.decimals);

      // First approve the locker to spend tokens
      const approveTx = {
        to: tokenAddress,
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [lockerAddress, amountWei]
        }),
      };

      console.log('Sending approval transaction...');
      const approveHash = await walletClient.sendTransaction(approveTx);
      toast.success('Approval transaction sent!');
      
      // Wait for approval confirmation
      await waitForTransaction(approveHash, client);

      // Then deposit to the locker
      const depositData = encodeFunctionData({
        abi: LISK_LOCKER_ABI,
        functionName: 'deposit',
        args: [amountWei, userAddress!]
      });

      // Estimate gas for deposit transaction
      const estimatedGas = await client.estimateGas({
        account: userAddress,
        to: lockerAddress,
        data: depositData,
        value: parseUnits('0.01', 18), // CCIP fees
      });

      console.log('Estimated gas for deposit:', estimatedGas.toString());

      const depositTx = {
        to: lockerAddress,
        data: depositData,
        value: parseUnits('0.01', 18), // Send 0.01 ETH for CCIP fees
        gas: estimatedGas + BigInt(50000), // Add buffer to estimated gas
      };

      console.log('Sending deposit transaction with gas:', depositTx.gas?.toString());
      const depositHash = await walletClient.sendTransaction(depositTx);
      toast.success('Deposit transaction sent to Lisk!');
      
      // Wait for deposit confirmation
      await waitForTransaction(depositHash, client);
      
      toast.success('Tokens deposited successfully! eTokens will be created in Sepolia shortly.');
      return true;
    } catch (err) {
      console.error('Deposit error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Deposit failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, userAddress, connectedWallet, liskConfig]);

  // Burn eTokens to recover tokens in Lisk
  const unlockTokens = useCallback(async (
    token: SepoliaTokenSymbol,
    amount: string
  ): Promise<boolean> => {
    if (!authenticated || !userAddress || !connectedWallet) {
      toast.error('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the Ethereum provider from the connected wallet
      const ethereumProvider = await connectedWallet.getEthereumProvider();
      
      // Create a wallet client using the connected wallet with correct Sepolia chain config
      const walletClient = createWalletClient({
        account: userAddress,
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

      const client = getClient('sepolia');
      const bridgeAddress = '0x564f1fF5dE99227FB6a7cD92D18F481DCB2B3c31' as `0x${string}`;

      // Get amount in 6 decimals format
      const amount6 = parseUnits(amount, 6);

      // Request unlock transaction
      const unlockData = encodeFunctionData({
        abi: SEPOLIA_BRIDGE_ABI,
        functionName: 'requestUnlock',
        args: [BigInt(amount6), userAddress!]
      });

      // Estimate gas for unlock transaction
      const estimatedGas = await client.estimateGas({
        account: userAddress,
        to: bridgeAddress,
        data: unlockData,
      });

      console.log('Estimated gas for unlock:', estimatedGas.toString());

      const unlockTx = {
        to: bridgeAddress,
        data: unlockData,
        gas: estimatedGas + BigInt(50000), // Add buffer to estimated gas
      };

      console.log('Sending unlock transaction with gas:', unlockTx.gas?.toString());
      const unlockHash = await walletClient.sendTransaction(unlockTx);
      toast.success('Unlock request sent to Sepolia!');
      
      // Wait for unlock confirmation
      await waitForTransaction(unlockHash, client);
      
      toast.success('eTokens burned successfully! Tokens will be unlocked in Lisk shortly.');
      return true;
    } catch (err) {
      console.error('Unlock error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unlock failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, userAddress, connectedWallet, sepoliaConfig]);

  // Get information of a specific lock
  const getLockDetails = useCallback(async (
    lockId: number
  ) => {
    try {
      const client = getClient('lisk');
      return await getLockInfo(lockId, client);
    } catch (err) {
      console.error('Error getting lock details:', err);
      return null;
    }
  }, []);

  return {
    getLiskBalance,
    getSepoliaBalance,
    depositTokens,
    unlockTokens,
    getLockDetails,
    isLoading,
    error,
    isConnected: authenticated && !!userAddress,
    userAddress: userAddress,
  };
}
