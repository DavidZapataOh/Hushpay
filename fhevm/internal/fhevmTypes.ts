import type { EIP1193Provider } from "viem";

export type FhevmRelayerSDKType = {
  initSDK: (options?: any) => Promise<boolean>;
  createInstance: (config: any) => Promise<any>;
  SepoliaConfig: {
    aclContractAddress: `0x${string}`;
    kmsContractAddress: `0x${string}`;
    inputVerifierContractAddress: `0x${string}`;
    verifyingContractAddressDecryption: `0x${string}`;
    verifyingContractAddressInputVerification: `0x${string}`;
    chainId: number;
    gatewayChainId: number;
    network: string;
    relayerUrl: string;
  };
  __initialized__?: boolean;
};

export type FhevmWindowType = {
  relayerSDK: FhevmRelayerSDKType;
};

export type FhevmInitSDKOptions = {
  trace?: boolean;
};

export type FhevmInitSDKType = (options?: FhevmInitSDKOptions) => Promise<boolean>;

export type FhevmLoadSDKType = () => Promise<void>;

export function isFhevmRelayerSDKType(
  obj: unknown,
  trace?: (message?: unknown, ...optionalParams: unknown[]) => void
): obj is FhevmRelayerSDKType {
  if (typeof obj !== "object" || obj === null) {
    trace?.("isFhevmRelayerSDKType: obj is not an object");
    return false;
  }

  const sdk = obj as FhevmRelayerSDKType;

  if (typeof sdk.initSDK !== "function") {
    trace?.("isFhevmRelayerSDKType: initSDK is not a function");
    return false;
  }

  if (typeof sdk.createInstance !== "function") {
    trace?.("isFhevmRelayerSDKType: createInstance is not a function");
    return false;
  }

  if (typeof sdk.SepoliaConfig !== "object" || sdk.SepoliaConfig === null) {
    trace?.("isFhevmRelayerSDKType: SepoliaConfig is not an object");
    return false;
  }

  return true;
}

export function isFhevmWindowType(
  window: Window,
  trace?: (message?: unknown, ...optionalParams: unknown[]) => void
): window is Window & FhevmWindowType {
  if (!("relayerSDK" in window)) {
    trace?.("isFhevmWindowType: relayerSDK is not in window");
    return false;
  }

  return isFhevmRelayerSDKType(window.relayerSDK, trace);
}