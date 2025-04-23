"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/languageContext"
import { motion } from "framer-motion"
import { Loader2, ExternalLink, RefreshCw } from "lucide-react"

type TokenDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  token: {
    symbol: string
    name: string
    logo: string
    quantity: string | null
    address: string
    price?: number
    priceSource?: string
  }
  walletAddress: string
  onSwap?: () => void
}

export default function TokenDetailModal({ isOpen, onClose, token, walletAddress }: TokenDetailModalProps) {
  const { t } = useLanguage()
  const [tokenPrice, setTokenPrice] = useState<number | null>(token.price || null)
  const [priceSource, setPriceSource] = useState<string>(token.priceSource || "loading")
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [totalValue, setTotalValue] = useState<string | null>(null)

  // Buscar o preço real do token quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchTokenPrice()
    }
  }, [isOpen, token.symbol])

  // Calcular o valor total quando o preço ou a quantidade mudar
  useEffect(() => {
    if (tokenPrice !== null && token.quantity) {
      const quantity = Number.parseFloat(token.quantity.replace(/,/g, ""))
      const value = quantity * tokenPrice
      setTotalValue(
        value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      )
    } else {
      setTotalValue(null)
    }
  }, [tokenPrice, token.quantity])

  // Função para buscar o preço real do token
  const fetchTokenPrice = async () => {
    if (!token.symbol) return

    setIsLoadingPrice(true)
    setPriceError(null)

    try {
      const response = await fetch(`/api/token-real-price?symbol=${token.symbol}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch price: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setTokenPrice(data.price)
      setPriceSource(data.source)
    } catch (error) {
      console.error(`Error fetching ${token.symbol} price:`, error)
      setPriceError(error instanceof Error ? error.message : "Failed to fetch token price")
      // Manter o preço anterior se houver um erro
    } finally {
      setIsLoadingPrice(false)
    }
  }

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gradient-to-r from-gray-200 to-gray-300 border border-gray-400 rounded-xl w-full max-w-md p-5 shadow-2xl m-2"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-600 to-gray-700 p-0.5 mr-3">
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
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center">{token.symbol}</h3>
              <div className="text-xs text-gray-600">{token.name}</div>
            </div>
          </div>
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

        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-300 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">{t("token_details", "Token Details")}</h4>
            <button
              onClick={fetchTokenPrice}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              disabled={isLoadingPrice}
            >
              {isLoadingPrice ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <RefreshCw size={14} className="mr-1" />
              )}
              {t("refresh", "Refresh")}
            </button>
          </div>

          <div className="space-y-3">
            {/* Token Balance */}
            {token.quantity && (
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{t("balance", "Balance")}</div>
                <div className="text-lg font-bold text-gray-800">
                  {token.quantity} {token.symbol}
                </div>
              </div>
            )}

            {/* Token Price */}
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{t("token_price", "Token Price")}</div>
              {isLoadingPrice ? (
                <div className="flex items-center text-gray-600">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  <span>{t("loading_price", "Loading price...")}</span>
                </div>
              ) : priceError ? (
                <div className="text-red-500 text-sm">{priceError}</div>
              ) : tokenPrice !== null ? (
                <div className="flex flex-col">
                  <div className="text-lg font-bold text-gray-800">
                    {tokenPrice.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 6,
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t("price_source", "Source")}: {priceSource}
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">{t("price_unavailable", "Price unavailable")}</div>
              )}
            </div>

            {/* Total Value */}
            {totalValue && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                <div className="text-xs text-blue-600 mb-1">{t("total_value", "Total Value")}</div>
                <div className="text-lg font-bold text-blue-800">{totalValue}</div>
              </div>
            )}

            {/* Token Address */}
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">{t("token_address", "Token Address")}</div>
              <div className="flex items-center bg-gray-100 p-2 rounded-lg overflow-hidden">
                <div className="text-xs font-mono text-gray-700 truncate flex-1">{token.address}</div>
                <a
                  href={`https://worldscan.org/token/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:opacity-90 transition-colors text-sm"
          >
            {t("close", "Close")}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
