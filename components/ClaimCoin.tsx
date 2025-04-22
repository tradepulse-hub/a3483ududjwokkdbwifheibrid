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
    <div className="bg-white backdrop-blur-sm rounded-2xl p-2 max-w-md mx-auto shadow-xl border border-gray-200 -mt-1">
      <div className="text-center mb-4">
        <h1 className="text-lg sm:text-xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600 animate-gradient">
          {t("daily_airdrop", "Daily Airdrop")}
        </h1>
        <div className="h-1 w-16 mx-auto bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mb-2"></div>

        <div className="text-[10px] sm:text-xs text-gray-600 mb-1">
          {t("get_free_daily", "Get free daily airdrops, you just have to be following our social media.")}
        </div>
      </div>

      {/* Navegação por abas - Removendo o botão "Status" */}
      <div className="mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab("claim")}
            className={`flex-1 py-1 rounded-md transition-all duration-300 text-xs ${
              activeTab === "claim"
                ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("claim", "Claim")}
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`flex-1 py-1 rounded-md transition-all duration-300 text-xs ${
              activeTab === "social"
                ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium"
                : "text-gray-500 hover:text-gray-700"
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center mb-3 animate-fadeIn">
                <div className="flex justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                <p className="text-yellow-700 text-xs">
                  {t("error_connecting", "Error connecting to airdrop contract:")} {apiError}
                </p>
                <p className="text-[10px] text-yellow-600 mt-1">
                  {t(
                    "check_contract_deployed",
                    "Please check if the contract is deployed and accessible on the network.",
                  )}
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center mb-3 animate-fadeIn">
                <div className="flex justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                <p className="text-green-700 text-xs">{t("claim_successful", "Claim successful!")}</p>
                {txId && (
                  <p className="text-[10px] text-green-600 mt-1 font-mono bg-green-50 p-1 rounded overflow-hidden text-ellipsis">
                    TX: {txId}
                  </p>
                )}
              </div>
            )}

            {/* Countdown Display */}
            {airdropStatus && !airdropStatus.canClaim && countdown && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center mb-3 animate-fadeIn">
                <div className="flex justify-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                <p className="text-blue-700 text-xs">{t("next_airdrop_in", "Next airdrop available in:")}</p>
                <p className="text-sm font-mono text-gray-800 mt-1">{countdown}</p>
                <p className="text-[10px] text-blue-600 mt-1">
                  {t("youll_receive", "You'll receive")} {airdropStatus.airdropAmount} TPF{" "}
                  {t("in_next_claim", "in the next claim")}
                </p>
              </div>
            )}

            {/* Contract Balance Display */}
            <div className="bg-gray-50 backdrop-blur-sm rounded-lg p-2 text-center mb-2 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">{t("contract_balance", "Contract Balance:")}</p>
              <div className="text-sm font-medium text-green-600">{contractBalance} TPF</div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {t("total_tokens_available", "Total tokens available for airdrops")}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-3 border border-red-200">{error}</div>
            )}

            {/* Follow Message */}
            {showFollowMessage && !allSocialsFollowed && (
              <div className="bg-yellow-50 text-yellow-700 text-xs p-2 rounded-lg mb-3 border border-yellow-200 animate-fadeIn">
                {t("follow_all_social", "Please follow all our social media channels to unlock the airdrop!")}
              </div>
            )}

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              disabled={isClaimingAirdrop || !allSocialsFollowed || (airdropStatus && !airdropStatus.canClaim)}
              className={`w-full py-1.5 px-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-sm
      ${
        isClaimingAirdrop
          ? "bg-blue-700 text-white cursor-wait"
          : !allSocialsFollowed
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : airdropStatus && !airdropStatus.canClaim
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-105"
      }`}
            >
              {isClaimingAirdrop ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
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
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
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
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
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
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
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
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 backdrop-blur-sm rounded-lg p-2 mb-2 border border-indigo-200 shadow-lg">
              <h3 className="text-base font-bold text-gray-800 mb-1 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-indigo-500"
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

              <p className="text-center text-gray-600 mb-2 text-xs">
                {t("follow_social_media", "Follow our social media to unlock the airdrop:")}
              </p>

              <div className="space-y-2">
                {/* Twitter/X */}
                <div className="bg-white rounded-lg p-1.5 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
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
                          className="text-indigo-600"
                        >
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 text-xs">{t("twitter_x", "Twitter/X")}</h4>
                        <p className="text-[10px] text-gray-500">@TradePulseToken</p>
                      </div>
                    </div>
                    {followedTwitter ? (
                      <div className="bg-green-100 text-green-600 text-[10px] px-2 py-1 rounded-full border border-green-200 flex items-center justify-center w-6 h-6">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
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
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full transition-colors"
                      >
                        {t("follow", "Follow")}
                      </button>
                    )}
                  </div>
                </div>

                {/* Telegram */}
                <div className="bg-white rounded-lg p-1.5 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
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
                          className="text-indigo-600"
                        >
                          <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.846 1.467 1.767 3.029 2.662 4.839.106.116.207.174.313.174.3 0 .536-.261.72-.484.386-.466.775-.935 1.164-1.403l1.67-2.055c.862-.817 1.792-1.602 2.877-2.34 1.04-.707 2.213-1.555 3.114-2.375.801-.729 1.376-1.591 1.69-2.454.315-.864.192-1.734-.172-2.465-.363-.73-1.049-1.187-1.769-1.283a4.326 4.326 0 0 0-.728-.05" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 text-xs">{t("telegram", "Telegram")}</h4>
                        <p className="text-[10px] text-gray-500">@tpulsefi</p>
                      </div>
                    </div>
                    {followedTelegram ? (
                      <div className="bg-green-100 text-green-600 text-[10px] px-2 py-1 rounded-full border border-green-200 flex items-center justify-center w-6 h-6">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
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
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full transition-colors"
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
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-yellow-50 text-yellow-700 border border-yellow-200"
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
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:border-indigo-500 transition-all duration-300 group"
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
                  className="text-gray-500 group-hover:text-indigo-600 transition-colors duration-300"
                >
                  <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.846 1.467 1.767 3.029 2.662 4.839.106.116.207.174.313.174.3 0 .536-.261.72-.484.386-.466.775-.935 1.164-1.403l1.67-2.055c.862-.817 1.792-1.602 2.877-2.34 1.04-.707 2.213-1.555 3.114-2.375.801-.729 1.376-1.591 1.69-2.454.315-.864.192-1.734-.172-2.465-.363-.73-1.049-1.187-1.769-1.283a4.326 4.326 0 0 0-.728-.05" />
                </svg>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
