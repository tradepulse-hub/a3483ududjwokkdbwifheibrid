"use client"

import { useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import Login from "@/components/Login"
import Image from "next/image"
import { ClaimCoin } from "@/components/ClaimCoin"
import TokenWallet from "@/components/TokenWallet"
import BottomMenu from "@/components/BottomMenu"
import ChartBackground from "@/components/ChartBackground"
import { useLanguage } from "@/lib/languageContext"
import { Lottery } from "@/components/Lottery"
import { motion, AnimatePresence } from "framer-motion"
import SafeArea from "@/components/SafeArea"
import { useDeviceDetect } from "@/lib/useDeviceDetect"

interface User {
  walletAddress: string
}

export default function Home() {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState("")
  const [activeTab, setActiveTab] = useState("wallet")
  const [copySuccess, setCopySuccess] = useState(false)
  // Adicionar estado para controlar a visibilidade do menu
  const [isMenuVisible, setIsMenuVisible] = useState(true)

  const deviceInfo = useDeviceDetect()

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  useEffect(() => {
    const checkMiniKit = async () => {
      try {
        const isInstalled = MiniKit.isInstalled()
        if (isInstalled) {
          setIsLoading(false)
          try {
            const response = await fetch("/api/auth/me")
            if (response.ok) {
              const data = await response.json()
              if (data.user) {
                setUser(data.user)
                setIsLoggedIn(true)
              }
            }
          } catch (error) {
            console.error("Error checking auth status:", error)
            setLoginError("Failed to check auth status")
            setIsLoading(false)
          }
        } else {
          setTimeout(checkMiniKit, 500)
        }
      } catch (error) {
        console.error("Error checking MiniKit:", error)
        setIsLoading(false)
        setLoginError("Failed to initialize MiniKit")
      }
    }

    checkMiniKit()
  }, [])

  const handleLoginSuccess = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
    setLoginError("")
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (response.ok) {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Logout error:", error)
      setLoginError("Logout failed")
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  useEffect(() => {
    // Garante que o menu esteja sempre visível quando mudar de aba
    setIsMenuVisible(true)
  }, [activeTab])

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-3 sm:p-4 bg-black text-white">
        <div className="flex flex-col items-center justify-center text-center">
          <svg
            className="animate-spin h-12 w-12 sm:h-16 sm:w-16 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-base sm:text-lg font-medium">Loading MiniKit...</p>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">Please wait while we initialize the application</p>
        </div>
      </main>
    )
  }

  // No retorno da função, passar o estado para o BottomMenu
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-0 bg-black text-white overflow-hidden">
      <SafeArea top bottom>
        {/* Animated chart background */}
        <ChartBackground />

        {!isLoggedIn ? (
          <div className="w-full h-screen flex flex-col items-center justify-center relative">
            {/* Background overlay for better readability */}
            <div className="absolute w-full h-full bg-black/50"></div>

            {/* Logo with glow effect */}
            <div className="relative z-10 mb-8">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-xl animate-pulse"></div>
              <div className="relative z-20 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-1 shadow-2xl shadow-blue-500/20">
                <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                  <Image
                    src="/images/tpf-logo.png"
                    width={120}
                    height={120}
                    alt="TPulseFi Logo"
                    className="w-4/5 h-4/5 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Title with animated gradient */}
            <h1 className="text-5xl sm:text-7xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient relative z-10">
              TPulseFi
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-12 relative z-10">Global Crypto Bridge</p>

            {/* Login button with enhanced styling */}
            <div className="w-full max-w-xs sm:max-w-sm relative z-10">
              <Login onLoginSuccess={handleLoginSuccess} />
              {loginError && <p className="text-red-400 text-center mt-4 text-sm">{loginError}</p>}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto space-y-4 py-4 sm:py-6 px-4 relative z-10 pb-24">
            {/* Background overlay for better readability when logged in */}
            <div className="fixed inset-0 bg-black/70 -z-5"></div>

            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-block rounded-full shadow-lg mb-3 p-2 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
                <Image
                  src="/images/tpf-logo.png"
                  width={40}
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                  alt="TPulseFi Logo"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                TPulseFi
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-400">Global Crypto Bridge</p>
            </div>

            <section className="bg-gray-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-700">
              <div className="flex justify-end">
                <div className="flex items-center">
                  <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full inline-block animate-pulse mr-1.5"></span>
                  <span className="text-xs text-gray-300">{t("connected", "Connected")}</span>
                </div>
              </div>
            </section>

            {/* Content based on active tab */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[300px]"
              >
                {activeTab === "wallet" && user.walletAddress && <TokenWallet walletAddress={user.walletAddress} />}

                {activeTab === "lottery" && user.walletAddress && <Lottery userAddress={user.walletAddress} />}

                {activeTab === "airdrop" && user.walletAddress && <ClaimCoin userAddress={user.walletAddress} />}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Menu com a prop de visibilidade */}
            <BottomMenu activeTab={activeTab} onTabChange={setActiveTab} isVisible={isMenuVisible} />
          </div>
        )}
      </SafeArea>
    </main>
  )
}
