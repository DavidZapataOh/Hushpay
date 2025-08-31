"use client"

import type React from "react"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { WalletConnectButton } from "@/components/wallet-connect-button"

// Mock data for eTokens
const mockETokens = [
  {
    id: "1",
    name: "eUSDC",
    originalToken: "USDC",
    balance: "1,250.00",
    isBalanceVisible: false,
  },
  {
    id: "2",
    name: "eUSDT",
    originalToken: "USDT",
    balance: "850.50",
    isBalanceVisible: false,
  },
  {
    id: "3",
    name: "eWETH",
    originalToken: "WETH",
    balance: "2.45",
    isBalanceVisible: false,
  },
]

// Mock auditors
const mockAuditors = [
  { address: "0x1234...5678", name: "Auditor Principal" },
  { address: "0xabcd...efgh", name: "Auditor Secundario" },
]

export function DashboardPage() {
  const [eTokens, setETokens] = useState(mockETokens)
  const [auditors, setAuditors] = useState(mockAuditors)
  const [publicKey, setPublicKey] = useState("")
  const [sendAmount, setSendAmount] = useState("")
  const [sendAddress, setSendAddress] = useState("")
  const [batchTransfers, setBatchTransfers] = useState([{ address: "", amount: "" }])
  const [newAuditorAddress, setNewAuditorAddress] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<Array<{ address: string; amount: string }>>([])
  const [csvError, setCsvError] = useState("")
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferStep, setTransferStep] = useState(0)
  const [transferStatus, setTransferStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [transferError, setTransferError] = useState("")
  const [selectedToken, setSelectedToken] = useState<(typeof mockETokens)[0] | null>(null)
  const router = useRouter()

  const toggleBalanceVisibility = (id: string, publicKey: string) => {
    if (!publicKey.trim()) return

    setETokens((tokens) =>
      tokens.map((token) => (token.id === id ? { ...token, isBalanceVisible: !token.isBalanceVisible } : token)),
    )
    setPublicKey("")
  }

  const addBatchTransfer = () => {
    setBatchTransfers([...batchTransfers, { address: "", amount: "" }])
  }

  const removeBatchTransfer = (index: number) => {
    setBatchTransfers(batchTransfers.filter((_, i) => i !== index))
  }

  const updateBatchTransfer = (index: number, field: "address" | "amount", value: string) => {
    setBatchTransfers((transfers) =>
      transfers.map((transfer, i) => (i === index ? { ...transfer, [field]: value } : transfer)),
    )
  }

  const addAuditor = () => {
    if (newAuditorAddress.trim()) {
      setAuditors([
        ...auditors,
        {
          address: newAuditorAddress,
          name: `Auditor ${auditors.length + 1}`,
        },
      ])
      setNewAuditorAddress("")
    }
  }

  const removeAuditor = (address: string) => {
    setAuditors(auditors.filter((auditor) => auditor.address !== address))
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      setCsvError("Please upload a CSV file")
      return
    }

    setCsvFile(file)
    setCsvError("")

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())

      // Skip header if it exists
      const dataLines = lines[0].toLowerCase().includes("address") ? lines.slice(1) : lines

      const parsedData = dataLines
        .map((line, index) => {
          const [address, amount] = line.split(",").map((item) => item.trim())
          if (!address || !amount) {
            setCsvError(`Invalid data at line ${index + 1}`)
            return null
          }
          return { address, amount }
        })
        .filter(Boolean) as Array<{ address: string; amount: string }>

      if (parsedData.length === 0) {
        setCsvError("No valid data found in CSV")
        return
      }

      setCsvData(parsedData)
    }

    reader.readAsText(file)
  }

  const clearCsvData = () => {
    setCsvFile(null)
    setCsvData([])
    setCsvError("")
  }

  const handleTransfer = async (token: (typeof mockETokens)[0]) => {
    setSelectedToken(token)
    setIsTransferModalOpen(true)
    setTransferStatus("processing")
    setTransferStep(0)
    setTransferError("")

    const steps = [
      { name: "Preparing transfer", duration: 1500 },
      { name: "Encrypting transaction", duration: 2000 },
      { name: "Broadcasting to network", duration: 2500 },
      { name: "Confirming transaction", duration: 1500 },
    ]

    try {
      for (let i = 0; i < steps.length; i++) {
        setTransferStep(i)
        await new Promise((resolve) => setTimeout(resolve, steps[i].duration))
      }

      setTransferStatus("success")
      setTransferStep(steps.length)
    } catch (error) {
      setTransferStatus("error")
      setTransferError("Transfer failed. Please try again.")
    }
  }

  const resetTransferModal = () => {
    setIsTransferModalOpen(false)
    setTransferStatus("idle")
    setTransferStep(0)
    setTransferError("")
    setSelectedToken(null)
  }

  const retryTransfer = () => {
    if (selectedToken) {
      handleTransfer(selectedToken)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">eTokens Dashboard</h1>
            <p className="text-muted-foreground">Manage your private tokens and authorized auditors</p>
          </div>

          {/* eTokens Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {eTokens.map((token) => (
              <Card key={token.id} className="border-border/40 shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{token.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {token.originalToken}
                    </Badge>
                  </div>
                  <CardDescription>Private token based on {token.originalToken}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Balance Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Balance</span>
                      {token.isBalanceVisible ? (
                        <span className="font-mono font-medium">{token.balance}</span>
                      ) : (
                        <span className="text-muted-foreground">••••••</span>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          {token.isBalanceVisible ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Hide balance
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Show balance
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Decrypt balance</DialogTitle>
                          <DialogDescription>Enter your public key to decrypt and show the balance</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="public-key">Public key</Label>
                            <Input
                              id="public-key"
                              placeholder="0x..."
                              value={publicKey}
                              onChange={(e) => setPublicKey(e.target.value)}
                            />
                          </div>
                          <Button className="w-full" onClick={() => toggleBalanceVisibility(token.id, publicKey)}>
                            Decrypt
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Send {token.name}</DialogTitle>
                          <DialogDescription>
                            Choose between simple transfer, manual batch, or CSV upload
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Simple Transfer */}
                          <div className="space-y-4">
                            <h4 className="font-medium">Simple transfer</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                  placeholder="0x..."
                                  value={sendAddress}
                                  onChange={(e) => setSendAddress(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                  placeholder="0.00"
                                  value={sendAmount}
                                  onChange={(e) => setSendAmount(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Manual Batch Transfer */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Manual batch transfer</h4>
                              <Button variant="outline" size="sm" onClick={addBatchTransfer}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add recipient
                              </Button>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {batchTransfers.map((transfer, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Input
                                    placeholder="0x..."
                                    value={transfer.address}
                                    onChange={(e) => updateBatchTransfer(index, "address", e.target.value)}
                                    className="flex-1"
                                  />
                                  <Input
                                    placeholder="0.00"
                                    value={transfer.amount}
                                    onChange={(e) => updateBatchTransfer(index, "amount", e.target.value)}
                                    className="w-32"
                                  />
                                  {batchTransfers.length > 1 && (
                                    <Button variant="ghost" size="sm" onClick={() => removeBatchTransfer(index)}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CSV Batch Transfer */}
                          <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">CSV batch transfer</h4>
                              {csvFile && (
                                <Button variant="outline" size="sm" onClick={clearCsvData}>
                                  <X className="w-4 h-4 mr-2" />
                                  Clear CSV
                                </Button>
                              )}
                            </div>

                            {!csvFile ? (
                              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  Upload a CSV file with addresses and amounts
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                  Format: address,amount (one per line)
                                </p>
                                <Label htmlFor="csv-upload" className="cursor-pointer">
                                  <Button variant="outline" size="sm" asChild>
                                    <span>
                                      <FileText className="w-4 h-4 mr-2" />
                                      Choose CSV file
                                    </span>
                                  </Button>
                                </Label>
                                <Input
                                  id="csv-upload"
                                  type="file"
                                  accept=".csv"
                                  onChange={handleCsvUpload}
                                  className="hidden"
                                />
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                                  <FileText className="w-4 h-4 text-accent" />
                                  <span className="text-sm font-medium">{csvFile.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {csvData.length} transfers
                                  </Badge>
                                </div>

                                {csvError && (
                                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                    <p className="text-sm text-destructive">{csvError}</p>
                                  </div>
                                )}

                                {csvData.length > 0 && (
                                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                                    <div className="grid grid-cols-2 gap-2 p-2 bg-muted/20 border-b text-xs font-medium">
                                      <span>Address</span>
                                      <span>Amount</span>
                                    </div>
                                    {csvData.slice(0, 10).map((item, index) => (
                                      <div
                                        key={index}
                                        className="grid grid-cols-2 gap-2 p-2 text-sm border-b last:border-b-0"
                                      >
                                        <span className="font-mono text-xs truncate">{item.address}</span>
                                        <span className="font-mono">{item.amount}</span>
                                      </div>
                                    ))}
                                    {csvData.length > 10 && (
                                      <div className="p-2 text-center text-xs text-muted-foreground">
                                        ... and {csvData.length - 10} more transfers
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <Button
                            className="w-full bg-accent hover:bg-accent/90"
                            disabled={!sendAddress && batchTransfers.every((t) => !t.address) && csvData.length === 0}
                            onClick={() => handleTransfer(token)}
                          >
                            Confirm send
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      To ERC-20
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Auditors Section */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Authorized auditors</CardTitle>
                  <CardDescription>Manage who can audit your private transactions</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add auditor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add auditor</DialogTitle>
                      <DialogDescription>Enter the address of the new authorized auditor</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Auditor address</Label>
                        <Input
                          placeholder="0x..."
                          value={newAuditorAddress}
                          onChange={(e) => setNewAuditorAddress(e.target.value)}
                        />
                      </div>
                      <Button className="w-full" onClick={addAuditor}>
                        Authorize auditor
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditors.map((auditor) => (
                  <div key={auditor.address} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium">{auditor.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{auditor.address}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAuditor(auditor.address)}
                      className="text-destructive hover:text-destructive"
                    >
                      Revoke
                    </Button>
                  </div>
                ))}

                {auditors.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No authorized auditors</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center">
              {transferStatus === "success"
                ? "Transfer Complete!"
                : transferStatus === "error"
                  ? "Transfer Failed"
                  : "Processing Transfer"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {transferStatus === "success"
                ? `Your ${selectedToken?.name} has been sent successfully`
                : transferStatus === "error"
                  ? "There was an issue with your transfer"
                  : "Please wait while we process your transfer"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {transferStatus === "processing" && (
              <div className="space-y-6">
                {[
                  "Preparing transfer",
                  "Encrypting transaction",
                  "Broadcasting to network",
                  "Confirming transaction",
                ].map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {index < transferStep ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : index === transferStep ? (
                        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-pulse">
                          <Clock className="w-3 h-3 text-white animate-spin" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-muted rounded-full border-2 border-border" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        index < transferStep
                          ? "text-green-500"
                          : index === transferStep
                            ? "text-accent"
                            : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {transferStatus === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Transaction Hash:</p>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    0x1234567890abcdef1234567890abcdef12345678
                  </p>
                </div>
              </div>
            )}

            {transferStatus === "error" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-destructive">{transferError}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {transferStatus === "success" && (
              <>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={resetTransferModal}>
                  Close
                </Button>
                <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={resetTransferModal}>
                  Done
                </Button>
              </>
            )}

            {transferStatus === "error" && (
              <>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={resetTransferModal}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={retryTransfer}>
                  Retry
                </Button>
              </>
            )}

            {transferStatus === "processing" && (
              <Button variant="outline" className="w-full bg-transparent" disabled>
                Processing...
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 mt-12">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
              <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">Privacy guaranteed by Zama</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
