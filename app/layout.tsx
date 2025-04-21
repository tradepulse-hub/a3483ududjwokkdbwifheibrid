import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/Navigation"
import { MiniKitProvider } from "@/components/MiniKitProvider"
import { NextAuthProvider } from "@/components/NextAuthProvider"
import Eruda from "@/components/Eruda"
import { LanguageProvider } from "@/lib/languageContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "World App Airdrop",
  description: "Claim your World App Airdrop",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <NextAuthProvider>
            <MiniKitProvider>
              <LanguageProvider>
                <div className="pb-16">
                  {children}
                  <Navigation />
                </div>
                <Eruda />
              </LanguageProvider>
            </MiniKitProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
