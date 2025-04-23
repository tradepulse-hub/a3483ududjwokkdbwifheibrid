"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/languageContext"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { getTokenPrice } from "@/lib/realPriceService"

type TokenPrice = {
  symbol: string
  price: number
  source: string
  timestamp: string
}

export default function TokenPriceTester() {
  const { t } = useLanguage()
  const [selectedToken, setSelectedToken] = useState<string>("TPF")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [priceData, setPriceData] = useState<TokenPrice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<
    Array<{
      symbol: string
      success: boolean
      price?: number
      source?: string
      error?: string
      timestamp?: string
    }>
  >([])

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
    setPriceData(null)

    try {
      const { price, source } = await getTokenPrice(symbol)
      setPriceData({
        symbol,
        price,
        source,
        timestamp: new Date().toISOString(),
      })
      return {
        symbol,
        success: true,
        price,
        source,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Error fetching ${symbol} price:`, error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch token price"
      setError(errorMessage)
      return { symbol, success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchPrice = async () => {
    await fetchTokenPrice(selectedToken)
  }

  const runAllTests = async () => {
    setTestResults([])
    setIsLoading(true)

    const results = []
    for (const token of tokens) {
      const result = await fetchTokenPrice(token.symbol)
      results.push(result)
      setTestResults((prev) => [...prev, result])
    }

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
            disabled={isLoading}
          >
            {tokens.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleFetchPrice}
            disabled={isLoading}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors flex items-center"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
            {t("fetch_price", "Fetch Price")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-sm text-red-300 flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {priceData !== null && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-md">
          <div className="text-sm text-gray-300 mb-1">Price Result:</div>
          <div className="text-xl font-bold text-green-400">
            {priceData.price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 4,
              maximumFractionDigits: 6,
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1">Source: {priceData.source}</div>
        </div>
      )}

      <div className="border-t border-gray-700 pt-4 mt-4">
        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors"
        >
          {t("test_all", "Test All Tokens")}
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">Test Results</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {testResults.map((result) => (
              <div
                key={result.symbol}
                className={`p-2 rounded-md border ${
                  result.success ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">{result.symbol}</div>
                  {result.success ? (
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
