"use client"
import { useState, useEffect } from "react"
import { claimAirdrop } from "@/lib/airdropService"
import { useLanguage } from "@/lib/languageContext"
import { motion, AnimatePresence } from "framer-motion"

export function ClaimCoin({ userAddress }: { userAddress: string }) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("claim")
  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Estados para rastrear se o usuário seguiu as redes sociais
  const [followedTwitter, setFollowedTwitter] = useState(false)
  const [followedTelegram, setFollowedTelegram] = useState(false)
  const [showFollowMessage, setShowFollowMessage] = useState(false)

  // Estados para o status do airdrop
  const [airdropStatus, setAirdropStatus] = useState<{
    canClaim: boolean
    timeRemaining: number | null
    lastClaimTime: number
    nextClaimTime: number
    airdropAmount: string
  } | null>(null)
  const [countdown, setCountdown] = useState<string>("")

  // Estado para o saldo do contrato
  const [contractBalance, setContractBalance] = useState<string | null>(null)

  // Estado para rastrear erros de API
  const [apiError, setApiError] = useState<string | null>(null)

  // Verificar se o usuário já seguiu as redes sociais (simulado)
  useEffect(() => {
    // Aqui você poderia verificar com uma API real se o usuário já segue
    // Por enquanto, vamos apenas simular com localStorage
    const twitterStatus = localStorage.getItem("followed_twitter") === "true"
    const telegramStatus = localStorage.getItem("followed_telegram") === "true"

    setFollowedTwitter(twitterStatus)
    setFollowedTelegram(telegramStatus)
  }, [])

  // Buscar status do airdrop e saldo do contrato
  useEffect(() => {
    const fetchAirdropData = async () => {
      try {
        setApiError(null)
        console.log("Fetching airdrop data for address:", userAddress)

        // Buscar status do airdrop
        const statusResponse = await fetch(`/api/airdrop-status?address=${userAddress}`)
        const statusData = await statusResponse.json()

        console.log("Airdrop status response:", statusData)

        if (statusData.success) {
          setAirdropStatus({
            canClaim: statusData.canClaim,
            timeRemaining: statusData.timeRemaining,
            lastClaimTime: statusData.lastClaimTime,
            nextClaimTime: statusData.nextClaimTime,
            airdropAmount: statusData.airdropAmount,
          })
        } else {
          console.error("Error in airdrop status response:", statusData.error)
          setApiError(statusData.error || "Failed to fetch airdrop status")
        }

        // Buscar saldo do contrato
        const balanceResponse = await fetch(`/api/airdrop-balance`)
        const balanceData = await balanceResponse.json()

        console.log("Contract balance response:", balanceData)

        if (balanceData.success) {
          setContractBalance(balanceData.balance)
        } else {
          console.error("Error in contract balance response:", balanceData.error)
        }
      } catch (err) {
        console.error("Error fetching airdrop data:", err)
        setApiError(err instanceof Error ? err.message : "Failed to fetch airdrop data")
      }
    }

    fetchAirdropData()

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAirdropData, 30000)
    return () => clearInterval(interval)
  }, [userAddress, success])

  // Atualizar o countdown a cada segundo
  useEffect(() => {
    if (!airdropStatus || airdropStatus.canClaim) {
      setCountdown("")
      return
    }

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = airdropStatus.nextClaimTime - now

      if (remaining <= 0) {
        setAirdropStatus((prev) => (prev ? { ...prev, canClaim: true, timeRemaining: 0 } : null))
        setCountdown("")
        return
      }

      const hours = Math.floor(remaining / 3600)
      const minutes = Math.floor((remaining % 3600) / 60)
      const seconds = remaining % 60

      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    // Atualizar imediatamente
    updateCountdown()

    // E depois a cada segundo
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [airdropStatus])

  // Função para marcar Twitter como seguido
  const handleTwitterFollow = () => {
    // Abrir Twitter em nova aba
    window.open("https://x.com/TradePulseToken?t=pVsX5va6z7eOJj70W9pSog&s=09", "_blank")
    // Marcar como seguido
    setFollowedTwitter(true)
    localStorage.setItem("followed_twitter", "true")
  }

  // Função para marcar Telegram como seguido
  const handleTelegramFollow = () => {
    // Abrir Telegram em nova aba
    window.open("https://t.me/tpulsefi", "_blank")
    // Marcar como seguido
    setFollowedTelegram(true)
    localStorage.setItem("followed_telegram", "true")
  }

  // Verificar se todas as redes sociais foram seguidas
  const allSocialsFollowed = followedTwitter && followedTelegram

  // Função para reclamar o airdrop
  const handleClaim = async () => {
    if (isClaimingAirdrop) return

    // Verificar se o usuário seguiu todas as redes sociais
    if (!allSocialsFollowed) {
      setShowFollowMessage(true)
      setTimeout(() => setShowFollowMessage(false), 3000)
      return
    }

    setIsClaimingAirdrop(true)
    setError(null)
    setSuccess(false)
    setTxId(null)

    try {
      // Chamar a função claimAirdrop do airdropService
      const result = await claimAirdrop(userAddress)

      if (result.success) {
        setTxId(result.txId)
        setSuccess(true)
        console.log("Airdrop claimed successfully:", result)

        // Atualizar o status do airdrop após um claim bem-sucedido
        const response = await fetch(`/api/airdrop-status?address=${userAddress}`)
        const data = await response.json()

        if (data.success) {
          setAirdropStatus({
            canClaim: data.canClaim,
            timeRemaining: data.timeRemaining,
            lastClaimTime: data.lastClaimTime,
            nextClaimTime: data.nextClaimTime,
            airdropAmount: data.airdropAmount,
          })
        }
      } else {
        setError(result.error || "Failed to claim tokens")
        console.error("Error claiming airdrop:", result.error)
      }
    } catch (err) {
      console.error("Error claiming airdrop:", err)
      setError(err instanceof Error ? err.message : "Failed to claim tokens")
    } finally {
      setIsClaimingAirdrop(false)
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl p-5 max-w-md mx-auto shadow-xl border border-gray-800">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">
          {t("daily_airdrop", "Daily Airdrop")}
        </h1>
        <div className="h-1 w-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3"></div>

        <div className="text-sm sm:text-base text-gray-300 mb-2">
          {t("get_free_daily", "Get free daily airdrops, you just have to be following our social media.")}
        </div>
      </div>

      {/* Navegação por abas - Removendo o botão "Status" */}
      <div className="mb-6">
        <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/30">
          <button
            onClick={() => setActiveTab("claim")}
            className={`flex-1 py-2 rounded-md transition-all duration-300 ${
              activeTab === "claim"
                ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white font-medium"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t("claim", "Claim")}
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`flex-1 py-2 rounded-md transition-all duration-300 ${
              activeTab === "social"
                ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white font-medium"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t("social", "Social")}
          </button>
        </div>
      </div>

      {/* Conteúdo das abas */}
      <AnimatePresence mode="wait">
        {activeTab === "claim" && (
          <motion.div
            key="claim"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* API Error Message */}
            {apiError && (
              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-center mb-4 animate-fadeIn">
                <div className="flex justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <p className="text-yellow-300 text-sm">
                  {t("error_connecting", "Error connecting to airdrop contract:")} {apiError}
                </p>
                <p className="text-xs text-yellow-200 mt-2">
                  {t(
                    "check_contract_deployed",
                    "Please check if the contract is deployed and accessible on the network.",
                  )}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center mb-4 animate-fadeIn">
                <div className="flex justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <p className="text-green-300 text-sm">{t("claim_successful", "Claim successful!")}</p>
                {txId && (
                  <p className="text-xs text-green-200 mt-1 font-mono bg-green-900/30 p-1 rounded overflow-hidden text-ellipsis">
                    TX: {txId}
                  </p>
                )}
              </div>
            )}

            {/* Countdown Display */}
            {airdropStatus && !airdropStatus.canClaim && countdown && (
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-center mb-4 animate-fadeIn">
                <div className="flex justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <p className="text-blue-300 text-sm">{t("next_airdrop_in", "Next airdrop available in:")}</p>
                <p className="text-xl font-mono text-white mt-2">{countdown}</p>
                <p className="text-xs text-blue-200 mt-2">
                  {t("youll_receive", "You'll receive")} {airdropStatus.airdropAmount} TPF{" "}
                  {t("in_next_claim", "in the next claim")}
                </p>
              </div>
            )}

            {/* Contract Balance Display */}
            {contractBalance && (
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg p-3 text-center mb-4 border border-gray-700">
                <p className="text-sm text-gray-300 mb-2">{t("contract_balance", "Contract Balance:")}</p>
                <div className="text-xl font-medium text-green-400">{contractBalance} TPF</div>
                <p className="text-xs text-gray-400 mt-1">
                  {t("total_tokens_available", "Total tokens available for airdrops")}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded-lg mb-4 border border-red-800/50">
                {error}
              </div>
            )}

            {/* Follow Message */}
            {showFollowMessage && !allSocialsFollowed && (
              <div className="bg-yellow-900/30 text-yellow-300 text-sm p-3 rounded-lg mb-4 border border-yellow-800/50 animate-fadeIn">
                {t("follow_all_social", "Please follow all our social media channels to unlock the airdrop!")}
              </div>
            )}

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              disabled={isClaimingAirdrop || !allSocialsFollowed || (airdropStatus && !airdropStatus.canClaim)}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center
          ${
            isClaimingAirdrop
              ? "bg-blue-700 text-white cursor-wait"
              : !allSocialsFollowed
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : airdropStatus && !airdropStatus.canClaim
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-600/20 hover:scale-105"
          }`}
            >
              {isClaimingAirdrop ? (
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
                  {t("processing", "Processing...")}
                </>
              ) : !allSocialsFollowed ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  {t("follow_social_first", "Follow Social Media First")}
                </>
              ) : airdropStatus && !airdropStatus.canClaim ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {t("wait_for_next", "Wait for Next Claim")}
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {t("claim_tpf_now", "Claim TPF Now")}
                </>
              )}
            </button>
          </motion.div>
        )}

        {activeTab === "social" && (
          <motion.div
            key="social"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Social Media Follow Status - Atualizado com mini ícones */}
            <div className="bg-gradient-to-r from-blue-900/70 to-purple-900/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-blue-600/50 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
                {t("social_media", "Social Media")}
              </h3>

              <p className="text-center text-gray-300 mb-4">
                {t("follow_social_media", "Follow our social media to unlock the airdrop:")}
              </p>

              <div className="space-y-4">
                {/* Twitter/X */}
                <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-400"
                        >
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{t("twitter_x", "Twitter/X")}</h4>
                        <p className="text-xs text-gray-400">@TradePulseToken</p>
                      </div>
                    </div>
                    {followedTwitter ? (
                      <div className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full border border-green-700/50 flex items-center justify-center w-8 h-8">
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
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                    ) : (
                      <button
                        onClick={handleTwitterFollow}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                      >
                        {t("follow", "Follow")}
                      </button>
                    )}
                  </div>
                </div>

                {/* Telegram */}
                <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-400"
                        >
                          <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.846 1.467 1.767 3.029 2.662 4.839.106.116.207.174.313.174.3 0 .536-.261.72-.484.386-.466.775-.935 1.164-1.403l1.67-2.055c.862-.817 1.792-1.602 2.877-2.34 1.04-.707 2.213-1.555 3.114-2.375.801-.729 1.376-1.591 1.69-2.454.315-.864.192-1.734-.172-2.465-.363-.73-1.049-1.187-1.769-1.283a4.326 4.326 0 0 0-.728-.05" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{t("telegram", "Telegram")}</h4>
                        <p className="text-xs text-gray-400">@tpulsefi</p>
                      </div>
                    </div>
                    {followedTelegram ? (
                      <div className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full border border-green-700/50 flex items-center justify-center w-8 h-8">
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
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                    ) : (
                      <button
                        onClick={handleTelegramFollow}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
                      >
                        {t("follow", "Follow")}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    allSocialsFollowed
                      ? "bg-green-900/30 text-green-400 border border-green-700/50"
                      : "bg-yellow-900/30 text-yellow-300 border border-yellow-700/50"
                  }`}
                >
                  {allSocialsFollowed ? (
                    <div className="flex items-center">
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
                        className="mr-2"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      {t("all_followed", "All channels followed! You can claim your airdrop.")}
                    </div>
                  ) : (
                    <div className="flex items-center">
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
                        className="mr-2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {t("follow_all_channels", "Please follow all channels to unlock the airdrop")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Links diretos para redes sociais */}
            <div className="flex justify-center space-x-6 mt-6">
              <a
                href="https://x.com/TradePulseToken?t=pVsX5va6z7eOJj70W9pSog&s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500 transition-all duration-300 group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 group-hover:text-blue-400 transition-colors duration-300"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="https://t.me/tpulsefi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500 transition-all duration-300 group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 group-hover:text-blue-400 transition-colors duration-300"
                >
                  <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.846 1.467 1.767 3.029 2.662 4.839.106.116.207.174.313.174.3 0 .536-.261.72-.484.386-.466.775-.935 1.164-1.403l1.67-2.055c.862-.817 1.792-1.602 2.877-2.34 1.04-.707 2.213-1.555 3.114-2.375.801-.729 1.5-1.475 2.034-2.16.19-.24.369-.48.54-.71.58-.76.58-1.52 0-2.28-.42-.55-.982-.967-1.402-.967-.18 0-.34.09-.49.28-.96 1.16-2.64 2.949-4.72 4.509-1.51 1.13-3.16 2.11-4.93 2.95-.21.1-.42.19-.63.29-.5.22-.97.46-1.44.7-.34.18-.81.14-1.08-.08-.13-.11-.23-.24-.3-.38-.06-.13-.09-.27-.09-.42 0-.4.18-.74.54-1.01.18-.13.39-.26.6-.38.3-.18.62-.37.94-.56 1.59-.94 3.2-1.88 4.76-2.8 1.57-.93 3.14-1.86 4.64-2.78.57-.34 1.14-.69 1.69-1.04.61-.39 1.21-.78 1.79-1.18.3-.21.57-.42.83-.65.77-.66 1.3-1.57 1.54-2.58.01-.03.01-.06.01-.09.02-.17.11-.31.25-.4.14-.09.31-.1.46-.05.44.16.84.63.84 1.03 0 .05-.01.09-.02.14-.05.29-.14.57-.28.82-.14.25-.32.47-.52.67-.89.86-1.94 1.58-3.04 2.23-.8.47-1.64.91-2.48 1.35-.42.22-.83.44-1.25.66-.13.6-2.28 1.21-3.41 1.82-1.12.61-2.24 1.21-3.36 1.81-.56.3-1.12.6-1.67.89-.61.33-1.23.65-1.83.99-.65.36-1.29.72-1.93 1.08-1.1.62-2.2 1.25-3.28 1.89-.54.32-1.07.65-1.6.98-.24.15-.48.3-.71.46-.23.15-.44.31-.65.48-.1.08-.19.17-.28.26-.08.1-.16.2-.24.31-.17.22-.33.46-.46.71-.13.25-.23.51-.3.79-.02.08-.04.17-.05.26 0 .09-.01.19-.01.28.01.27.03.55.08.82.05.27.13.53.23.78.11.25.24.48.4.7.16.21.35.41.55.58.21.17.43.33.67.46.24.13.49.24.75.33.13.04.26.08.39.11.13.03.27.05.4.07.14.01.27.02.41.02.14 0 .27-.01.41-.02.27-.03.53-.08.78-.15.25-.07.49-.16.73-.26.23-.1.46-.22.67-.35.21-.13.41-.27.6-.42.19-.15.37-.31.54-.48.34-.34.64-.72.9-1.13.13-.2.24-.42.34-.64.1-.22.18-.44.25-.67.14-.45.21-.92.22-1.39.01-.23.01-.47-.01-.7-.02-.23-.06-.46-.11-.69-.1-.45-.26-.89-.48-1.29-.22-.41-.49-.79-.8-1.12-.31-.33-.67-.62-1.05-.86-.19-.12-.39-.22-.6-.31-.21-.09-.42-.16-.64-.22-.44-.12-.9-.18-1.35-.19-.23 0-.45.01-.68.03-.22.02-.45.06-.67.1-.44.09-.87.22-1.29.4-.41.18-.8.4-1.16.66-.18.13-.35.27-.51.42-.16.15-.31.31-.45.48-.28.34-.52.71-.72 1.1-.1.2-.19.4-.27.61-.08.21-.14.42-.19.64-.1.44-.15.89-.14 1.34.01.22.03.45.07.67.04.22.09.44.15.65.13.42.3.83.52 1.21.22.38.48.74.78 1.06.3.32.64.6 1.01.84.37.24.77.44 1.19.59.21.08.42.14.64.19.22.05.44.09.66.11.45.05.9.05 1.35 0 .22-.03.45-.07.67-.12.22-.05.43-.12.64.2-.42.16.82-.37 1.18-.62.18-.13.35-.27.51-.42.16-.15.31-.31.45-.48.28-.34.52.71.72-1.1.1-.2.19-.4.27-.61.08-.21.14-.42.19-.64.1-.44.15-.89.14-1.34-.01-.22-.03-.45-.07-.67-.04-.22-.09-.44.15.65.13.42.3.83.52 1.21.22.38.48.74.78 1.06.3.32.64.6 1.01.84.37.24.77.44 1.19.59.21.08.42.14.64.19.22.05.44.09.66.11.45.05.9.05 1.35 0 .22-.03.45-.07.67-.12.22-.05.43-.12.64.2-.42.16.82-.37 1.18-.62.18-.13.35-.27.51-.42.16-.15.31-.31.45-.48.28-.34.52.71.72-1.1.1-.2.19-.4.27-.61.08-.21.14-.42.19-.64.1-.44.15-.89.14-1.34z" />
                </svg>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
