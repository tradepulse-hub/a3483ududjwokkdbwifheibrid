import type React from "react"
import type { Metadata } from "next"
import { Sora } from "next/font/google"
import "./globals.css"
import MiniKitProvider from "@/components/minikit-provider"
import NextAuthProvider from "@/components/next-auth-provider"
import LanguageProvider from "@/components/LanguageProvider"
import LanguageSelector from "@/components/LanguageSelector"
import "@worldcoin/mini-apps-ui-kit-react/styles.css"

const sora = Sora({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WLD101",
  description: "Template mini app for Worldcoin",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${sora.className} bg-black text-white`}>
        <NextAuthProvider>
          <MiniKitProvider>
            <LanguageProvider>
              <LanguageSelector />
              {children}
            </LanguageProvider>
          </MiniKitProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
