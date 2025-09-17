"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  ArrowDown,
  Loader2,
  Info,
  Zap,
  DollarSign,
  Check,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { getTokenAddress, type LiskTokenSymbol } from "@/lib/constants"
import { useContracts } from "@/lib/hooks/useContracts"
import { toast } from "sonner"
import { useWallets } from '@privy-io/react-auth';
import { usePrivy } from '@privy-io/react-auth';

const popularTokens = [
  {
    symbol: "USDC" as LiskTokenSymbol,
    name: "USD Coin",
    address: getTokenAddress("USDC", "lisk"),
    logo: "/usdc-coin-logo-blue-circle.png",
  },
  {
    symbol: "USDT" as LiskTokenSymbol,
    name: "Tether USD",
    address: getTokenAddress("USDT", "lisk"),
    logo: "/usdt-tether-logo-green-circle.png",
  },
  {
    symbol: "WETH" as LiskTokenSymbol,
    name: "Wrapped Ether",
    address: getTokenAddress("WETH", "lisk"),
    logo: "/weth-ethereum-logo-purple-diamond.png",
  },
]

const conversionSteps = [
  { id: 1, title: "Check Balance", description: "Verifying token balance" },
  { id: 2, title: "Approve Tokens", description: "Approving token spending" },
  { id: 3, title: "Deposit to Bridge", description: "Initiating cross-chain transfer" },
  { id: 4, title: "Complete", description: "eTokens created in Sepolia" },
]

