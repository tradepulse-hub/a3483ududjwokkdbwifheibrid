"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

type TokenWalletProps = {
  walletAddress: string
}

type TokenInfo = {
  symbol: string
  name: string
  quantity: string | null
  gradient: string
  contract?: string
  logo: string
  loading?: boolean
  error?: string
  details?: string
  network?: string
}

export default function TokenWallet({ walletAddress }: TokenWalletProps) {
  const [tokens, setTokens] = useState<TokenInfo[]>([
    {
      symbol: "TPF",
      name: "TPulseFi",
      quantity: null,
      gradient: "from-blue-500 to-purple-600",
      logo: "/images/tpf-logo.png",
      loading: true,
      network: "World Chain",
    },
    {
      symbol: "WLD",
      name: "WorldCoin",
      quantity: null,
      gradient: "from-green-500 to-blue-600",
      contract: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      logo: "/images/worldcoin-logo.jpeg",
      loading: true,
      network: "World Chain",
    },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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

          return {
            quantity: formattedBalance,
            error: undefined,
            loading: false,
            network: data.source || "World Chain",
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
              network: "World Chain",
            }
          }

          // Format balance with 2 decimal places
          const formattedBalance = data.balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })

          return {
            quantity: formattedBalance,
            error: undefined,
            details: undefined,
            loading: false,
            network: data.source || "World Chain",
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

  return (
    <div className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-300">My Tokens</h3>
        <button
          onClick={handleRefresh}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors flex items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Updating...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
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
              Refresh
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {tokens.map((token) => (
          <div key={token.symbol} className="p-3 sm:p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 overflow-hidden bg-gray-700 flex items-center justify-center">
                  <Image
                    src={token.logo || "/placeholder.svg"}
                    alt={`${token.symbol} logo`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-white text-base sm:text-lg">{token.symbol}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{token.name}</div>
                  {token.network && (
                    <div className="text-xs text-blue-400 mt-0.5">
                      <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                      {token.network}
                    </div>
                  )}
                  {token.error && <div className="text-xs text-red-400 mt-1">Error: {token.error}</div>}
                </div>
              </div>
              <div className="text-right">
                {token.loading ? (
                  <div className="h-6 w-16 bg-gray-700 rounded animate-pulse"></div>
                ) : token.quantity ? (
                  <div className="font-bold text-white text-lg sm:text-xl">{token.quantity}</div>
                ) : (
                  <div className="text-red-400 text-sm">Unavailable</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
        <button className="py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg text-white text-sm sm:text-base font-medium hover:opacity-90 transition-opacity flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1 sm:mr-2"
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
          Send
        </button>
        <button className="py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg text-white text-sm sm:text-base font-medium hover:opacity-90 transition-opacity flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1 sm:mr-2"
          >
            <path d="M12 5v14" />
            <path d="m5 12 7 7 7-7" />
          </svg>
          Receive
        </button>
      </div>
    </div>
  )
}
