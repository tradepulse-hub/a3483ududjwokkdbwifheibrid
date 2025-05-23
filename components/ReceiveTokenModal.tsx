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
    // Removendo os longos textos descritivos
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
      return "from-gray-600 via-gray-500 to-gray-600"
    } else if (tokenSymbol === "WLD") {
      return "from-gray-600 via-gray-500 to-gray-600"
    }
    return "from-gray-600 to-gray-700"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center modal-backdrop bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-400/50 rounded-xl w-full max-w-md p-5 shadow-2xl m-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            {t("receive", "Receive")} {tokenSymbol}
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

        {/* Token header with animated gradient */}
        <div
          className={`bg-gradient-to-r ${getTokenGradient()} animate-gradient bg-size-200 p-4 rounded-lg mb-5 flex items-center`}
        >
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 mr-4 border-2 border-white/20">
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
        {getTokenDescription() && (
          <div className="bg-gray-100/80 backdrop-blur-sm rounded-lg p-4 mb-5 border border-gray-300/50">
            <p className="text-xs text-gray-700 leading-relaxed">{getTokenDescription()}</p>
            {getTokenContact() && <p className="text-sm text-gray-600 mt-2">{getTokenContact()}</p>}
          </div>
        )}

        {/* Wallet address section */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            {t("your_wallet_address", "Your Wallet Address")}
          </label>
          <div className="w-full bg-gray-100 p-3 rounded-lg flex items-center justify-between border border-gray-300/50 group hover:border-gray-400 transition-colors">
            <div className="font-mono text-xs text-gray-700 truncate max-w-[80%]">{walletAddress}</div>
            <button
              onClick={copyToClipboard}
              className="ml-2 p-1.5 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
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
                  className="text-green-600"
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
                  className="text-gray-600 group-hover:text-gray-800 transition-colors"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {t("copy_address_to_receive", "Copy the address above to receive")} {tokenSymbol}{" "}
            {t("on_worldchain", "on Worldchain")}.
          </p>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700 flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-500 mr-1 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {t(
                "worldchain_only_receive_notice",
                "Important: This wallet only supports receiving tokens on the Worldchain network. Sending tokens from other networks may result in permanent loss of funds.",
              )}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm rounded-lg hover:opacity-90 transition-colors"
          >
            {t("close", "Close")}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
