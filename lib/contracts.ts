import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  parseUnits, 
  formatUnits,
  encodeFunctionData,
  type PublicClient,
  type WalletClient,
  type Address,
  type Chain
} from 'viem';
import { sepolia } from 'viem/chains';
import { ERC20_ABI, getTokenAddress, getNetworkConfig, type SepoliaTokenSymbol, type LiskTokenSymbol, type NetworkName, CCIP_CONTRACTS, CHAIN_SELECTORS } from './constants';

export function createSepoliaClient(): PublicClient {
  return createPublicClient({
    chain: sepolia,
    transport: http(getNetworkConfig('sepolia').rpcUrl),
  });
}

export function createLiskClient(): PublicClient {
  const liskChain: Chain = {
    id: getNetworkConfig('lisk').chainId,
    name: getNetworkConfig('lisk').name,
    nativeCurrency: {
      decimals: 18,
      name: 'ETH',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: [getNetworkConfig('lisk').rpcUrl],
      },
      public: {
        http: [getNetworkConfig('lisk').rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: 'Lisk Explorer',
        url: getNetworkConfig('lisk').blockExplorer,
      },
    },
  };

  return createPublicClient({
    chain: liskChain,
    transport: http(getNetworkConfig('lisk').rpcUrl),
  });
}

export function getClient(network: NetworkName): PublicClient {
  switch (network) {
    case 'sepolia':
      return createSepoliaClient();
    case 'lisk':
      return createLiskClient();
    default:
      return createSepoliaClient();
  }
}

export async function getTokenBalance(
  tokenAddress: Address,
  userAddress: Address,
  client: PublicClient
): Promise<string> {
  try {
    const [balance, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      }),
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ]);
    
    return formatUnits(balance as bigint, decimals as number);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
}

export async function getTokenInfo(
  tokenAddress: Address,
  client: PublicClient
): Promise<{ name: string; symbol: string; decimals: number }> {
  try {
    const [name, symbol, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'name',
      }),
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ]);
    
    return { 
      name: name as string, 
      symbol: symbol as string, 
      decimals: decimals as number 
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    return { name: 'Unknown', symbol: 'UNK', decimals: 18 };
  }
}

export async function getTokenAllowance(
  tokenAddress: Address,
  ownerAddress: Address,
  spenderAddress: Address,
  client: PublicClient
): Promise<string> {
  try {
    const [allowance, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [ownerAddress, spenderAddress],
      }),
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ]);
    
    return formatUnits(allowance as bigint, decimals as number);
  } catch (error) {
    console.error('Error getting token allowance:', error);
    return '0';
  }
}

export async function approveTokens(
  tokenAddress: Address,
  spenderAddress: Address,
  amount: string,
  walletClient: WalletClient,
  account: Address
): Promise<`0x${string}`> {
  try {
    const publicClient = createSepoliaClient();
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });
    
    const amountWei = parseUnits(amount, decimals as number);

    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, amountWei],
      account,
      chain: sepolia,
    });

    return hash;
  } catch (error) {
    console.error('Error approving tokens:', error);
    throw error;
  }
}

export async function transferTokens(
  tokenAddress: Address,
  toAddress: Address,
  amount: string,
  walletClient: WalletClient,
  account: Address
): Promise<`0x${string}`> {
  try {
    const publicClient = createSepoliaClient();
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });
    
    const amountWei = parseUnits(amount, decimals as number);

    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [toAddress, amountWei],
      account,
      chain: sepolia,
    });

    return hash;
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
}

export function createWalletClientFromPrivy(
  transport: any,
  account: Address,
  chain: Chain
): WalletClient {
  return createWalletClient({
    account,
    chain,
    transport,
  });
}

export async function waitForTransaction(
  hash: `0x${string}`,
  client: PublicClient
): Promise<void> {
  try {
    await client.waitForTransactionReceipt({ hash });
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
}

export async function estimateGas(
  tokenAddress: Address,
  spenderAddress: Address,
  amount: string,
  client: PublicClient,
  account: Address
): Promise<bigint> {
  try {
    const decimals = await client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });
    const amountWei = parseUnits(amount, decimals as number);

    const gas = await client.estimateContractGas({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, amountWei],
      account,
    });

    return gas;
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
}

