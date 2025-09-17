"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Send,
  ArrowUpDown,
  Plus,
  UserCheck,
  X,
  Upload,
  FileText,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useTokenBalance } from "@/lib/hooks/useTokenBalance"
import { useConfidentialTransfer } from "@/lib/hooks/useConfidentialTransfer"
import { useAuditors } from "@/lib/hooks/useAuditors"
import { TOKEN_ADDRESSES } from "@/lib/constants"
import { toast } from "sonner"
import { useFhevmContext } from "@/app/FhevmProvider"

// Token configuration
const TOKENS = [
  {
    id: "eUSDC",
    name: "eUSDC",
    originalToken: "USDC",
    address: TOKEN_ADDRESSES.sepolia.eUSDC,
    decimals: 6,
  },
  {
    id: "eUSDT", 
    name: "eUSDT",
    originalToken: "USDT",
    address: TOKEN_ADDRESSES.sepolia.eUSDT,
    decimals: 6,
  },
  {
    id: "eWETH",
    name: "eWETH", 
    originalToken: "WETH",
    address: TOKEN_ADDRESSES.sepolia.eWETH,
    decimals: 18,
  },
]

export function DashboardPage() {
  const { user, authenticated } = usePrivy()
  const { wallets } = useWallets();
  const { instance, isInitialized, isLoading: fhevmLoading, error: fhevmError } = useFhevmContext()
  
  // **CAMBIADO: Usar la wallet conectada en lugar de la embebida**
  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');
  const userAddress = connectedWallet?.address;
  
  // **DEBUG: Log de direcciones**
  console.log("🔍 Dashboard addresses:", {
    userWalletAddress: user?.wallet?.address,
    connectedWalletAddress: connectedWallet?.address || "no connected wallet",
    finalUserAddress: userAddress
  });

  const router = useRouter()

  // State for transfer modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferStep, setTransferStep] = useState(0)
  const [transferStatus, setTransferStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [transferError, setTransferError] = useState("")
  const [selectedToken, setSelectedToken] = useState<typeof TOKENS[0] | null>(null)
  
  // State for transfer form
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")
  const [batchTransfers, setBatchTransfers] = useState([{ address: "", amount: "" }])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<Array<{ address: string; amount: string }>>([])
  const [csvError, setCsvError] = useState("")

  // State for auditors
  const [newAuditorAddress, setNewAuditorAddress] = useState("")

  // Hooks
  const { transfer, isEncrypting, isConfirming, isConfirmed, hash, resetTransfer } = useConfidentialTransfer()
  const { auditors, addAuditor, removeAuditor, isLoading: auditorsLoading } = useAuditors(
    authenticated && connectedWallet ? TOKEN_ADDRESSES.sepolia.eUSDC : ""
  )

  // Token balances - solo habilitar cuando hay wallet conectada
  const eUSDCBalance = useTokenBalance({
    address: userAddress, // **CAMBIADO: Usar wallet conectada**
    tokenAddress: TOKEN_ADDRESSES.sepolia.eUSDC,
    isConfidential: true,
    enabled: authenticated && !!userAddress && !!connectedWallet && isInitialized && !!instance,
  })

  const eUSDTBalance = useTokenBalance({
    address: userAddress,
    tokenAddress: TOKEN_ADDRESSES.sepolia.eUSDT,
    isConfidential: true,
    enabled: authenticated && !!userAddress && !!connectedWallet && isInitialized && !!instance,
  })

  const eWETHBalance = useTokenBalance({
    address: userAddress,
    tokenAddress: TOKEN_ADDRESSES.sepolia.eWETH,
    isConfidential: true,
    enabled: authenticated && !!userAddress && !!connectedWallet && isInitialized && !!instance,
  })

  const tokenBalances = [
    { ...TOKENS[0], balance: eUSDCBalance },
    { ...TOKENS[1], balance: eUSDTBalance },
    { ...TOKENS[2], balance: eWETHBalance },
  ]

  // Redirect if not authenticated
  useEffect(() => {
    if (!authenticated) {
      router.push('/')
    }
  }, [authenticated, router])

  // Ensure we're on Sepolia for FHEVM operations - solo mostrar advertencia, no cambiar automáticamente
  useEffect(() => {
    if (authenticated && connectedWallet) {
      const currentChainId = connectedWallet.chainId;
      
      // Solo mostrar advertencia si no está en la red correcta
      if (currentChainId !== "11155111") {
        console.log("⚠️ User is not on Ethereum Sepolia (11155111). Current chain:", currentChainId);
        toast.warning("Please switch to Ethereum Sepolia network (11155111) for eToken operations", {
          duration: 5000,
        });
      }
    }
  }, [authenticated, connectedWallet]);

  const toggleBalanceVisibility = async (tokenId: string) => {
    const tokenBalance = tokenBalances.find(t => t.id === tokenId)
    if (!tokenBalance) return
    
    try {
      if (tokenBalance.balance.decryptedBalance !== null) {
        tokenBalance.balance.hide()
        toast.success('Balance hidden successfully!')
      } else {
        await tokenBalance.balance.decrypt()
        toast.success('Balance decrypted successfully!')
      }
    } catch (error) {
      console.error('Error decrypting balance:', error)
      
      if (error instanceof Error && error.message.includes('not authorized')) {
        toast.error('You need to set yourself as an auditor first. Please try the "Setup Auditor Permissions" button below.')
      } else {
        toast.error('Failed to decrypt balance')
      }
    }
  }

  const handleTransfer = async () => {
    if (!selectedToken || !sendAmount || !sendAddress) {
      toast.error('Please fill in all fields')
      return
    }

    if (!sendAddress.startsWith('0x') || sendAddress.length !== 42) {
      toast.error('Please enter a valid Ethereum address')
      return
    }

    setTransferStatus('processing')
    setTransferError('')

    try {
      const success = await transfer(
        selectedToken.address,
        sendAmount,
        sendAddress,
        selectedToken.decimals
      )

      if (success) {
        setTransferStatus('success')
        setIsTransferModalOpen(false)
        setSendAmount('')
        setSendAddress('')
        resetTransfer()
      } else {
        setTransferStatus('error')
        setTransferError('Transfer failed')
      }
    } catch (error) {
      console.error('Transfer error:', error)
      setTransferStatus('error')
      setTransferError(error instanceof Error ? error.message : 'Transfer failed')
    }
  }

  const handleBatchTransfer = async () => {
    if (!selectedToken || batchTransfers.length === 0) {
      toast.error('Please select a token and add transfers')
      return
    }

    setTransferStatus('processing')
    setTransferError('')

    try {
      let successCount = 0
      let failCount = 0

      for (const transferItem of batchTransfers) {
        if (!transferItem.address || !transferItem.amount) continue

        try {
          const success = await transfer(
            selectedToken!.address,
            transferItem.amount,
            transferItem.address,
            selectedToken!.decimals
          )

          if (success) {
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          console.error('Batch transfer error:', error)
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Batch transfer completed: ${successCount} successful, ${failCount} failed`)
        setTransferStatus('success')
        setIsTransferModalOpen(false)
        setBatchTransfers([{ address: "", amount: "" }])
        resetTransfer()
      } else {
        setTransferStatus('error')
        setTransferError('All transfers failed')
      }
    } catch (error) {
      console.error('Batch transfer error:', error)
      setTransferStatus('error')
      setTransferError(error instanceof Error ? error.message : 'Batch transfer failed')
    }
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv') {
      setCsvError('Please upload a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      const data: Array<{ address: string; amount: string }> = []
      
      for (let i = 1; i < lines.length; i++) { // Skip header
        const [address, amount] = lines[i].split(',').map(s => s.trim())
        if (address && amount) {
          data.push({ address, amount })
        }
      }

      setCsvData(data)
      setCsvFile(file)
      setCsvError('')
    }

    reader.readAsText(file)
  }

  const handleAddAuditor = async () => {
    if (!newAuditorAddress.trim()) {
      toast.error('Please enter an auditor address')
      return
    }

    const success = await addAuditor(newAuditorAddress.trim())
    if (success) {
      setNewAuditorAddress('')
    }
  }

  const handleRemoveAuditor = async (auditorAddress: string) => {
    const success = await removeAuditor(auditorAddress)
    if (success) {
      toast.success('Auditor removed successfully')
    }
  }

  // Mostrar pantalla de conexión si no está autenticado o no hay wallet conectada
  if (!authenticated || !connectedWallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Connect Your External Wallet</h1>
            <p className="text-muted-foreground mb-4">
              To access private eToken features, you need to connect an external wallet like MetaMask, WalletConnect, or Coinbase Wallet
            </p>
            <div className="space-y-3">
              <WalletConnectButton />
              <div className="text-xs text-muted-foreground">
                Make sure you're on the <strong>Ethereum Sepolia</strong> network (ID: 11155111) for eToken operations
              </div>
            </div>
          </div>
          {authenticated && !connectedWallet && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600">
                You're authenticated but need to connect an external wallet to access private features
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-sm">H</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Hushpay</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Network Indicator */}
              {connectedWallet && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-green-600">
                      Ethereum Sepolia (11155111)
                    </span>
                  </div>
                  {connectedWallet.chainId !== "11155111" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        connectedWallet.switchChain(11155111).catch((error) => {
                          console.error("❌ Failed to switch to Ethereum Sepolia:", error);
                          toast.error("Please switch to Ethereum Sepolia network manually");
                        });
                      }}
                      className="text-xs"
                    >
                      Switch to Ethereum Sepolia
                    </Button>
                  )}
                </div>
              )}
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your private eTokens and confidential transfers
            </p>
          </div>

          {/* Token Balances */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {tokenBalances.map((token) => (
              <Card key={token.id} className="border-border/40 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{token.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {token.originalToken}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Private token balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-foreground">
                      {token.balance.isLoading ? (
                      <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Loading...</span>
                      </div>
                      ) : token.balance.error ? (
                        <span className="text-destructive">Error</span>
                      ) : (
                        <span>{token.balance.balance}</span>
                      )}
                    </div>
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={() => toggleBalanceVisibility(token.id)}
                      disabled={token.balance.isLoading || token.balance.isDecrypting}
                    >
                      {token.balance.isDecrypting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : token.balance.decryptedBalance !== null ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
                  </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Transfer Section */}
            <Card className="border-border/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Send eTokens</span>
                </CardTitle>
                <CardDescription>
                  Send private tokens to another address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="token-select">Select Token</Label>
                  <select
                    id="token-select"
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background text-foreground"
                    onChange={(e) => {
                      const token = TOKENS.find(t => t.id === e.target.value)
                      setSelectedToken(token || null)
                    }}
                  >
                    <option value="">Choose a token</option>
                    {TOKENS.map((token) => (
                      <option key={token.id} value={token.id}>
                        {token.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                                <Input
                    id="amount"
                    type="number"
                                  placeholder="0.00"
                                  value={sendAmount}
                                  onChange={(e) => setSendAmount(e.target.value)}
                                />
                          </div>

                <div>
                  <Label htmlFor="address">Recipient Address</Label>
                                  <Input
                    id="address"
                                    placeholder="0x..."
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                  />
                          </div>

                <Button
                  onClick={() => setIsTransferModalOpen(true)}
                  disabled={!selectedToken || !sendAmount || !sendAddress}
                  className="w-full"
                >
                  Send Privately
                                </Button>
              </CardContent>
            </Card>

            {/* Auditors Section */}
            <Card className="border-border/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5" />
                  <span>Auditors</span>
                </CardTitle>
                <CardDescription>
                  Manage who can view your private balances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="auditor-address">Auditor Address</Label>
                  <div className="flex space-x-2 mt-1">
                                <Input
                      id="auditor-address"
                      placeholder="0x..."
                      value={newAuditorAddress}
                      onChange={(e) => setNewAuditorAddress(e.target.value)}
                    />
                    <Button
                      onClick={handleAddAuditor}
                      disabled={!newAuditorAddress.trim() || auditorsLoading}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                              </div>
                                </div>

                <div className="space-y-2">
                  <Label>Authorized Auditors</Label>
                  {auditorsLoading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                                  </div>
                  ) : auditors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No auditors authorized</p>
                  ) : (
                    <div className="space-y-2">
                      {auditors.map((auditor) => (
                        <div
                          key={auditor.address}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div>
                            <p className="text-sm font-medium">{auditor.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {auditor.address.slice(0, 6)}...{auditor.address.slice(-4)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAuditor(auditor.address)}
                            disabled={auditorsLoading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                                      </div>
                                    ))}
                                      </div>
                                    )}
                                  </div>
              </CardContent>
            </Card>
                          </div>

          {/* Batch Transfer Section */}
          <Card className="border-border/40 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Batch Transfer</span>
              </CardTitle>
              <CardDescription>
                Send multiple transfers at once using CSV or manual entry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                <Label htmlFor="batch-token-select">Select Token</Label>
                <select
                  id="batch-token-select"
                  className="w-full mt-1 p-2 border border-border rounded-md bg-background text-foreground"
                  onChange={(e) => {
                    const token = TOKENS.find(t => t.id === e.target.value)
                    setSelectedToken(token || null)
                  }}
                >
                  <option value="">Choose a token</option>
                  {TOKENS.map((token) => (
                    <option key={token.id} value={token.id}>
                      {token.name}
                    </option>
                  ))}
                </select>
                </div>

              <div>
                <Label>Upload CSV</Label>
                <div className="mt-1">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-border rounded-md bg-background text-foreground hover:bg-muted"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Choose CSV file
                  </label>
                  {csvFile && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {csvFile.name}
                    </span>
                  )}
                    </div>
                {csvError && (
                  <p className="text-sm text-destructive mt-1">{csvError}</p>
                )}
              </div>

                      <div>
                <Label>Manual Entries</Label>
                <div className="space-y-2 mt-1">
                  {batchTransfers.map((transfer, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="Address"
                        value={transfer.address}
                        onChange={(e) => {
                          const newTransfers = [...batchTransfers]
                          newTransfers[index].address = e.target.value
                          setBatchTransfers(newTransfers)
                        }}
                      />
                      <Input
                        placeholder="Amount"
                        type="number"
                        value={transfer.amount}
                        onChange={(e) => {
                          const newTransfers = [...batchTransfers]
                          newTransfers[index].amount = e.target.value
                          setBatchTransfers(newTransfers)
                        }}
                      />
                    <Button
                      variant="ghost"
                      size="sm"
                        onClick={() => {
                          setBatchTransfers(batchTransfers.filter((_, i) => i !== index))
                        }}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBatchTransfers([...batchTransfers, { address: "", amount: "" }])}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transfer
                  </Button>
              </div>
              </div>

              <Button
                onClick={handleBatchTransfer}
                disabled={!selectedToken || batchTransfers.length === 0}
                className="w-full"
              >
                Send Batch Transfer
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Transfer Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
            <DialogDescription>
              Review your confidential transfer details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {transferStatus === 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Token:</span>
                  <span className="font-medium">{selectedToken?.name}</span>
                        </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">{sendAmount}</span>
                        </div>
                <div className="flex justify-between">
                  <span>To:</span>
                  <span className="font-medium text-sm">
                    {sendAddress.slice(0, 6)}...{sendAddress.slice(-4)}
                    </span>
                  </div>
                <Button onClick={handleTransfer} className="w-full">
                  Confirm Transfer
                </Button>
              </div>
            )}

            {transferStatus === 'processing' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <p className="font-medium">Processing Transfer</p>
                  <p className="text-sm text-muted-foreground">
                    {isEncrypting ? 'Encrypting amount...' : 
                     isConfirming ? 'Confirming transaction...' : 
                     'Preparing transaction...'}
                  </p>
                </div>
              </div>
            )}

            {transferStatus === 'success' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-green-500">Transfer Successful!</p>
                  <p className="text-sm text-muted-foreground">
                    Transaction hash: {hash?.slice(0, 10)}...
                  </p>
              </div>
                <Button onClick={() => setIsTransferModalOpen(false)} className="w-full">
                  Close
                </Button>
              </div>
            )}

            {transferStatus === 'error' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-red-500">Transfer Failed</p>
                  <p className="text-sm text-muted-foreground">{transferError}</p>
                </div>
                <Button onClick={() => setIsTransferModalOpen(false)} className="w-full">
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
