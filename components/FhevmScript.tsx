"use client";

import Script from "next/script";

export function FhevmScript() {
  return (
    <Script
      src="https://cdn.zama.ai/relayer-sdk-js/0.1.0-9/relayer-sdk-js.umd.cjs"
      strategy="beforeInteractive"
      onLoad={() => {
        console.log("✅ Relayer SDK CDN loaded successfully");
      }}
      onError={(e) => {
        console.error("❌ Failed to load Relayer SDK CDN:", e);
      }}
    />
  );
}
