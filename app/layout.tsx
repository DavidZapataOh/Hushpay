import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { cn } from "@/lib/utils"
import Providers from "./PrivyProvider"
import { FhevmProvider } from "./FhevmProvider"
import { Toaster } from "sonner"
import "./globals.css"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Hushpay - Private Token Management",
  description: "Secure and private token management with FHEVM technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://cdn.zama.ai/relayer-sdk-js/0.1.0-9/relayer-sdk-js.umd.cjs"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <Providers>
          <FhevmProvider>
            {children}
            <Toaster />
          </FhevmProvider>
        </Providers>
      </body>
    </html>
  )
}
