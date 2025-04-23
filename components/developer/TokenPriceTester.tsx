"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/languageContext"
import { Loader2, RefreshCw, AlertCircle, Check } from "lucide-react"

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
  ]

  const fetchTokenPrice = async (symbol: string) => {
    setIsLoading(true)
    setError(null)
    setPriceData(null)

    try {
      const response = await fetch(`/api/token-real-price?symbol=${symbol}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch price: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setPriceData(data)
      return { success: true, ...data }
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
    <div className="bg-gray-900 text-gray-200 rounded-lg p-4 shadow-lg border border-gray-700">
      <h3 className="text-lg font-medium mb-4 text-white">Token Price Tester</h3>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
            {t("fetch_price", "Fetch Price")}
          </button>

          <button
            onClick={runAllTests}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {t("test_all", "Test All Tokens")}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-md p-3 text-sm text-red-300 flex items-start">
            <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {priceData && (
          <div className="bg-gray-800 border border-gray-700 rounded-md p-3">
            <h4 className="text-sm font-medium mb-2 text-gray-300">{t("price_result", "Price Result")}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">{t("token", "Token")}:</span>
                <span className="text-white font-medium">{priceData.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t("price", "Price")}:</span>
                <span className="text-white font-medium">
                  {priceData.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 6,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t("source", "Source")}:</span>
                <span className="text-white font-medium">{priceData.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t("timestamp", "Timestamp")}:</span>
                <span className="text-white font-medium">{new Date(priceData.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 text-gray-300">{t("test_results", "Test Results")}</h4>
            <div className="bg-gray-800 border border-gray-700 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="py-2 px-3 text-left text-gray-300">{t("token", "Token")}</th>
                    <th className="py-2 px-3 text-left text-gray-300">{t("status", "Status")}</th>
                    <th className="py-2 px-3 text-left text-gray-300">{t("price", "Price")}</th>
                    <th className="py-2 px-3 text-left text-gray-300">{t("source", "Source")}</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}>
                      <td className="py-2 px-3 font-medium">{result.symbol}</td>
                      <td className="py-2 px-3">
                        {result.success ? (
                          <span className="flex items-center text-green-400">
                            <Check size={14} className="mr-1" />
                            {t("success", "Success")}
                          </span>
                        ) : (
                          <span className="flex items-center text-red-400">
                            <AlertCircle size={14} className="mr-1" />
                            {t("failed", "Failed")}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {result.success && result.price ? (
                          <span className="text-white">
                            {result.price.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 4,
                              maximumFractionDigits: 6,
                            })}
                          </span>
                        ) : (
                          <span className="text-red-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {result.success && result.source ? (
                          <span className="text-gray-300">{result.source}</span>
                        ) : (
                          <span className="text-red-400">{result.error?.substring(0, 20)}...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
