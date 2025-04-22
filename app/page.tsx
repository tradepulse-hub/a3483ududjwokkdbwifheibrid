"use client"

import { useEffect, useState, useRef } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import Login from "@/components/Login"
import Image from "next/image"
import { ClaimCoin } from "@/components/ClaimCoin"
import TokenWallet from "@/components/TokenWallet"
import BottomMenu from "@/components/BottomMenu"
import { useLanguage } from "@/lib/languageContext"
import { Lottery } from "@/components/Lottery"
import { motion, AnimatePresence } from "framer-motion"

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
  const [isMenuVisible, setIsMenuVisible] = useState(true)

  // Referência para rastrear se o componente está montado
  const isMounted = useRef(true)

  // Forçar tela cheia e desabilitar rolagem
  useEffect(() => {
    // Definir altura e largura para 100%
    document.documentElement.style.height = "100%"
    document.documentElement.style.width = "100%"
    document.body.style.height = "100%"
    document.body.style.width = "100%"
    document.body.style.overflow = "hidden"
    document.body.style.margin = "0"
    document.body.style.padding = "0"

    // Remover qualquer rolagem
    document.documentElement.style.overflow = "hidden"

    return () => {
      document.documentElement.style.height = ""
      document.documentElement.style.width = ""
      document.body.style.height = ""
      document.body.style.width = ""
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
      document.body.style.margin = ""
      document.body.style.padding = ""
    }
  }, [])

  // Garantir que o menu esteja sempre visível quando mudar de aba
  useEffect(() => {
    if (isMounted.current) {
      setIsMenuVisible(true)
    }
  }, [activeTab])

  // Efeito para restaurar a visibilidade do menu periodicamente
  useEffect(() => {
    const menuVisibilityInterval = setInterval(() => {
      if (isMounted.current && !isMenuVisible) {
        setIsMenuVisible(true)
      }
    }, 1000) // Verificar a cada segundo

    return () => {
      clearInterval(menuVisibilityInterval)
      isMounted.current = false
    }
  }, [isMenuVisible])

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

  // Função para garantir que o menu esteja visível
  const ensureMenuVisible = () => {
    if (!isMenuVisible) {
      setIsMenuVisible(true)
    }
  }

  // Manipulador de mudança de aba que garante que o menu esteja visível
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    ensureMenuVisible()
  }

  if (isLoading) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center justify-center text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500"
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
          <p className="mt-4 text-base font-medium">Loading MiniKit...</p>
          <p className="mt-2 text-xs text-gray-300">Please wait while we initialize the application</p>
        </div>
      </main>
    )
  }

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-white text-black overflow-hidden">
      {/* Animated chart background */}

      {!isLoggedIn ? (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {/* Background overlay for better readability */}

          {/* Área de login com fundo branco */}
          <div className="relative z-10 bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            {/* Logo with glow effect */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"></div>
                <div className="relative z-20 w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-1 shadow-2xl shadow-blue-500/20">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <Image
                      src="/images/tpf-logo.png"
                      width={80}
                      height={80}
                      alt="TPulseFi Logo"
                      className="w-4/5 h-4/5 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Title with animated gradient */}
              <h1 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                TPulseFi
              </h1>

              <p className="text-lg text-gray-600 mb-8">Global Crypto Bridge</p>

              {/* Login button with enhanced styling */}
              <div className="w-full">
                <Login onLoginSuccess={handleLoginSuccess} />
                {loginError && <p className="text-red-500 text-center mt-4 text-sm">{loginError}</p>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col relative">
          {/* Background overlay for better readability when logged in */}

          {/* Header - Mais compacto e único para toda a aplicação */}
          <div className="text-center pt-1 pb-1 bg-white rounded-lg shadow-md border border-gray-200 mb-1">
            <div className="inline-block rounded-full shadow-lg mb-1 p-1 bg-gradient-to-r from-blue-500 to-purple-600">
              <Image
                src="/images/tpf-logo.png"
                width={20}
                height={20}
                className="h-4 w-4 rounded-full"
                alt="TPulseFi Logo"
              />
            </div>
            <h1 className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              TPulseFi
            </h1>
            <p className="text-xs text-gray-500">Global Crypto Bridge</p>
          </div>

          {/* Status bar - Mais compacto */}
          <div className="bg-white rounded-lg shadow-md p-1 border border-gray-200 mb-1">
            <div className="flex justify-end">
              <div className="flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1"></span>
                <span className="text-xs text-gray-600 mr-2">{t("connected", "Connected")}</span>
                <button
                  onClick={handleLogout}
                  className="text-xxs bg-red-500 hover:bg-red-600 text-white px-1.5 py-0.5 rounded-lg transition-all duration-300 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2.5 w-2.5 mr-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  {t("logout", "Logout")}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs de navegação com fundo branco */}
          <div className="bg-white rounded-lg shadow-md p-2 border border-gray-200 mb-2">
            <div className="flex justify-around">
              <button
                onClick={() => handleTabChange("wallet")}
                className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "wallet" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t("wallet", "Wallet")}
              </button>
              <button
                onClick={() => handleTabChange("lottery")}
                className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "lottery" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t("lottery", "Lottery")}
              </button>
              <button
                onClick={() => handleTabChange("airdrop")}
                className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "airdrop" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t("airdrop_zone", "Airdrop Zone")}
              </button>
            </div>
          </div>

          {/* Content based on active tab - Altura fixa e sem rolagem */}
          <div className="flex-1 overflow-hidden bg-white rounded-lg shadow-md border border-gray-200 p-2 mb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
                onAnimationComplete={ensureMenuVisible}
              >
                {activeTab === "wallet" && user.walletAddress && <TokenWallet walletAddress={user.walletAddress} />}

                {activeTab === "lottery" && user.walletAddress && <Lottery userAddress={user.walletAddress} />}

                {activeTab === "airdrop" && user.walletAddress && <ClaimCoin userAddress={user.walletAddress} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Espaço para o menu inferior */}
          <div className="h-14"></div>

          {/* Bottom Menu com a prop de visibilidade */}
          <BottomMenu activeTab={activeTab} onTabChange={handleTabChange} isVisible={isMenuVisible} />
        </div>
      )}
    </main>
  )
}