// ABI para el contrato LiskLocker
export const LISK_LOCKER_ABI = [
  {
    "inputs": [
      {"name": "amountRaw", "type": "uint256"},
      {"name": "recipientSepolia", "type": "address"}
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "uint256"}],
    "name": "locks",
    "outputs": [
      {"name": "sender", "type": "address"},
      {"name": "recipientSepolia", "type": "address"},
      {"name": "amountRaw", "type": "uint256"},
      {"name": "amount6", "type": "uint256"},
      {"name": "processed", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ABI para el contrato SepoliaBridge
export const SEPOLIA_BRIDGE_ABI = [
  {
    "inputs": [
      {"name": "amount6", "type": "uint64"},
      {"name": "liskRecipient", "type": "address"}
    ],
    "name": "requestUnlock",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

// Función para depositar tokens en Lisk y crear eTokens en Sepolia
export async function depositToBridge(
  token: LiskTokenSymbol,
  amount: string,
  recipientSepolia: Address,
  walletClient: WalletClient,
  account: Address
): Promise<`0x${string}`> {
  try {
    const client = getClient('lisk');
    const tokenAddress = getTokenAddress(token, 'lisk') as `0x${string}`;
    const lockerAddress = CCIP_CONTRACTS.lisk.locker as `0x${string}`;

    // Obtener decimals del token
    const tokenInfo = await getTokenInfo(tokenAddress, client);
    const amountWei = parseUnits(amount, tokenInfo.decimals);

    // Primero aprobar el gasto al locker
    const approveData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [lockerAddress, amountWei]
    });

    const approveHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [lockerAddress, amountWei],
      account,
      chain: { id: 4202, name: 'Lisk' } as Chain,
    });

    // Esperar confirmación de la aprobación
    await client.waitForTransactionReceipt({ hash: approveHash });

    // Luego hacer el deposit al locker
    const depositData = encodeFunctionData({
      abi: LISK_LOCKER_ABI,
      functionName: 'deposit',
      args: [amountWei, recipientSepolia]
    });

    const depositHash = await walletClient.writeContract({
      address: lockerAddress,
      abi: LISK_LOCKER_ABI,
      functionName: 'deposit',
      args: [amountWei, recipientSepolia],
      account,
      chain: { id: 4202, name: 'Lisk' } as Chain,
    });

    return depositHash;
  } catch (error) {
    console.error('Error depositing to bridge:', error);
    throw error;
  }
}

// Función para quemar eTokens y recuperar tokens en Lisk
export async function requestUnlock(
  token: SepoliaTokenSymbol,
  amount: string,
  liskRecipient: Address,
  walletClient: WalletClient,
  account: Address
): Promise<`0x${string}`> {
  try {
    const client = getClient('sepolia');
    const bridgeAddress = CCIP_CONTRACTS.sepolia.bridge as `0x${string}`;

    // Obtener decimals del eToken (asumiendo 6 decimales como en el contrato)
    const amount6 = parseUnits(amount, 6);

    // Hacer la transacción de requestUnlock
    const unlockHash = await walletClient.writeContract({
      address: bridgeAddress,
      abi: SEPOLIA_BRIDGE_ABI,
      functionName: 'requestUnlock',
      args: [BigInt(amount6), liskRecipient],
      account,
      chain: sepolia,
    });

    return unlockHash;
  } catch (error) {
    console.error('Error requesting unlock:', error);
    throw error;
  }
}

// Función para obtener información de un lock
export async function getLockInfo(
  lockId: number,
  client: PublicClient
): Promise<{
  sender: Address;
  recipientSepolia: Address;
  amountRaw: bigint;
  amount6: bigint;
  processed: boolean;
}> {
  try {
    const lockerAddress = CCIP_CONTRACTS.lisk.locker as `0x${string}`;
    
    const lockInfo = await client.readContract({
      address: lockerAddress,
      abi: LISK_LOCKER_ABI,
      functionName: 'locks',
      args: [BigInt(lockId)]
    });

    return {
      sender: lockInfo[0],
      recipientSepolia: lockInfo[1],
      amountRaw: lockInfo[2],
      amount6: lockInfo[3],
      processed: lockInfo[4]
    };
  } catch (error) {
    console.error('Error getting lock info:', error);
    throw error;
  }
}
