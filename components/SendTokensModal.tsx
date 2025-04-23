"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/languageContext"
import SendTokenModal from "./SendTokenModal"
import SendTPFModal from "./SendTPFModal"
import SendDNAModal from "./SendDNAModal"
import SendWDDModal from "./SendWDDModal"
import SendCASHModal from "./SendCASHModal"

type TokenInfo = {
  symbol: string
  name: string
  quantity: string | null
  gradient: string
  logo: string
  loading?: boolean
  error?: string
  address: string
  verified?: boolean
}

// Alterar a cor da janela do modal de envio para cinza
export default function SendTokensModal({
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
      quantity: null,
      gradient: "from-gray-600 to-gray-700",
      logo: "/images/tpf-logo-new.png",
      address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
      verified: true,
    },
    {
      symbol: "WLD",
      name: "WorldCoin",
      quantity: null,
      gradient: "from-gray-600 to-gray-700",
      logo: "/images/worldcoin-logo.jpeg",
      address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      verified: true,
    },
    {
      symbol: "DNA",
      name: "DNA Token",
      quantity: null,
      gradient: "from-amber-500 to-amber-600",
      logo: "/images/dna-token-logo.png",
      address: "0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113",
      verified: true,
    },
    {
      symbol: "WDD",
      name: "Drachma",
      quantity: null,
      gradient: "from-purple-500 to-purple-600",
      logo: "/images/drachma-logo.png",
      address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B",
      verified: false,
    },
    {
      symbol: "CASH",
      name: "Cash",
      quantity: null,
      gradient: "from-gray-400 to-gray-500",
      logo: "/images/cash-logo.png",
      address: "0xbfdA4F50a2d5B9b864511579D7dfa1C72f118575",
      verified: false,
    },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState("")
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isSendTPFModalOpen, setIsSendTPFModalOpen] = useState(false)
  const [isSendDNAModalOpen, setIsSendDNAModalOpen] = useState(false)
  const [isSendWDDModalOpen, setIsSendWDDModalOpen] = useState(false)
  const [isSendCASHModalOpen, setIsSendCASHModalOpen] = useState(false)

  // Ocultar o menu quando o modal abrir
  useEffect(() => {
    if (isOpen && setMenuVisible) {
      setMenuVisible(false)
    }

    // Restaurar a visibilidade do menu quando o modal fechar
    return () => {
      if (setMenuVisible) {
        setMenuVisible(true)
      }
    }
  }, [isOpen, setMenuVisible])

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

  // Buscar tokens e endereço da carteira
  useEffect(() => {
    if (!isOpen) return

    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        // Buscar dados do usuário
        const userResponse = await fetch("/api/auth/me")
        const userData = await userResponse.json()

        if (userData.authenticated && userData.user && userData.user.walletAddress) {
          setWalletAddress(userData.user.walletAddress)

          // Buscar saldo de TPF
          const tpfResponse = await fetch(`/api/token-balance?address=${userData.user.walletAddress}`)
          const tpfData = await tpfResponse.json()

          // Buscar saldo de WLD
          const wldResponse = await fetch(`/api/ethers-wld-balance?address=${userData.user.walletAddress}`)
          const wldData = await wldResponse.json()

          // Buscar saldo de DNA
          const dnaResponse = await fetch(`/api/dna-token-balance?address=${userData.user.walletAddress}`)
          const dnaData = await dnaResponse.json()

          // Simular saldo de WDD
          const wddBalance = (Math.random() * 1000).toFixed(2)

          // Simular saldo de CASH
          const cashBalance = (Math.random() * 500).toFixed(2)

          // Formatar os dados dos tokens
          const tokensData: TokenInfo[] = [
            {
              symbol: "TPF",
              name: "TPulseFi",
              quantity: tpfData.error
                ? "0.00"
                : tpfData.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
              gradient: "from-gray-600 to-gray-700",
              logo: "/images/tpf-logo-new.png",
              address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
              verified: true,
            },
            {
              symbol: "WLD",
              name: "WorldCoin",
              quantity: wldData.error
                ? "0.00"
                : wldData.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
              gradient: "from-gray-600 to-gray-700",
              logo: "/images/worldcoin-logo.jpeg",
              address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
              verified: true,
            },
            {
              symbol: "DNA",
              name: "DNA Token",
              quantity: dnaData.error
                ? "0.00"
                : dnaData.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
              gradient: "from-amber-500 to-amber-600",
              logo: "/images/dna-token-logo.png",
              address: "0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113",
              verified: true,
            },
            {
              symbol: "WDD",
              name: "Drachma",
              quantity: wddBalance,
              gradient: "from-purple-500 to-purple-600",
              logo: "/images/drachma-logo.png",
              address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B",
              verified: false,
            },
            {
              symbol: "CASH",
              name: "Cash",
              quantity: cashBalance,
              gradient: "from-gray-400 to-gray-500",
              logo: "/images/cash-logo.png",
              address: "0xbfdA4F50a2d5B9b864511579D7dfa1C72f118575",
              verified: false,
            },
          ]

          setTokens(tokensData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [isOpen])

  const handleTokenSelect = (token: TokenInfo) => {
    setSelectedToken(token)
    if (token.symbol === "TPF") {
      setIsSendTPFModalOpen(true)
    } else if (token.symbol === "DNA") {
      setIsSendDNAModalOpen(true)
    } else if (token.symbol === "WDD") {
      setIsSendWDDModalOpen(true)
    } else if (token.symbol === "CASH") {
      setIsSendCASHModalOpen(true)
    } else {
      setIsSendModalOpen(true)
    }
  }

  const handleTransactionSuccess = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-400 rounded-xl w-full max-w-md p-5 shadow-2xl animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
            {t("send", "Send")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
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

        <p className="text-xs text-gray-700 mb-4">{t("select_token_to_send", "Select a token to send:")}</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-100/80 backdrop-blur-sm animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-3 bg-gray-300"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.symbol}
                className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 backdrop-blur-sm border border-gray-300 cursor-pointer transition-colors"
                onClick={() => handleTokenSelect(token)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br ${token.gradient} p-0.5`}
                      >
                        <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
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
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
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
                      <div className="font-medium text-gray-800">{token.symbol}</div>
                      <div className="text-xs text-gray-600">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-800">{token.quantity}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-600">
          {t("wallet_address", "Wallet Address:")} {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      </div>

      {/* Send Token Modal for WLD */}
      {selectedToken && selectedToken.symbol === "WLD" && (
        <SendTokenModal
          isOpen={isSendModalOpen}
          onClose={() => {
            setIsSendModalOpen(false)
            setSelectedToken(null)
          }}
          walletAddress={walletAddress}
          tokenSymbol={selectedToken.symbol}
          tokenLogo={selectedToken.logo}
          tokenName={selectedToken.name}
          onSuccess={handleTransactionSuccess}
          setMenuVisible={setMenuVisible}
        />
      )}

      {/* Send TPF Modal */}
      {selectedToken && selectedToken.symbol === "TPF" && (
        <SendTPFModal
          isOpen={isSendTPFModalOpen}
          onClose={() => {
            setIsSendTPFModalOpen(false)
            setSelectedToken(null)
          }}
          walletAddress={walletAddress}
          tokenLogo={selectedToken.logo}
          onSuccess={handleTransactionSuccess}
          setMenuVisible={setMenuVisible}
        />
      )}

      {/* Send DNA Modal */}
      {selectedToken && selectedToken.symbol === "DNA" && (
        <SendDNAModal
          isOpen={isSendDNAModalOpen}
          onClose={() => {
            setIsSendDNAModalOpen(false)
            setSelectedToken(null)
          }}
          walletAddress={walletAddress}
          tokenLogo={selectedToken.logo}
          onSuccess={handleTransactionSuccess}
          setMenuVisible={setMenuVisible}
        />
      )}

      {/* Send WDD Modal */}
      {selectedToken && selectedToken.symbol === "WDD" && (
        <SendWDDModal
          isOpen={isSendWDDModalOpen}
          onClose={() => {
            setIsSendWDDModalOpen(false)
            setSelectedToken(null)
          }}
          walletAddress={walletAddress}
          tokenLogo={selectedToken.logo}
          onSuccess={handleTransactionSuccess}
          setMenuVisible={setMenuVisible}
        />
      )}

      {/* Send CASH Modal */}
      {selectedToken && selectedToken.symbol === "CASH" && (
        <SendCASHModal
          isOpen={isSendCASHModalOpen}
          onClose={() => {
            setIsSendCASHModalOpen(false)
            setSelectedToken(null)
          }}
          walletAddress={walletAddress}
          tokenLogo={selectedToken.logo}
          onSuccess={handleTransactionSuccess}
          setMenuVisible={setMenuVisible}
        />
      )}
    </div>
  )
}
