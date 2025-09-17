import { useState, useCallback } from 'react';
import { useFhevmContext } from '@/app/FhevmProvider';
import { reencryptEuint64 } from '@/lib/fhevm/reencrypt';
import { Signer } from 'ethers';

interface UseDecryptValueProps {
  signer: Signer | null;
}

export function useDecryptValue({ signer }: UseDecryptValueProps) {
  const { instance, isInitialized, status: instanceStatus } = useFhevmContext();
  const [decryptedValue, setDecryptedValue] = useState<bigint | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = async (handle: bigint, contractAddress: `0x${string}`) => {
    console.log("🔍 useDecryptValue - decrypt called with:", { 
      hasSigner: !!signer,
      signerType: signer ? typeof signer : 'null',
      handle: handle.toString(),
      contractAddress
    });

    setIsDecrypting(true);
    setError(null);

    try {
      if (!signer) {
        throw new Error('Signer not initialized - please connect your wallet');
      }
      if (!isInitialized) {
        throw new Error('FHEVM not initialized');
      }
      if (instanceStatus !== "ready") {
        throw new Error('FHEVM instance not ready');
      }
      if (!handle || handle === BigInt(0)) {
        setDecryptedValue(BigInt(0));
        setLastUpdated(new Date());
        return;
      }
      

      console.log("🔍 Starting decryption process using reencryptEuint64...");
      const clearBalance = await reencryptEuint64(
        signer,
        instance,
        BigInt(handle),
        contractAddress,
      );

      console.log("✅ Decryption successful:", clearBalance);
      setDecryptedValue(clearBalance);
      setLastUpdated(new Date());

    } catch (err) {
      console.error("❌ Decryption failed:", err);
      const error = err instanceof Error ? err : new Error('Failed to decrypt value');
      setError(error);
      throw error;
    } finally {
      setIsDecrypting(false);
    }
  };

  const hide = useCallback(() => {
    setDecryptedValue(null);
    setLastUpdated(null);
    setError(null);
  }, []);

  return {
    decryptedValue,
    lastUpdated,
    isDecrypting,
    decrypt,
    error,
    hide,
  };
}

