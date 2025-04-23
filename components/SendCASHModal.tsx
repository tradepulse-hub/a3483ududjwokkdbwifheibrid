"use client"

import { useState, useEffect } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import Image from "next/image"
import { ethers } from "ethers"
import { useLanguage } from "@/lib/languageContext"
import { motion, AnimatePresence } from "framer-motion"

// Adicionar uma prop para controlar a visibilidade do menu
type SendCASHModalProps = {
  isOpen: boolean
  onClose: () => void
  walletAddress: string
  tokenLogo: string
  onSuccess?: (txId: string) => void
  setMenuVisible?: (visible: boolean) => void // Nova prop
}

export default function SendCASHModal({
  isOpen,
  onClose,
  walletAddress,
  tokenLogo,
  onSuccess,
  setMenuVisible,
}: SendCASHModalProps) {
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

  // Adicionar um estado para armazenar o saldo do token
  const [tokenBalance, setTokenBalance] = useState<string>("0.00")

  // Adicionar um efeito para buscar o saldo do token quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      const fetchTokenBalance = async () => {
        try {
          // Endereço do contrato CASH na World Chain
          const cashTokenAddress = "0xbfdA4F50a2d5B9b864511579D7dfa1C72f118575"

          // Usar o RPC público da Worldchain
          const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

          // ABI mínimo para consultar o saldo de um token ERC20
          const tokenAbi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)",
          ]

          // Criar uma instância do contrato
          const cashContract = new ethers.Contract(cashTokenAddress, tokenAbi, provider)

          // Buscar os decimais do token
          let decimals
          try {
            decimals = await cashContract.decimals()
          } catch (error) {
            console.error("Error fetching CASH token decimals:", error)
            decimals = 18 // Valor padrão para tokens ERC-20
          }

          // Buscar o saldo do token
          const balance = await cashContract.balanceOf(walletAddress)

          // Converter o saldo para um formato legível
          const formattedBalance = Number(ethers.formatUnits(balance, decimals)).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })

          setTokenBalance(formattedBalance)
        } catch (error) {
          console.error("Error fetching CASH balance:", error)
          setTokenBalance("0.00")
        }
      }

      fetchTokenBalance()
    }
  }, [isOpen, walletAddress])

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

  const handleSendCASH = async () => {
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

      // Endereço do contrato CASH na World Chain
      const tokenAddress = "0xbfdA4F50a2d5B9b864511579D7dfa1C72f118575"

      // Converter o valor para wei (assumindo 18 decimais para CASH)
      // Usar ethers.parseUnits para uma conversão precisa de string para BigInt
      const amountInWei = ethers.parseUnits(amount, 18).toString()

      console.log(`Sending ${amount} CASH (${amountInWei} in wei) to ${recipientAddress}`)

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
          // Adicionar o seletor de função que você compartilhou
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
      console.error("Error sending CASH:", error)

      // Verificar se o erro é relacionado a contrato não reconhecido
      const errorMessage = error instanceof Error ? error.message : "Failed to send CASH"

      if (errorMessage.includes("unrecognized contract") || errorMessage.includes("Invalid Token")) {
        setError("There was an error sending CASH. Please try again or use the worldcoin app directly.")
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
        className="bg-gradient-to-br from-gray-200 to-gray-300 border border-gray-400/50 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-5 relative overflow-hidden">
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-size-200"></div>

          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white/20 flex-shrink-0 mr-3 shadow-lg">
                <Image
                  src={tokenLogo || "/placeholder.svg"}
                  alt="CASH logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center">{t("send", "Send")} CASH</h3>
                <div className="text-xs text-white/70">Cash</div>
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
                    className="text-red-600 text-sm p-3 bg-red-100 rounded-lg border border-red-300 mb-4"
                  >
                    {error}
                  </motion.div>
                )}

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendCASH()
                  }}
                >
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("to", "To")} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="recipient"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="0x..."
                        className={`w-full px-3 py-3 bg-gray-100 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                          validationErrors.recipient ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {recipientAddress && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
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
                      <p className="mt-1 text-xs text-red-600">{validationErrors.recipient}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("amount", "Amount")} <span className="text-red-500">*</span>
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
                        className={`w-full px-3 py-3 bg-gray-100 border rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                          validationErrors.amount ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                        CASH
                      </div>
                    </div>
                    {validationErrors.amount && <p className="mt-1 text-xs text-red-600">{validationErrors.amount}</p>}
                  </div>

                  {/* Adicionar o aviso de não enviar para exchanges após o aviso de Worldchain */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700 flex items-start">
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
                        "worldchain_only_notice",
                        "This application only supports sending tokens on the Worldchain network. Make sure the recipient is on Worldchain.",
                      )}
                    </span>
                  </div>

                  {/* Aviso para não enviar para exchanges */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2 text-xs text-red-700 flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-red-500 mr-1 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>
                      {t(
                        "exchange_warning",
                        "Warning: Do not send your tokens to any exchange. Only send to personal wallets.",
                      )}
                    </span>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center font-medium shadow-lg shadow-gray-500/20"
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
                          {t("send", "Send")} CASH
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
                className="bg-gradient-to-br from-green-100 to-blue-100 border border-green-300 rounded-lg p-5 text-center"
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

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {t("transaction_sent_success", "Transaction sent successfully!")}
                </h3>
                <p className="text-green-700 text-sm mb-3">{t("tokens_on_way", "Your tokens are on the way!")}</p>

                {txId && (
                  <div className="bg-white p-3 rounded-lg mb-4 overflow-hidden">
                    <p className="text-xs text-gray-600 mb-1">{t("transaction_id", "Transaction ID:")}</p>
                    <p className="text-xs font-mono text-gray-700 truncate">{txId}</p>
                  </div>
                )}

                <div className="flex justify-center">
                  {txId && (
                    <a
                      href={`https://worldscan.org/tx/${txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center shadow-md"
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
