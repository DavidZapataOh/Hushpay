// Mock implementation for FHEVM - this is used for local development
export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}) => {
  // Return a mock instance that implements the basic interface
  return {
    generateKeypair: () => ({
      publicKey: "mock-public-key",
      privateKey: "mock-private-key",
    }),
    createEIP712: (publicKey: string, contractAddresses: string[], startTimestamp: string, durationDays: string) => ({
      domain: {
        chainId: parameters.chainId,
        name: "FHEVM",
        verifyingContract: parameters.metadata.ACLAddress,
        version: "1",
      },
      message: {
        publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
      },
      primaryType: "UserDecryptRequestVerification",
      types: {
        UserDecryptRequestVerification: [
          { name: "publicKey", type: "string" },
          { name: "contractAddresses", type: "string[]" },
          { name: "startTimestamp", type: "string" },
          { name: "durationDays", type: "string" },
        ],
      },
    }),
    userDecrypt: async (
      handleContractPairs: any[],
      privateKey: string,
      publicKey: string,
      signature: string,
      contractAddresses: string[],
      userAddress: string,
      startTimestamp: string,
      durationDays: string
    ) => {
      // Return mock decrypted values
      const result: Record<string, bigint> = {};
      handleContractPairs.forEach((pair) => {
        result[pair.handle] = BigInt(Math.floor(Math.random() * 1000000));
      });
      return result;
    },
    createEncryptedInput: (contractAddress: string, userAddress: string) => ({
      add64: (value: bigint) => {
        // Mock implementation
        return {
          encrypt: async () => ({
            handles: ["mock-handle-1"],
            inputProof: "mock-proof",
          }),
        };
      },
      encrypt: async () => ({
        handles: ["mock-handle-1"],
        inputProof: "mock-proof",
      }),
    }),
    getPublicKey: () => "mock-public-key",
    getPublicParams: (size: number) => "mock-public-params",
  };
};
