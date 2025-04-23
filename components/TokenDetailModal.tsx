"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/languageContext"

type TokenDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  token: {
    symbol: string
    name: string
    logo: string
    quantity: string | null
    address: string
  }
  walletAddress: string
  onSwap?: () => void
}

export default function TokenDetailModal({ isOpen, onClose, token, walletAddress }: TokenDetailModalProps) {
  const { t } = useLanguage()

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
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-5 shadow-2xl animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 mr-3">
              <Image
                src={token.logo || "/placeholder.svg"}
                alt={`${token.symbol} logo`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{token.symbol}</h3>
              <div className="text-xs text-gray-400">{token.name}</div>
            </div>
          </div>

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

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 mx-auto mb-4">
              <Image
                src={token.logo || "/placeholder.svg"}
                alt={`${token.symbol} logo`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="text-xl font-bold text-white mb-1">{token.symbol}</h4>
            <p className="text-gray-400">{token.name}</p>

            {token.quantity && (
              <div className="mt-4 bg-gray-700/50 rounded-lg p-3">
                <p className="text-sm text-gray-400">{t("balance", "Balance")}</p>
                <p className="text-xl font-bold text-white">{token.quantity}</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">{t("token_address", "Token Address")}</p>
            <p className="text-xs font-mono text-gray-400 bg-gray-700/50 p-2 rounded mt-1 break-all">{token.address}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {t("close", "Close")}
          </button>
        </div>
      </div>
    </div>
  )
}
