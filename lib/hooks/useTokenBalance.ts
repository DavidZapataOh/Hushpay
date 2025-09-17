import { useEffect, useState, useCallback } from "react";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { formatUnits, createPublicClient, http, getContract } from "viem";
import { sepolia } from 'viem/chains';
import { CONFIDENTIAL_ERC20_ABI } from "@/lib/constants";
import { useFhevmContext } from "@/app/FhevmProvider";
import { toast } from "sonner";
import { useSigner } from "./useSigner";
import { useDecryptValue } from "./useDecryptValue";
import { Signer } from "ethers";

interface UseTokenBalanceProps {
  address?: string;
  tokenAddress: string;
  isConfidential?: boolean;
  enabled?: boolean;
}

export function useTokenBalance({
  address,
  tokenAddress,
  isConfidential = false,
  enabled = true,
}: UseTokenBalanceProps) {
  const { user, authenticated } = usePrivy();
  const { ready: readyWallets, wallets } = useWallets();
  const { instance, isInitialized } = useFhevmContext();
  const { signer } = useSigner();
  
  // Usar la wallet conectada en lugar de la embebida
  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');
  const userAddress = connectedWallet?.address;

  // Hook para desencriptación
  const { 
    decryptedValue: decryptedBalance, 
    lastUpdated, 
    isDecrypting, 
    decrypt: decryptBalance, 
    error: decryptionError,
    hide: hideDecrypt
  } = useDecryptValue({ signer: signer as Signer });

  // Validación para tokenAddress
  if (!tokenAddress) {
    throw new Error("tokenAddress is required");
  }

  const [balance, setBalance] = useState("0");
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>(6);

  // Cliente Viem memoizado
  const client = useCallback(() => createPublicClient({
    chain: sepolia,
    transport: http("https://eth-sepolia.public.blastapi.io"),
  }), []);

  // Función para obtener datos del token - MEMOIZADA
  const fetchTokenData = useCallback(async () => {
    if (!enabled || !tokenAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const viemClient = client();
      const contract = getContract({
        address: tokenAddress as `0x${string}`,
        abi: CONFIDENTIAL_ERC20_ABI,
        client: viemClient,
      });

      const addressToQuery = address || userAddress;
      
      if (!addressToQuery) {
        setError(new Error("No address available for query"));
        setIsLoading(false);
        return;
      }

      // Obtener symbol, decimals y balance en paralelo
      const [symbol, decimals, balanceOf] = await Promise.all([
        contract.read.symbol(),
        contract.read.decimals(),
        contract.read.balanceOf([addressToQuery as `0x${string}`]),
      ]);

      setTokenSymbol(symbol as string);
      setTokenDecimals(Number(decimals));
      setRawBalance(balanceOf as bigint);

      // Para tokens no confidenciales, formatear inmediatamente
      if (!isConfidential) {
        const formattedBalance = formatUnits(balanceOf as bigint, Number(decimals));
        setBalance(formattedBalance);
      }

    } catch (err) {
      console.error("Error fetching token data:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch token data"));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, tokenAddress, address, userAddress, isConfidential, client]);

  // useEffect para obtener datos del token
  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  // useEffect para formatear el balance
  useEffect(() => {
    if (isConfidential) {
      if (decryptedBalance !== null) {
        const formattedBalance = formatUnits(decryptedBalance, tokenDecimals);
        setBalance(formattedBalance);
      } else {
        setBalance("•••••••");
      }
    } else {
      const formattedBalance = formatUnits(rawBalance, tokenDecimals);
      setBalance(formattedBalance);
    }
  }, [isConfidential, decryptedBalance, rawBalance, tokenDecimals]);

  // Función decrypt simplificada
  const decrypt = useCallback(async () => {
    if (!isConfidential || !rawBalance || rawBalance === BigInt(0) || !userAddress || !signer) {
      return;
    }

    try {
      await decryptBalance(rawBalance, tokenAddress as `0x${string}`);
    } catch (err) {
      console.error("Decryption failed:", err);
      throw err;
    }
  }, [isConfidential, rawBalance, userAddress, signer, decryptBalance, tokenAddress]);

  const hide = useCallback(() => {
    if (isConfidential) {
      hideDecrypt();
    }
  }, [isConfidential, hideDecrypt]);

  return {
    balance,
    rawBalance,
    lastUpdated,
    decryptedBalance,
    decrypt,
    isLoading,
    isDecrypting,
    error: error || decryptionError,
    symbol: tokenSymbol,
    name: tokenSymbol,
    decimals: tokenDecimals,
    hide,
  };
}