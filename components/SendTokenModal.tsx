"use client"

import { useState, useEffect } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import Image from "next/image"
import { ethers } from "ethers"
import { useLanguage } from "@/lib/languageContext"
import { motion, AnimatePresence } from "framer-motion"
import { useDeviceDetect } from "@/lib/useDeviceDetect"

// Adicionar uma prop para controlar a visibilidade do menu
type SendTokenModalProps = {
  isOpen: boolean
  onClose: () => void
  walletAddress: string
  tokenSymbol: string
  tokenLogo: string
  tokenName: string
  onSuccess?: (txId: string) => void
  setMenuVisible?: (visible: boolean) => void // Nova prop
}

export default function SendTokenModal({
  isOpen,
  onClose,
  walletAddress,
  tokenSymbol,
  tokenLogo,
  tokenName,
  onSuccess,
  setMenuVisible,
}: SendTokenModalProps) {
  const { t } = useLanguage()
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    recipient?: string
    amount?: string
  }>({})
  const [currentStep, setCurrentStep] = useState(1)

  const deviceInfo = useDeviceDetect()

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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecipientAddress("")
      setAmount("")
      setError(null)
      setSuccess(false)
      setTxId(null)
      setValidationErrors({})
      setCurrentStep(1)
    }
  }, [isOpen])

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

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: {
      recipient?: string
      amount?: string
    } = {}

    // Validate recipient address
    if (!recipientAddress) {
      errors.recipient = t("recipient_required", "Recipient address is required")
    } else if (!ethers.isAddress(recipientAddress)) {
      errors.recipient = t("invalid_eth_address", "Invalid Ethereum address format")
    }

    // Validate amount
    if (!amount) {
      errors.amount = t("amount_required", "Amount is required")
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.amount = t("amount_positive", "Amount must be a positive number")
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSendToken = async () => {
    // Validate form
    if (!validateForm()) {
      return
    }

    if (!MiniKit.isInstalled()) {
      setError(t("minikit_not_installed", "MiniKit is not installed"))
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Obter o endereço do contrato WLD com base no tokenSymbol
      let tokenAddress: string

      if (tokenSymbol === "WLD") {
        // Endereço do contrato WLD na World Chain
        tokenAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003"
      } else {
        throw new Error(
          t("token_not_supported", "Token {tokenSymbol} not supported for direct sending").replace(
            "{tokenSymbol}",
            tokenSymbol,
          ),
        )
      }

      // Converter o valor para wei (assumindo 18 decimais para WLD)
      const amountValue = Number.parseFloat(amount)
      const amountInWei = BigInt(Math.floor(amountValue * 10 ** 18)).toString()

      console.log(`Sending ${amount} ${tokenSymbol} (${amountInWei} in wei) to ${recipientAddress}`)

      // ABI mínimo para a função transfer do ERC20
      const transferAbi = [
        {
          inputs: [
            { name: "recipient", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          name: "transfer",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
          // Seletor de função para transfer
          method_id: "0xa9059cbb",
        },
      ]

      // Usar o método sendTransaction do MiniKit
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: tokenAddress,
            abi: transferAbi,
            functionName: "transfer",
            args: [recipientAddress, amountInWei],
          },
        ],
      })

      console.log("Transaction response:", finalPayload)

      if (finalPayload.status === "error") {
        throw new Error(
          finalPayload.message || finalPayload.description || t("transaction_failed", "Transaction failed"),
        )
      }

      // Definir estado de sucesso
      setSuccess(true)
      setTxId(finalPayload.transaction_id || "")
      setCurrentStep(2)

      // Chamar callback onSuccess se fornecido
      if (onSuccess && finalPayload.transaction_id) {
        onSuccess(finalPayload.transaction_id)
      }

      // Fechar modal após 3 segundos em caso de sucesso
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (error) {
      console.error(`Error sending ${tokenSymbol}:`, error)

      // Verificar se o erro é relacionado a contrato não reconhecido
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("failed_to_send", "Failed to send {tokenSymbol}").replace("{tokenSymbol}", tokenSymbol)

      if (errorMessage.includes("unrecognized contract") || errorMessage.includes("Invalid Token")) {
        setError(
          t(
            "error_sending_token",
            "There was an error sending {tokenSymbol}. Please try again or use the worldcoin app directly.",
          ).replace("{tokenSymbol}", tokenSymbol),
        )
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700/50 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 p-5 relative overflow-hidden">
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-size-200"></div>

          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border-2 border-white/20 flex-shrink-0 mr-3 shadow-lg">
                <Image
                  src={tokenLogo || "/placeholder.svg"}
                  alt={`${tokenSymbol} logo`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center">
                  {t("send", "Send")} {tokenSymbol}
                </h3>
                <div className="text-xs text-white/70">{tokenName}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
              aria-label={t("close", "Close")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg border border-red-800/50 mb-4"
                  >
                    {error}
                  </motion.div>
                )}

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendToken()
                  }}
                >
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-300 mb-1">
                      {t("to", "To")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="recipient"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="0x..."
                        inputMode={deviceInfo.isIOS ? "text" : undefined}
                        className={`w-full px-3 py-3 bg-gray-800/80 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.recipient ? "border-red-500" : "border-gray-700"
                        }`}
                      />
                      {recipientAddress && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    {validationErrors.recipient && (
                      <p className="mt-1 text-xs text-red-400">{validationErrors.recipient}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                      {t("amount", "Amount")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        min="0"
                        step="0.01"
                        inputMode={deviceInfo.isIOS ? "decimal" : undefined}
                        className={`w-full px-3 py-3 bg-gray-800/80 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.amount ? "border-red-500" : "border-gray-700"
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                        {tokenSymbol}
                      </div>
                    </div>
                    {validationErrors.amount && <p className="mt-1 text-xs text-red-400">{validationErrors.amount}</p>}
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center font-medium shadow-lg shadow-blue-600/20"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t("sending", "Sending...")}
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19V5M5 12l7-7 7 7"
                            />
                          </svg>
                          {t("send", "Send")} {tokenSymbol}
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-700/50 rounded-lg p-5 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.1 }}
                  className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {t("transaction_sent_success", "Transaction sent successfully!")}
                </h3>
                <p className="text-green-300 text-sm mb-3">{t("tokens_on_way", "Your tokens are on the way!")}</p>

                {txId && (
                  <div className="bg-gray-800/80 p-3 rounded-lg mb-4 overflow-hidden">
                    <p className="text-xs text-gray-400 mb-1">{t("transaction_id", "Transaction ID:")}</p>
                    <p className="text-xs font-mono text-gray-300 truncate">{txId}</p>
                  </div>
                )}

                <div className="flex justify-center">
                  {txId && (
                    <a
                      href={`https://worldscan.org/tx/${txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center shadow-md"
                    >
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      {t("view_on_worldscan", "View on WorldScan")}
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
