import { useState } from "react";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { parseUnits, encodeFunctionData, createWalletClient, custom } from "viem";
import { useFhevmContext } from "@/app/FhevmProvider";
import { CONFIDENTIAL_ERC20_ABI, getNetworkConfig } from "@/lib/constants";
import { toast } from "sonner";

export function useConfidentialTransfer() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { instance, isInitialized } = useFhevmContext();
  
  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');
  const userAddress = connectedWallet?.address;

  const sepoliaConfig = getNetworkConfig('sepolia');

  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transfer = async (
    tokenAddress: string,
    amount: string,
    toAddress: string,
    decimals: number = 6
  ) => {
    if (!authenticated || !userAddress || !connectedWallet) {
      toast.error('Please connect your wallet first');
      return false;
    }

    if (!instance || !isInitialized) {
      toast.error('FHEVM not initialized');
      return false;
    }

    setIsEncrypting(true);
    setIsConfirming(false);
    setIsConfirmed(false);
    setHash(null);
    setError(null);

    try {
      console.log("🔍 Starting confidential transfer...");
      console.log("🔍 Transfer details:", { tokenAddress, toAddress, amount, decimals });

      // Parse amount to wei
      const amountWei = parseUnits(amount, decimals);
      console.log("🔍 Amount in wei:", amountWei.toString());

      // **CAMBIADO: Usar createEncryptedInput como en la plantilla de Zama**
      console.log("🔍 Creating encrypted input...");
      const encryptedInput = await instance
        .createEncryptedInput(tokenAddress, userAddress)
        .add64(amountWei)
        .encrypt();

      console.log("🔍 Encrypted input created:", encryptedInput);

      // Get the Ethereum provider from the connected wallet
      const ethereumProvider = await connectedWallet.getEthereumProvider();
      
      // Create a wallet client using the connected wallet
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

      // **CAMBIADO: Usar la estructura correcta del ABI para transfer con proof**
      const transferTx = {
        to: tokenAddress as `0x${string}`,
        data: encodeFunctionData({
          abi: CONFIDENTIAL_ERC20_ABI,
          functionName: 'transfer',
          args: [
            toAddress as `0x${string}`, 
            `0x${Buffer.from(encryptedInput.handles[0]).toString('hex')}` as `0x${string}`,
            `0x${Buffer.from(encryptedInput.inputProof).toString('hex')}` as `0x${string}`
          ]
        }),
      };

      console.log("🔍 Sending transfer transaction...");
      setIsEncrypting(false);
      setIsConfirming(true);

      const transferHash = await walletClient.sendTransaction(transferTx);
      console.log("🔍 Transfer transaction sent:", transferHash);
      
      setHash(transferHash);
      setIsConfirmed(true);
      
      toast.success('Confidential transfer sent successfully!');
      return true;

    } catch (err) {
      console.error("❌ Transfer failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'Transfer failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsEncrypting(false);
      setIsConfirming(false);
    }
  };

  const resetTransfer = () => {
    setIsEncrypting(false);
    setIsConfirming(false);
    setIsConfirmed(false);
    setHash(null);
    setError(null);
  };

  return {
    transfer,
    isEncrypting,
    isConfirming,
    isConfirmed,
    hash,
    error,
    resetTransfer,
  };
}