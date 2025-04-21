"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import SendTokenModal from "./SendTokenModal"
import SendTPFModal from "./SendTPFModal"
import ReceiveTokenModal from "./ReceiveTokenModal"
import TokenDetailModal from "./TokenDetailModal"
import { useLanguage } from "@/lib/languageContext"
import { useDeviceDetect } from "@/lib/useDeviceDetect"

type TokenWalletProps = {
  walletAddress: string
}

// Adicionar a propriedade verified ao tipo TokenInfo
type TokenInfo = {
  symbol: string
  name: string
  quantity: string | null
  gradient: string
  logo: string
  loading?: boolean
  error?: string
  details?: string
  address: string
  price?: number
  priceSource?: string
  verified?: boolean // Nova propriedade para indicar se o token é verificado
}

export default function TokenWallet({ walletAddress }: TokenWalletProps) {
  const { t } = useLanguage()
  // Atualizar o estado inicial dos tokens para incluir a propriedade verified
  const [tokens, setTokens] = useState<TokenInfo[]>([
    {
      symbol: "TPF",
      name: "TPulseFi",
      quantity: null,
      gradient: "from-blue-500 to-purple-600",
      logo: "/images/tpf-logo.png",
      loading: true,
      address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
      verified: true, // Token verificado
    },
    {
      symbol: "WLD",
      name: "WorldCoin",
      quantity: null,
      gradient: "from-green-500 to-blue-600",
      logo: "/images/worldcoin-logo.jpeg",
      loading: true,
      address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      verified: true, // Token verificado
    },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isSendTPFModalOpen, setIsSendTPFModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const deviceInfo = useDeviceDetect()

  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!walletAddress) return

      setIsLoading(true)

      // Initialize tokens with loading state
      setTokens((prev) =>
        prev.map((token) => ({
          ...token,
          loading: true,
          error: undefined,
          details: undefined,
          quantity: null,
          price: undefined,
          priceSource: undefined,
        })),
      )

      // Fetch TPF balance
      const fetchTPFBalance = async () => {
        try {
          console.log(`Fetching TPF balance...`)
          const response = await fetch(`/api/token-balance?address=${walletAddress}&_=${Date.now()}`)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to fetch TPF balance")
          }

          const data = await response.json()
          console.log(`TPF balance data:`, data)

          if (data.error) {
            throw new Error(data.error)
          }

          // Format balance with 2 decimal places
          const formattedBalance = data.balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })

          // Fetch TPF price from API
          const priceResponse = await fetch(`/api/token-price?symbol=TPF`)
          const priceData = await priceResponse.json()

          return {
            quantity: formattedBalance,
            error: undefined,
            loading: false,
            price: priceData.price,
            priceSource: priceData.source,
          }
        } catch (error) {
          console.error(`Error fetching TPF balance:`, error)
          return {
            quantity: null,
            error: error instanceof Error ? error.message : "Failed to fetch TPF balance",
            loading: false,
          }
        }
      }

      // Fetch WLD balance using the new API with ethers.js
      const fetchWLDBalance = async () => {
        try {
          console.log(`Fetching WLD balance using ethers.js...`)
          const response = await fetch(`/api/ethers-wld-balance?address=${walletAddress}&_=${Date.now()}`)
          const data = await response.json()

          console.log(`WLD balance response:`, data)

          if (data.error) {
            return {
              quantity: null,
              error: data.error,
              details: data.details,
              loading: false,
            }
          }

          // Format balance with 2 decimal places
          const formattedBalance = data.balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })

          // Fetch WLD price from API
          const priceResponse = await fetch(`/api/token-price?symbol=WLD`)
          const priceData = await priceResponse.json()

          return {
            quantity: formattedBalance,
            error: undefined,
            details: undefined,
            loading: false,
            price: priceData.price,
            priceSource: priceData.source,
          }
        } catch (error) {
          console.error(`Error fetching WLD balance:`, error)
          return {
            quantity: null,
            error: error instanceof Error ? error.message : "Failed to fetch WLD balance",
            loading: false,
          }
        }
      }

      // Fetch balances in parallel
      const [tpfResult, wldResult] = await Promise.all([fetchTPFBalance(), fetchWLDBalance()])

      // Update tokens with results
      setTokens((prev) => [
        {
          ...prev[0],
          ...tpfResult,
        },
        {
          ...prev[1],
          ...wldResult,
        },
      ])

      setIsLoading(false)
    }

    fetchTokenBalances()
  }, [walletAddress, refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
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

  const handleSendClick = (token: TokenInfo) => {
    setSelectedToken(token)
    if (token.symbol === "TPF") {
      setIsSendTPFModalOpen(true)
    } else {
      setIsSendModalOpen(true)
    }
  }

  const handleReceiveClick = (token: TokenInfo) => {
    setSelectedToken(token)
    setIsReceiveModalOpen(true)
  }

  const handleTokenClick = (token: TokenInfo) => {
    setSelectedToken(token)
    setIsDetailModalOpen(true)
  }

  const handleTransactionSuccess = () => {
    // Refresh token balances after successful transaction
    setTimeout(() => {
      handleRefresh()
    }, 5000) // Wait 5 seconds before refreshing to allow transaction to be processed
  }

  // Filter tokens to only show those with a balance
  const tokensWithBalance = tokens.filter((token) => token.quantity !== null && Number.parseFloat(token.quantity) > 0)
  const tokensWithoutBalance = tokens.filter(
    (token) => token.quantity === null || Number.parseFloat(token.quantity) === 0,
  )

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Cabeçalho da wallet mais compacto */}
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl p-3 border border-gray-700/50 mb-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {t("my_tokens", "My Tokens")}
          </h3>
          <button
            onClick={handleRefresh}
            className="text-xs bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-500 hover:to-purple-500 text-white px-2 py-1 rounded-lg transition-all duration-300 flex items-center shadow-md hover:shadow-blue-600/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                <span className="text-xs">{t("refreshing", "Refreshing...")}</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-xs">{t("refresh", "Refresh")}</span>
              </>
            )}
          </button>
        </div>

        {/* Lista de tokens mais compacta */}
        <div className="space-y-2 overflow-auto max-h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="p-2 rounded-lg bg-gray-800/80 backdrop-blur-sm animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full mr-2 bg-gray-700"></div>
                      <div>
                        <div className="h-3 bg-gray-700 rounded w-12 mb-1"></div>
                        <div className="h-2 bg-gray-700 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 w-12 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tokensWithBalance.length > 0 ? (
            <div className="space-y-2">
              {tokensWithBalance.map((token) => (
                <div
                  key={token.symbol}
                  className="relative overflow-hidden p-2 rounded-lg bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm hover:from-gray-800 hover:to-gray-800 transition-all duration-300 cursor-pointer border border-gray-700/50 hover:border-gray-600/80 shadow-md hover:shadow-lg group"
                  onClick={() => handleTokenClick(token)}
                >
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer bg-size-200 transition-opacity duration-700"></div>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center">
                      <div className="relative">
                        <div
                          className={`w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br ${token.gradient} p-0.5 shadow-md`}
                        >
                          <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                            <Image
                              src={token.logo || "/placeholder.svg"}
                              alt={`${token.symbol} logo`}
                              width={28}
                              height={28}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Selo de verificação menor */}
                        {token.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center border border-gray-800">
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

                      <div className="ml-2">
                        <div className="flex items-center">
                          <div className="font-bold text-white text-sm">{token.symbol}</div>
                        </div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                        {token.error && (
                          <div className="text-xs text-red-400">
                            {t("error", "Error:")} {token.error}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {token.loading ? (
                        <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
                      ) : token.quantity ? (
                        <div className="font-bold text-white text-sm">{token.quantity}</div>
                      ) : (
                        <div className="text-red-400 text-xs">{t("unavailable_token", "Unavailable")}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-md p-3">
              <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{t("no_tokens_found", "No Tokens Found")}</h3>
              <p className="text-xs text-gray-400 mb-3">
                {t(
                  "no_tokens_description",
                  'You don\'t have any tokens in your wallet yet. Use the "Receive" button to get started.',
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {tokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleReceiveClick(token)}
                    className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-300 flex items-center shadow-sm text-xs"
                  >
                    <div className="w-4 h-4 rounded-full overflow-hidden mr-1 bg-gray-600">
                      <Image
                        src={token.logo || "/placeholder.svg"}
                        alt={`${token.symbol} logo`}
                        width={16}
                        height={16}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {t("receive_token", "Receive")} {token.symbol}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Token Modal for WLD */}
      {selectedToken && selectedToken.symbol === "WLD" && (
        <SendTokenModal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          walletAddress={walletAddress}
          tokenSymbol={selectedToken.symbol}
          tokenLogo={selectedToken.logo}
          tokenName={selectedToken.name}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {/* Send TPF Modal */}
      {selectedToken && selectedToken.symbol === "TPF" && (
        <SendTPFModal
          isOpen={isSendTPFModalOpen}
          onClose={() => setIsSendTPFModalOpen(false)}
          walletAddress={walletAddress}
          tokenLogo={selectedToken.logo}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {/* Receive Token Modal */}
      {selectedToken && (
        <ReceiveTokenModal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          walletAddress={walletAddress}
          tokenSymbol={selectedToken.symbol}
          tokenLogo={selectedToken.logo}
          tokenName={selectedToken.name}
        />
      )}

      {/* Token Detail Modal with Chart */}
      {selectedToken && (
        <TokenDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          token={selectedToken}
          walletAddress={walletAddress}
          onSwap={handleTransactionSuccess}
        />
      )}
    </div>
  )
}