export function ConvertPage() {
  const { 
    getLiskBalance, 
    depositTokens, 
    isLoading: contractLoading, 
    error: contractError,
    isConnected,
    userAddress 
  } = useContracts()
  const { wallets } = useWallets();
  const [selectedToken, setSelectedToken] = useState<LiskTokenSymbol | "">("")
  const [customAddress, setCustomAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isConverting, setIsConverting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [conversionComplete, setConversionComplete] = useState(false)
  const [conversionSuccess, setConversionSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [userBalance, setUserBalance] = useState("0")
  const { authenticated } = usePrivy();
  const router = useRouter()

  // **CAMBIADO: Usar la wallet conectada en lugar de la embebida**
  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');

  // Ensure we're on Lisk for conversion operations - solo mostrar advertencia, no cambiar automáticamente
  useEffect(() => {
    if (authenticated && connectedWallet) {
      const currentChainId = connectedWallet.chainId;
      
      // Solo mostrar advertencia si no está en la red correcta
      if (currentChainId !== "4202") {
        console.log("⚠️ User is not on Lisk Sepolia L2 (4202). Current chain:", currentChainId);
        toast.warning("Please switch to Lisk Sepolia L2 network (4202) for conversion operations", {
          duration: 5000,
        });
      }
    }
  }, [authenticated, connectedWallet]);

  // Get user balance when token is selected
  useEffect(() => {
    const fetchBalance = async () => {
      if (selectedToken && isConnected) {
        const balance = await getLiskBalance(selectedToken)
        setUserBalance(balance)
      }
    }
    
    fetchBalance()
  }, [selectedToken, isConnected, getLiskBalance])

  const handleConvert = async () => {
    if (!selectedToken || !amount) {
      toast.error('Please select a token and enter an amount')
      return
    }

    if (parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (parseFloat(amount) > parseFloat(userBalance)) {
      toast.error('Insufficient balance')
      return
    }

    console.log('Starting conversion...'); // Debug log
    setIsLoading(true)
    setIsConverting(true)
    setShowModal(true)
    setCurrentStep(1)
    setConversionComplete(false)
    setConversionSuccess(false)
    setErrorMessage("")

    try {
      // Step 1: Check balance
      console.log('Step 1: Checking balance'); // Debug log
      setCurrentStep(1)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 2: Approve tokens (this is done automatically in depositTokens)
      console.log('Step 2: Approving tokens'); // Debug log
      setCurrentStep(2)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 3: Deposit to bridge
      console.log('Step 3: Depositing to bridge'); // Debug log
      setCurrentStep(3)
      console.log('Calling depositTokens with:', selectedToken, amount); // Debug log
      const success = await depositTokens(selectedToken, amount)
      console.log('depositTokens result:', success); // Debug log
      
      if (!success) {
        throw new Error(contractError || "Error depositing tokens")
      }

      // Step 4: Complete
      console.log('Step 4: Complete'); // Debug log
      setCurrentStep(4)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setConversionSuccess(true)
      setConversionComplete(true)
      
      // Update balance after conversion
      const newBalance = await getLiskBalance(selectedToken)
      setUserBalance(newBalance)
      
    } catch (error) {
      console.error('Conversion error:', error); // Debug log
      setConversionSuccess(false)
      setConversionComplete(true)
      setErrorMessage(error instanceof Error ? error.message : "Conversion failed")
    } finally {
      setIsLoading(false)
      setIsConverting(false)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setCurrentStep(0)
    setConversionComplete(false)
    setConversionSuccess(false)
    setErrorMessage("")
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  const handleMaxClick = () => {
    setAmount(userBalance)
  }

  const handleTokenSelect = (token: LiskTokenSymbol) => {
    setSelectedToken(token)
    setAmount("")
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
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-blue-600">
                      Lisk Sepolia L2 (4202)
                    </span>
                  </div>
                  {connectedWallet.chainId !== "4202" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        connectedWallet.switchChain(4202).catch((error) => {
                          console.error("❌ Failed to switch to Lisk Sepolia L2:", error);
                          toast.error("Please switch to Lisk Sepolia L2 network manually");
                        });
                      }}
                      className="text-xs"
                    >
                      Switch to Lisk Sepolia L2
                    </Button>
                  )}
                </div>
              )}
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </header>

      <main className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Convert to eToken</h1>
            <p className="text-muted-foreground">Convert your ERC-20 tokens to private tokens securely</p>
          </div>

          {(!authenticated || !connectedWallet) && (
            <Card className="border-border/40 shadow-lg mb-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Info className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Connect Your External Wallet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need to connect an external wallet (like MetaMask) to convert tokens
                    </p>
                    <div className="space-y-3">
                    <WalletConnectButton />
                      <div className="text-xs text-muted-foreground">
                        Make sure you're on the <strong>Lisk Sepolia L2</strong> network (ID: 4202) for conversion operations
                      </div>
                    </div>
                  </div>
                  {authenticated && !connectedWallet && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm text-yellow-600">
                        You're authenticated but need to connect an external wallet to convert tokens
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {authenticated && connectedWallet && isConnected && (
            <>
              {/* Token Selection */}
              <Card className="border-border/40 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Select Token</span>
                  </CardTitle>
                  <CardDescription>
                    Choose the token you want to convert to private eTokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {popularTokens.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => handleTokenSelect(token.symbol)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedToken === token.symbol
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={token.logo}
                            alt={token.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="text-left">
                            <p className="font-medium text-foreground">{token.symbol}</p>
                            <p className="text-sm text-muted-foreground">{token.name}</p>
                          </div>
                        </div>
                      </button>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Form */}
              {selectedToken && (
                <Card className="border-border/40 shadow-lg mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Convert {selectedToken}</span>
                    </CardTitle>
                    <CardDescription>
                      Enter the amount you want to convert to private eTokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={handleMaxClick}
                          className="px-4"
                        >
                          Max
                        </Button>
                        </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Available: {userBalance} {selectedToken}
                      </p>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <span>{selectedToken}</span>
                      <ArrowDown className="w-4 h-4" />
                      <span>e{selectedToken}</span>
                    </div>

                    <Button
                      onClick={handleConvert}
                      disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Convert to eToken
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Custom Address (Optional) */}
              <Card className="border-border/40 shadow-lg mb-6">
                <CardHeader>
                  <CardTitle>Custom Recipient (Optional)</CardTitle>
                  <CardDescription>
                    By default, eTokens will be sent to your connected wallet address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-address">Recipient Address</Label>
                  <Input
                    id="custom-address"
                    placeholder="0x..."
                    value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Leave empty to use your connected wallet address: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
                )}
              </div>
      </main>

      {/* Conversion Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Converting to eToken</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="space-y-4">
              {conversionSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 ${
                    currentStep >= step.id ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep > step.id
                        ? "bg-green-500"
                        : currentStep === step.id
                        ? "bg-accent"
                        : "bg-muted"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : currentStep === step.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{step.id}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
              </div>

            {/* Success/Error State */}
            {conversionComplete && (
              <div className="text-center space-y-4">
                {conversionSuccess ? (
                  <>
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-500">Conversion Successful!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your {selectedToken} has been converted to e{selectedToken}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleModalClose} variant="outline" className="flex-1">
                        Convert More
                      </Button>
                      <Button onClick={handleGoToDashboard} className="flex-1">
                        Go to Dashboard
                      </Button>
              </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-500">Conversion Failed</h3>
                      <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    </div>
                    <Button onClick={handleModalClose} className="w-full">
                      Try Again
                    </Button>
                  </>
                )}
              </div>
            )}
        </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
