"use client"

import { useState } from "react"
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

const popularTokens = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xa0b86a33e6ba3e0e4ca4ba5cf81b2e8e8e8e8e8e",
    logo: "/usdc-coin-logo-blue-circle.png",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0",
    logo: "/usdt-tether-logo-green-circle.png",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0xc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1",
    logo: "/weth-ethereum-logo-purple-diamond.png",
  },
]

const conversionSteps = [
  { id: 1, title: "Approve Token", description: "Approve token spending" },
  { id: 2, title: "Initiate Transfer", description: "Start cross-chain transfer" },
  { id: 3, title: "Encrypt Token", description: "Convert to private eToken" },
  { id: 4, title: "Complete", description: "Conversion successful" },
]

export function ConvertPage() {
  const [selectedToken, setSelectedToken] = useState("")
  const [customAddress, setCustomAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [eTokenExists, setETokenExists] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isConverting, setIsConverting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [conversionComplete, setConversionComplete] = useState(false)
  const [conversionSuccess, setConversionSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const handleConvert = async () => {
    setIsLoading(true)
    setIsConverting(true)
    setShowModal(true)
    setCurrentStep(1)
    setConversionComplete(false)
    setConversionSuccess(false)
    setErrorMessage("")

    try {
      for (let step = 1; step <= 4; step++) {
        setCurrentStep(step)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        if (step === 3 && Math.random() < 0.1) {
          throw new Error("Encryption failed. Please try again.")
        }
      }

      setConversionSuccess(true)
      setConversionComplete(true)
    } catch (error) {
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
    setAmount("1000.00")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
                  <span className="text-xs text-accent-foreground font-bold">H</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Hushpay</span>
              </div>
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

          <Dialog open={showModal} onOpenChange={handleModalClose}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">
                  {conversionComplete
                    ? conversionSuccess
                      ? "Conversion Successful!"
                      : "Conversion Failed"
                    : "Converting Token"}
                </DialogTitle>
              </DialogHeader>

              <div className="py-6">
                {!conversionComplete ? (
                  <div className="space-y-6">
                    <div className="text-center text-sm text-muted-foreground mb-6">
                      Please wait while we process your conversion
                    </div>

                    <div className="space-y-4">
                      {conversionSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              currentStep > step.id
                                ? "bg-green-500 border-green-500 text-white"
                                : currentStep === step.id
                                  ? "bg-accent border-accent text-accent-foreground"
                                  : "border-muted-foreground/30 text-muted-foreground"
                            }`}
                          >
                            {currentStep > step.id ? (
                              <Check className="w-5 h-5" />
                            ) : currentStep === step.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <span className="text-sm font-medium">{step.id}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-medium transition-colors ${
                                currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {step.title}
                            </div>
                            <div
                              className={`text-sm transition-colors ${
                                currentStep >= step.id ? "text-muted-foreground" : "text-muted-foreground/60"
                              }`}
                            >
                              {step.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      {conversionSuccess ? (
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                          <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        {conversionSuccess ? "Token Converted Successfully!" : "Conversion Failed"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {conversionSuccess
                          ? `Your ${amount} tokens have been converted to eTokens and are now available in your dashboard.`
                          : errorMessage || "Something went wrong during the conversion process."}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-3">
                      {conversionSuccess ? (
                        <>
                          <Button onClick={handleGoToDashboard} className="w-full">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            View in Dashboard
                          </Button>
                          <Button variant="outline" onClick={handleModalClose} className="w-full bg-transparent">
                            Convert Another Token
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={handleModalClose} className="w-full">
                            Try Again
                          </Button>
                          <Button variant="outline" onClick={handleModalClose} className="w-full bg-transparent">
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Card className="border-border/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>From</span>
                <Badge variant="secondary" className="text-xs">
                  Lisk
                </Badge>
              </CardTitle>
              <CardDescription>Select the token you want to convert</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Token</Label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {popularTokens.map((token) => (
                    <Button
                      key={token.symbol}
                      variant={selectedToken === token.address ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-center space-y-2"
                      onClick={() => {
                        setSelectedToken(token.address)
                        setCustomAddress("")
                      }}
                      disabled={isConverting}
                    >
                      <img
                        src={token.logo || "/placeholder.svg"}
                        alt={`${token.symbol} logo`}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex flex-col items-center space-y-1">
                        <span className="font-semibold">{token.symbol}</span>
                        <span className="text-xs text-muted-foreground">{token.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-address">Or paste the token address</Label>
                  <Input
                    id="custom-address"
                    placeholder="0x..."
                    value={customAddress}
                    onChange={(e) => {
                      setCustomAddress(e.target.value)
                      setSelectedToken("")
                    }}
                    disabled={isConverting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-16"
                    disabled={isConverting}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 text-xs"
                    onClick={handleMaxClick}
                    disabled={isConverting}
                  >
                    Max
                  </Button>
                </div>
              </div>

              <div className="flex justify-center py-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <ArrowDown className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">To</span>
                    <Badge variant="secondary" className="text-xs">
                      Sepolia
                    </Badge>
                  </div>
                  {!eTokenExists && (
                    <Badge variant="outline" className="text-xs flex items-center space-x-1">
                      <Info className="w-3 h-3" />
                      <span>eToken being created</span>
                    </Badge>
                  )}
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">You will receive</span>
                    <span className="font-medium">{amount || "0.00"} eToken</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm">Fee Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Gas on Lisk</span>
                    </div>
                    <span>~0.001 ETH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">CCIP Fee</span>
                    </div>
                    <span>~0.005 ETH</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
                onClick={handleConvert}
                disabled={(!selectedToken && !customAddress) || !amount || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert to eToken"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
