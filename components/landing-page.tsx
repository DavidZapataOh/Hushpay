"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Shield, Users, Zap, Lock, Eye, Smartphone, CheckCircle, Star, Quote } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePrivy, useWallets } from '@privy-io/react-auth'

export function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [animationPhase, setAnimationPhase] = useState(0)
  const { login, logout, authenticated, user, ready } = usePrivy()
  const { wallets } = useWallets();
  
  // **CAMBIADO: Usar la wallet conectada en lugar de la embebida**
  const connectedWallet = wallets.find(wallet => wallet.type === 'ethereum');
  const displayAddress = connectedWallet?.address || user?.wallet?.address;

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      name: "Alex Chen",
      role: "DeFi Trader",
      content: "Hushpay has revolutionized how I handle my crypto transactions. The privacy features are unmatched.",
      rating: 5,
    },
    {
      name: "Sarah Martinez",
      role: "Crypto Investor",
      content: "Finally, a solution that prioritizes privacy without compromising on usability. Highly recommended!",
      rating: 5,
    },
    {
      name: "Michael Thompson",
      role: "Blockchain Developer",
      content: "The Zama integration is brilliant. This is the future of private transactions.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hushpay-logo-E9eJqeg0vhhU2npVWRpvbBpIDeYfpp.png"
                  alt="Hushpay Logo"
                  className="w-10 h-10 object-contain"
                  style={{ transform: "scale(1.8)" }}
                />
              </div>
              <span className="text-xl font-semibold text-foreground">Hushpay</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link href="#security" className="text-muted-foreground hover:text-foreground transition-colors">
                Security
              </Link>
              <Link href="/convert" className="text-muted-foreground hover:text-foreground transition-colors">
                Convert
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </nav>
            {/* Privy Connect Button */}
            <div className="flex items-center space-x-4">
              {ready && (
                <>
                  {authenticated ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground">
                        {displayAddress ? 
                          `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}` : 
                          'Connected'
                        }
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={logout}
                        className="border-border hover:bg-card"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={login}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0 bg-gradient-to-br from-transparent via-accent/5 to-transparent"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
                animation: "gridMove 20s linear infinite",
              }}
            />
          </div>

          {/* Floating orbs */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse" />
          <div
            className="absolute bottom-20 right-20 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-10 w-24 h-24 bg-accent/15 rounded-full blur-lg animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Text content */}
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 text-balance leading-tight">
                Transform Tokens Into{" "}
                <span className="relative">
                  <span className="text-accent bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent">
                    Private Assets
                  </span>
                  <div className="absolute -inset-2 bg-accent/20 blur-xl rounded-lg opacity-30 animate-pulse" />
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl text-pretty leading-relaxed">
                Experience the future of DeFi privacy. Convert any ERC-20 token into encrypted assets using cutting-edge
                Zama technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-16">
                <Link href="/convert">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-12 py-6 text-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-accent/25 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    Start Converting
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-12 py-6 text-xl font-semibold border-2 border-border hover:bg-card transition-all duration-300 bg-transparent hover:border-accent/50"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>Bank-Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-accent" />
                  <span>Zero-Knowledge Proofs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span>Instant Conversion</span>
                </div>
              </div>
            </div>

            {/* Right side - Animated visualization */}
            <div className="relative h-[600px] flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Teleportation chamber base */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 rounded-full border-2 border-accent/30 relative">
                    {/* Rotating rings */}
                    <div
                      className="absolute inset-4 rounded-full border border-accent/20 animate-spin"
                      style={{ animationDuration: "8s" }}
                    />
                    <div
                      className="absolute inset-8 rounded-full border border-accent/15 animate-spin"
                      style={{ animationDuration: "12s", animationDirection: "reverse" }}
                    />
                    <div
                      className="absolute inset-12 rounded-full border border-accent/10 animate-spin"
                      style={{ animationDuration: "16s" }}
                    />

                    {/* Central glow */}
                    <div className="absolute inset-20 rounded-full bg-accent/5 blur-xl animate-pulse" />
                    <div
                      className="absolute inset-24 rounded-full bg-accent/10 blur-lg animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    />
                  </div>
                </div>

                {/* Token transformation sequence */}
                <div className="relative z-10 flex items-center justify-center h-full">
                  {/* Input token (left side) */}
                  <div
                    className={`absolute left-8 transition-all duration-1000 ${
                      animationPhase >= 1 ? "opacity-50 scale-75 translate-x-20" : "opacity-100 scale-100"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                        <img src="/usdc-coin-logo-blue-circle.png" alt="USDC" className="w-12 h-12" />
                      </div>
                      <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
                      <div className="text-center mt-3 text-sm font-medium text-foreground">USDC</div>
                    </div>
                  </div>

                  {/* Transformation beam */}
                  <div
                    className={`absolute left-32 w-32 h-1 transition-all duration-1000 ${
                      animationPhase >= 1
                        ? "bg-gradient-to-r from-accent via-accent/80 to-accent opacity-100"
                        : "opacity-0"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent via-white to-accent blur-sm animate-pulse" />
                    {/* Particle effects */}
                    <div className="absolute top-0 left-0 w-2 h-2 bg-accent rounded-full animate-ping" />
                    <div
                      className="absolute top-0 left-8 w-1 h-1 bg-accent/80 rounded-full animate-ping"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="absolute top-0 left-16 w-1 h-1 bg-accent/60 rounded-full animate-ping"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>

                  {/* Central transformation portal */}
                  <div
                    className={`absolute transition-all duration-1000 ${
                      animationPhase >= 1 ? "scale-110 opacity-100" : "scale-100 opacity-70"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border-2 border-accent/40 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-accent animate-pulse" />
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl animate-pulse" />

                      {/* Encryption particles */}
                      {animationPhase >= 2 && (
                        <>
                          <div className="absolute -top-2 -left-2 w-3 h-3 bg-accent rounded-full animate-bounce" />
                          <div
                            className="absolute -top-2 -right-2 w-2 h-2 bg-accent/80 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="absolute -bottom-2 -left-2 w-2 h-2 bg-accent/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="absolute -bottom-2 -right-2 w-3 h-3 bg-accent/80 rounded-full animate-bounce"
                            style={{ animationDelay: "0.3s" }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Output beam */}
                  <div
                    className={`absolute right-32 w-32 h-1 transition-all duration-1000 ${
                      animationPhase >= 2 ? "bg-gradient-to-r from-accent to-purple-500 opacity-100" : "opacity-0"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent via-purple-400 to-purple-500 blur-sm animate-pulse" />
                    {/* Encrypted particles */}
                    <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                    <div
                      className="absolute top-0 right-8 w-1 h-1 bg-purple-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="absolute top-0 right-16 w-1 h-1 bg-accent rounded-full animate-ping"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>

                  {/* Output eToken (right side) */}
                  <div
                    className={`absolute right-8 transition-all duration-1000 ${
                      animationPhase >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-75 -translate-x-20"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-accent to-purple-600 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent animate-pulse" />
                        <Shield className="w-10 h-10 text-white relative z-10" />
                      </div>
                      <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg animate-pulse" />
                      <div className="text-center mt-3 text-sm font-medium text-foreground">eUSDC</div>
                      <div className="text-center text-xs text-muted-foreground">Encrypted</div>
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-full px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                          animationPhase === 0
                            ? "bg-muted"
                            : animationPhase === 1
                              ? "bg-yellow-500 animate-pulse"
                              : animationPhase === 2
                                ? "bg-accent animate-pulse"
                                : "bg-green-500"
                        }`}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {animationPhase === 0 && "Ready to Convert"}
                        {animationPhase === 1 && "Processing..."}
                        {animationPhase === 2 && "Encrypting..."}
                        {animationPhase === 3 && "Conversion Complete"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Why Choose Hushpay?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the next generation of private cryptocurrency transactions with enterprise-grade security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Total Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground text-lg leading-relaxed">
                  Your transactions remain completely private thanks to Zama's homomorphic encryption technology. No one
                  can see your balance or transaction history.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground text-lg leading-relaxed">
                  Manage authorized auditors who can verify your transactions when necessary. You maintain full control
                  over who can access your data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Flexible Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground text-lg leading-relaxed">
                  Perform individual or batch transfers efficiently and securely. Our optimized smart contracts ensure
                  fast and cost-effective transactions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <Lock className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Bank-Grade Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground text-lg leading-relaxed">
                  Multi-layered security protocols protect your assets. Our smart contracts are audited and
                  battle-tested for maximum security.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <Eye className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Zero Knowledge</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground text-lg leading-relaxed">
                  Prove transactions without revealing sensitive information. Our zero-knowledge proofs ensure complete
                  privacy while maintaining verifiability.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                  <Smartphone className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">User-Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground text-lg leading-relaxed">
                  Intuitive interface designed for both beginners and experts. Complex privacy technology made simple
                  and accessible for everyone.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">How Hushpay Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our three-step process makes private transactions simple and secure
            </p>
          </div>

          <div className="space-y-16">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4">
                    <span className="text-accent-foreground font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">Connect Your Wallet</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Connect your preferred wallet to Hushpay. We support all major wallets including MetaMask,
                  WalletConnect, and more. Your wallet remains secure throughout the process.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mr-3" />
                    Secure wallet integration
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mr-3" />
                    Multiple wallet support
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mr-3" />
                    No private key exposure
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="w-full h-64 bg-card rounded-2xl border border-border flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
                    <p className="text-muted-foreground">Wallet Connection Interface</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4">
                    <span className="text-accent-foreground font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">Convert to eTokens</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Select your ERC-20 tokens and convert them to private eTokens. Our smart contracts handle the
                  conversion securely using Zama's encryption technology.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mr-3" />
                    Instant conversion process
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mr-3" />
                    Homomorphic encryption
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mr-3" />
                    Minimal gas fees
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="w-full h-64 bg-card rounded-2xl border border-border flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-16 h-16 text-accent mx-auto mb-4" />
                    <p className="text-muted-foreground">Token Conversion Interface</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4">
                    <span className="text-accent-foreground font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">Manage & Transfer</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Use your private eTokens for transactions, manage auditor permissions, and convert back to original
                  tokens whenever needed. Full control, complete privacy.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mr-3" />
                    Private transactions
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mr-3" />
                    Auditor management
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-accent mr-3" />
                    Instant redemption
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <div className="w-full h-64 bg-card rounded-2xl border border-border flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-accent mx-auto mb-4" />
                    <p className="text-muted-foreground">Dashboard Management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Benefits Section */}
      <section id="security" className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Enterprise-Grade Security</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with the highest security standards to protect your digital assets
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-8">Security Features</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-2">Homomorphic Encryption</h4>
                    <p className="text-muted-foreground">
                      Powered by Zama's cutting-edge technology for computation on encrypted data
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-2">Smart Contract Audits</h4>
                    <p className="text-muted-foreground">
                      Thoroughly audited by leading security firms for maximum protection
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-2">Zero-Knowledge Proofs</h4>
                    <p className="text-muted-foreground">Verify transactions without revealing sensitive information</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-2">Multi-Signature Protection</h4>
                    <p className="text-muted-foreground">Additional security layers for high-value transactions</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border">
              <div className="text-center">
                <Lock className="w-24 h-24 text-accent mx-auto mb-6" />
                <h4 className="text-2xl font-bold text-foreground mb-4">Your Privacy is Guaranteed</h4>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  With Hushpay, your transaction history, balances, and personal information remain completely private.
                  Even we cannot see your encrypted data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied users who trust Hushpay for their privacy needs
            </p>
          </div>

          <div className="relative">
            <Card className="border-border/40 shadow-xl">
              <CardContent className="p-12">
                <div className="text-center">
                  <Quote className="w-12 h-12 text-accent mx-auto mb-6" />
                  <blockquote className="text-2xl font-medium text-foreground mb-8 leading-relaxed">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-accent fill-current" />
                    ))}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-foreground">{testimonials[currentTestimonial].name}</p>
                    <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? "bg-accent" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-accent/10 via-background to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">Ready to Go Private?</h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join the privacy revolution. Start converting your tokens to private eTokens today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/convert">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-12 py-6 text-2xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl"
              >
                Start Now
                <ArrowRight className="ml-3 w-7 h-7" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="px-12 py-6 text-2xl font-bold border-2 border-border hover:bg-card transition-all duration-300 bg-transparent"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hushpay-logo-E9eJqeg0vhhU2npVWRpvbBpIDeYfpp.png"
                    alt="Hushpay Logo"
                    className="w-8 h-8 object-contain"
                    style={{ transform: "scale(1.6)" }}
                  />
                </div>
                <span className="text-2xl font-bold text-foreground">Hushpay</span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                The future of private cryptocurrency transactions. Built with Zama technology for absolute privacy and
                security.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/convert" className="text-muted-foreground hover:text-foreground transition-colors">
                    Convert
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-muted-foreground hover:text-foreground transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground mb-4 md:mb-0">
              © 2024 Hushpay. Built with Zama technology for total privacy.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">
                Security
              </Link>
              <Link href="/audit" className="text-muted-foreground hover:text-foreground transition-colors">
                Audit Report
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Added custom CSS animations
const styles = `
  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
`

export default function LandingPageWithStyles() {
  return (
    <>
      <LandingPage />
      <style jsx>{styles}</style>
    </>
  )
}
