"use client"
import { useState, useEffect, useRef } from "react"
import { claimAirdrop } from "@/lib/airdropService"
import { useLanguage } from "@/lib/languageContext"
import Image from "next/image"

export function ClaimCoin({ userAddress }: { userAddress: string }) {
  const { t, language } = useLanguage()
  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const coinRef = useRef<HTMLDivElement>(null)
  const coinFrontRef = useRef<HTMLDivElement>(null)
  const coinBackRef = useRef<HTMLDivElement>(null)

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

  // Efeito para rotação 3D da moeda
  useEffect(() => {
    const coin = coinRef.current
    const coinFront = coinFrontRef.current
    const coinBack = coinBackRef.current

    if (!coin || !coinFront || !coinBack) return

    // Configurar a rotação inicial
    coin.style.transform = "perspective(1000px) rotateY(0deg)"

    // Função para animar a rotação da moeda
    let angle = 0
    let isHovering = false

    const animate = () => {
      if (!isHovering) {
        // Rotação contínua em vez de oscilação
        angle += 0.5
        if (angle >= 360) angle = 0

        coin.style.transform = `perspective(1000px) rotateY(${angle}deg)`
      }
      requestAnimationFrame(animate)
    }

    animate()

    const handleMouseMove = (e: MouseEvent) => {
      isHovering = true
      const rect = coin.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      // Limitar a rotação a um ângulo máximo
      const maxRotation = 25
      const rotateX = Math.min(Math.max(-maxRotation, y / 5), maxRotation)
      const rotateY = Math.min(Math.max(-maxRotation, -x / 5), maxRotation)

      coin.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }

    const handleMouseLeave = () => {
      isHovering = false
      coin.style.transition = "transform 0.5s ease"
      setTimeout(() => {
        if (coin) coin.style.transition = ""
      }, 500)
    }

    coin.addEventListener("mousemove", handleMouseMove)
    coin.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      coin.removeEventListener("mousemove", handleMouseMove)
      coin.addEventListener("mouseleave", handleMouseLeave)
    }
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

  // Função para reclamar o airdrop
  const handleClaim = async () => {
    if (isClaimingAirdrop) return

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

  // Texto para o botão de reivindicação baseado no idioma
  const getClaimText = () => {
    if (language === "pt") {
      return "Reivindicar TPF"
    }
    return t("claim_tpf_now", "Claim TPF Now")
  }

  // Texto para o contador baseado no idioma
  const getCountdownText = () => {
    if (language === "pt") {
      return "Reivindique seu TPF em"
    }
    return t("claim_in", "Claim your TPF in")
  }

  return (
    <div className="bg-white backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto shadow-xl border border-gray-200 -mt-2 flex flex-col items-center justify-center">
      {/* Título */}
      <h1 className="text-lg sm:text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800">
        {t("daily_airdrop", "Daily Airdrop")}
      </h1>

      {/* Moeda 3D com efeito de espessura */}
      <div
        ref={coinRef}
        className="relative w-56 h-56 mb-8 cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
      >
        {/* Borda externa da moeda */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300 to-gray-200 shadow-xl flex items-center justify-center"
          style={{
            transform: "translateZ(-2px)",
            boxShadow: "0 0 30px rgba(0,0,0,0.2)",
          }}
        ></div>

        {/* Lateral da moeda - dá a sensação de espessura */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            transform: "translateZ(-1px)",
            background: "linear-gradient(to right, #999, #eee, #999, #eee, #999)",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
          }}
        ></div>

        {/* Frente da moeda */}
        <div
          ref={coinFrontRef}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 shadow-xl border-8 border-gray-300 flex items-center justify-center overflow-hidden"
          style={{
            transform: "translateZ(2px)",
            boxShadow: "0 0 20px rgba(0,0,0,0.1)",
          }}
        >
          <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-gray-600 to-gray-700 p-1 shadow-inner">
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              <Image
                src="/images/tpf-logo-new.png"
                alt="TPF Logo"
                width={120}
                height={120}
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Verso da moeda */}
        <div
          ref={coinBackRef}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 shadow-xl border-8 border-gray-300 flex items-center justify-center overflow-hidden"
          style={{
            transform: "translateZ(-2px) rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-gray-600 to-gray-700 p-1 shadow-inner">
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-700">TPF</div>
            </div>
          </div>
        </div>

        {/* Reflexo na moeda */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent"
          style={{
            transform: "translateZ(3px)",
            height: "50%",
          }}
        ></div>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center mb-3 animate-fadeIn w-full">
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
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center mb-3 animate-fadeIn w-full">
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
        <div className="text-center mb-6 w-full">
          <p className="text-gray-500 text-sm mb-2">{getCountdownText()}</p>
          <p className="text-3xl font-mono font-bold text-gray-800">{countdown}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-3 border border-red-200 w-full">{error}</div>
      )}

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={isClaimingAirdrop || (airdropStatus && !airdropStatus.canClaim)}
        className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center text-xs
          ${
            isClaimingAirdrop
              ? "bg-gray-700 text-white cursor-wait"
              : airdropStatus && !airdropStatus.canClaim
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-lg hover:shadow-gray-500/20 hover:scale-105"
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {t("processing", "Processing...")}
          </>
        ) : airdropStatus && !airdropStatus.canClaim ? (
          <>
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
              width="20"
              height="20"
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
            {getClaimText()}
          </>
        )}
      </button>

      {/* Contract Balance Display - Mais discreto */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">{t("contract_balance", "Contract Balance:")}</p>
        <div className="text-sm font-medium text-gray-700">{contractBalance} TPF</div>
      </div>
    </div>
  )
}
