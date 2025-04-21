"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/languageContext"
import ReceiveTokenModal from "./ReceiveTokenModal"

type TokenInfo = {
  symbol: string
  name: string
  gradient: string
  logo: string
  address: string
  verified?: boolean
}

// Adicionar uma prop para controlar a visibilidade do menu
export default function ReceiveTokensModal({
  isOpen,
  onClose,
  setMenuVisible,
}: {
  isOpen: boolean
  onClose: () => void
  setMenuVisible?: (visible: boolean) => void // Nova prop
}) {
  const { t } = useLanguage()
  const [tokens, setTokens] = useState<TokenInfo[]>([
    {
      symbol: "TPF",
      name: "TPulseFi",
      gradient: "from-blue-500 to-purple-600",
      logo: "/images/tpf-logo.png",
      address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
      verified: true,
    },
    {
      symbol: "WLD",
      name: "WorldCoin",
      gradient: "from-green-500 to-blue-600",
      logo: "/images/worldcoin-logo.jpeg",
      address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      verified: true,
    },
  ])
  const [walletAddress, setWalletAddress] = useState("")
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)

  // Ocultar o menu quando o modal abrir
  useEffect(() => {
    // Não altere a visibilidade do menu principal
    // Apenas gerencie o estado interno do modal
  }, [isOpen])

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose])

  // Fechar modal ao clicar fora
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains("modal-backdrop")) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("click", handleOutsideClick)
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick)
    }
  }, [isOpen, onClose])

  // Buscar endereço da carteira
  useEffect(() => {
    if (!isOpen) return

    const fetchUserData = async () => {
      try {
        // Buscar dados do usuário
        const userResponse = await fetch("/api/auth/me")
        const userData = await userResponse.json()

        if (userData.authenticated && userData.user && userData.user.walletAddress) {
          setWalletAddress(userData.user.walletAddress)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [isOpen])

  const handleTokenSelect = (token: TokenInfo) => {
    setSelectedToken(token)
    setIsReceiveModalOpen(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center modal-backdrop bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-5 shadow-2xl animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 5v14" />
              <path d="m5 12 7 7 7-7" />
            </svg>
            {t("receive", "Receive")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={t("close", "Close")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-300 mb-4">{t("select_token_to_receive", "Select a token to receive:")}</p>

        <div className="space-y-3">
          {tokens.map((token) => (
            <div
              key={token.symbol}
              className="p-3 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-700/50 cursor-pointer transition-colors"
              onClick={() => handleTokenSelect(token)}
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br ${token.gradient} p-0.5`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                      <Image
                        src={token.logo || "/placeholder.svg"}
                        alt={`${token.symbol} logo`}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {token.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center border-2 border-gray-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2 w-2 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="font-medium text-sm text-white">{token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          {t("wallet_address", "Wallet Address:")} {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      </div>

      {/* Receive Token Modal */}
      {selectedToken && (
        <ReceiveTokenModal
          isOpen={isReceiveModalOpen}
          onClose={() => {
            setIsReceiveModalOpen(false)
            setSelectedToken(null)
          }}
          walletAddress={walletAddress}
          tokenSymbol={selectedToken.symbol}
          tokenLogo={selectedToken.logo}
          tokenName={selectedToken.name}
          setMenuVisible={setMenuVisible}
        />
      )}
    </div>
  )
}
