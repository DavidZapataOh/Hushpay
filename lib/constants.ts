export const TOKEN_ADDRESSES = {
  // Sepolia Testnet
  sepolia: {
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
    WETH: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  },
  // Lisk 
  lisk: {
    USDC: "0xa0b86a33e6ba3e0e4ca4ba5cf81b2e8e8e8e8e8e",
    USDT: "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0",
    WETH: "0xc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1",
  }
} as const;

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // Función para obtener el símbolo del token
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // Función para obtener los decimales del token
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // Función para obtener el total supply
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // Función para obtener el balance de una dirección
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // Función para transferir tokens
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Función para aprobar gastos
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Función para obtener la cantidad aprobada
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // Evento Transfer
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  // Evento Approval
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": true, "name": "spender", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  }
] as const;

export const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/3946648922db455c8876e5d727e1cc40",
    blockExplorer: "https://sepolia.etherscan.io"
  },
  lisk: {
    chainId: 1337, 
    name: "Lisk Network",
    rpcUrl: "https://rpc.sepolia-api.lisk.com",
    blockExplorer: "https://sepolia.etherscan.io"
  }
} as const;

export const GAS_CONFIG = {
  defaultGasLimit: 300000,
  defaultGasPrice: "20000000000", // 20 gwei
  maxPriorityFeePerGas: "1500000000", // 1.5 gwei
  maxFeePerGas: "25000000000" // 25 gwei
} as const;

export type TokenSymbol = keyof typeof TOKEN_ADDRESSES.lisk;
export type NetworkName = keyof typeof NETWORKS;
export type TokenAddresses = typeof TOKEN_ADDRESSES;

export function getTokenAddress(token: TokenSymbol, network: NetworkName): string {
  return TOKEN_ADDRESSES[network][token];
}

export function getNetworkConfig(network: NetworkName) {
  return NETWORKS[network];
}
