"use client"

import { useState } from "react"

export default function TokenPriceTester() {
  const [selectedToken, setSelectedToken] = useState<string>("TPF")
  const [tokenPrice, setTokenPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<
    Array<{
      symbol: string
      price: number | null
      source: string
      status: "success" | "error"
      error?: string
    }>
  >([])
  const [showResults, setShowResults] = useState<boolean>(false)

  const tokens = [
    { symbol: "TPF", name: "TPulseFi" },
    { symbol: "WLD", name: "WorldCoin" },
    { symbol: "DNA", name: "DNA Token" },
    { symbol: "WDD", name: "Drachma" },
    { symbol: "CASH", name: "Cash" },
    { symbol: "USDC", name: "USD Coin" },
    { symbol: "WETH", name: "Wrapped ETH" },
  ]

  const fetchTokenPrice = async (symbol: string) => {
    setIsLoading(true)
    setError(null)
    setTokenPrice(null)

    try {
      // Usar a API do UNO para buscar o preço
      const response = await fetch(`/api/uno-token-price?symbol=${symbol}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch price: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setTokenPrice(data.price)
      return {
        symbol,
        price: data.price,
        source: data.source,
        status: "success" as const,
      }
    } catch (error) {
      console.error(`Error fetching ${symbol} price:`, error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch token price"
      setError(errorMessage)
      return {
        symbol,
        price: null,
        source: "error",
        status: "error" as const,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestAll = async () => {
    setIsLoading(true)
    setShowResults(true)
    const results = []

    for (const token of tokens) {
      const result = await fetchTokenPrice(token.symbol)
      results.push(result)
    }

    setTestResults(results)
    setIsLoading(false)
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 text-white">
      <h2 className="text-lg font-bold mb-4">Token Price Tester</h2>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Select Token</label>
        <div className="flex space-x-2">
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white flex-1"
          >
            {tokens.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchTokenPrice(selectedToken)}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
          >
            {isLoading ? "Loading..." : "Test"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-sm text-red-300">{error}</div>
      )}

      {tokenPrice !== null && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-md">
          <div className="text-sm text-gray-300 mb-1">Price Result:</div>
          <div className="text-xl font-bold text-green-400">
            {tokenPrice.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 4,
              maximumFractionDigits: 6,
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1">Source: UNO</div>
        </div>
      )}

      <div className="border-t border-gray-700 pt-4 mt-4">
        <button
          onClick={handleTestAll}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors"
        >
          {isLoading ? "Testing All Tokens..." : "Test All Tokens"}
        </button>
      </div>

      {showResults && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Test Results</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {testResults.map((result) => (
              <div
                key={result.symbol}
                className={`p-2 rounded-md border ${
                  result.status === "success" ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">{result.symbol}</div>
                  {result.status === "success" ? (
                    <div className="text-green-400">
                      {result.price?.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                  ) : (
                    <div className="text-red-400">Error</div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">Source: {result.source}</div>
                {result.error && <div className="text-xs text-red-400 mt-1">{result.error}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
