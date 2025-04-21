"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/languageContext"
import { motion } from "framer-motion"

type ReceiveTokenModalProps = {
  isOpen: boolean
  onClose: () => void
  walletAddress: string
  tokenSymbol: string
  tokenLogo: string
  tokenName: string
  setMenuVisible?: (visible: boolean) => void // Nova prop
}

export default function ReceiveTokenModal({
  isOpen,
  onClose,
  walletAddress,
  tokenSymbol,
  tokenLogo,
  tokenName,
  setMenuVisible,
}: ReceiveTokenModalProps) {
  const { t } = useLanguage()
  const [copySuccess, setCopySuccess] = useState(false)

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

  // Handle outside click to close modal
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

  // Handle ESC key to close modal
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  // Token-specific content
  const getTokenDescription = () => {
    if (tokenSymbol === "TPF") {
      return "TPulseFi (TPF) is a cryptocurrency designed for traders and DeFi enthusiasts, operating on WorldChain. With a focus on rewarding the registered community and building a sustainable economy, TPF aims to create long-term value for its users."
    } else if (tokenSymbol === "WLD") {
      return "Na era da IA, World é uma rede de humanos reais construída sobre uma prova anônima de humano e uma rede financeira globalmente inclusiva."
    }
    return ""
  }

  const getTokenContact = () => {
    if (tokenSymbol === "TPF") {
      return "support@tradepulsetoken.com"
    }
    return ""
  }

  const getTokenGradient = () => {
    if (tokenSymbol === "TPF") {
      return "from-blue-600 via-purple-600 to-blue-600"
    } else if (tokenSymbol === "WLD") {
      return "from-green-600 via-blue-600 to-green-600"
    }
    return "from-blue-600 to-purple-600"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center modal-backdrop bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-xl w-full max-w-md p-5 shadow-2xl m-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            {t("receive", "Receive")} {tokenSymbol}
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

        {/* Token header with animated gradient */}
        <div
          className={`bg-gradient-to-r ${getTokenGradient()} animate-gradient bg-size-200 p-4 rounded-lg mb-5 flex items-center`}
        >
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 mr-4 border-2 border-white/20">
            <Image
              src={tokenLogo || "/placeholder.svg"}
              alt={`${tokenSymbol} logo`}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-bold text-white text-xl">{tokenSymbol}</div>
            <div className="text-sm text-gray-200">{tokenName}</div>
          </div>
        </div>

        {/* Token description */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 mb-5 border border-gray-700/50">
          <p className="text-xs text-gray-300 leading-relaxed">{getTokenDescription()}</p>
          {getTokenContact() && <p className="text-sm text-blue-400 mt-2">{getTokenContact()}</p>}
        </div>

        {/* Wallet address section */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-300 mb-2">
            {t("your_wallet_address", "Your Wallet Address")}
          </label>
          <div className="w-full bg-gray-800 p-3 rounded-lg flex items-center justify-between border border-gray-700/50 group hover:border-gray-600 transition-colors">
            <div className="font-mono text-xs text-gray-300 truncate max-w-[80%]">{walletAddress}</div>
            <button
              onClick={copyToClipboard}
              className="ml-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              title={t("copy_address", "Copy address")}
            >
              {copySuccess ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-400"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 group-hover:text-white transition-colors"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("copy_address_to_receive", "Copy the address above to receive")} {tokenSymbol}{" "}
            {t("on_worldchain", "on Worldchain")}.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:opacity-90 transition-colors"
          >
            {t("close", "Close")}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
