"use client"

import { useState, useEffect } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { ethers } from "ethers"
import { useLanguage } from "@/lib/languageContext"
import { motion, AnimatePresence } from "framer-motion"

// Endereço do contrato da loteria
const LOTTERY_CONTRACT_ADDRESS = "0xb2271682333dE3f851c7522427E487a565dA6b16"
const TPF_TOKEN_ADDRESS = "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45"

// ABI do contrato da loteria
const LOTTERY_ABI = [
  {
    inputs: [],
    name: "BURN_PERCENTAGE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_ENTRY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_ENTRY_TPF",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WEEKLY_INTERVAL",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "accumulatedPrize",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "executeManualDraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentParticipants",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "wallet",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tickets",
            type: "uint256",
          },
        ],
        internalType: "struct AutomaticTPFLottery.Participant[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDebugInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "tpfBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "prize",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "participantCount",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "decimals",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "minEntry",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getNextDrawTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTimeUntilNextDraw",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastDraw",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "manualBurn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "participant",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "manualRegisterParticipant",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "tokensReceived",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalBurned",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// ABI para interações com tokens ERC20
const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
]

// Tipo para participante
type Participant = {
  wallet: string
  tickets: string
}

// Remover a navegação por abas e simplificar o layout
// Manter apenas o conteúdo principal com o design solicitado

// Modificar a estrutura do componente para remover as abas e reorganizar o conteúdo
export function Lottery({ userAddress }: { userAddress: string }) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("claim")
  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showBurnedModal, setShowBurnedModal] = useState(false)

  // Estado da loteria
  const [lotteryInfo, setLotteryInfo] = useState<{
    minEntryTPF: string
    burnPercentage: string
    accumulatedPrize: string
    contractBalance: string
    nextDrawTime: string
    timeUntilNextDraw: string
    totalBurned: string
    participants: Participant[]
    userTickets: string
    userParticipating: boolean
    decimals: number
  }>({
    minEntryTPF: "0",
    burnPercentage: "0",
    accumulatedPrize: "0",
    contractBalance: "0",
    nextDrawTime: "0",
    timeUntilNextDraw: "0",
    totalBurned: "0",
    participants: [],
    userTickets: "0",
    userParticipating: false,
    decimals: 18,
  })

  // Estado do usuário
  const [tpfBalance, setTpfBalance] = useState<string>("0")
  const [participationAmount, setParticipationAmount] = useState<string>("")
  const [countdown, setCountdown] = useState<string>("")

  const fetchLotteryData = async () => {
    if (!userAddress) return

    console.log("Manually fetching lottery data...")
    setError(null)

    try {
      // Criar provider
      let provider
      try {
        provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")
      } catch (error) {
        console.error("Failed to connect to primary RPC, trying fallback:", error)
        provider = new ethers.JsonRpcProvider("https://rpc.worldcoin.org")
      }

      // Obter contratos
      const lotteryContract = new ethers.Contract(LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI, provider)
      const tpfContract = new ethers.Contract(TPF_TOKEN_ADDRESS, ERC20_ABI, provider)

      // Buscar dados da loteria
      const [
        minEntryTPF,
        burnPercentage,
        accumulatedPrize,
        contractBalance,
        participants,
        debugInfo,
        nextDrawTime,
        timeUntilNextDraw,
        totalBurned,
        userBalance,
      ] = await Promise.all([
        lotteryContract.MIN_ENTRY_TPF(),
        lotteryContract.BURN_PERCENTAGE(),
        lotteryContract.accumulatedPrize(),
        lotteryContract.getContractBalance(),
        lotteryContract.getCurrentParticipants(),
        lotteryContract.getDebugInfo(),
        lotteryContract.getNextDrawTime(),
        lotteryContract.getTimeUntilNextDraw(),
        lotteryContract.totalBurned(),
        tpfContract.balanceOf(userAddress),
      ])

      // Obter decimais do debug info
      const decimals = Number(debugInfo[3])

      // Formatar dados
      const formattedMinEntryTPF = minEntryTPF.toString()
      const formattedBurnPercentage = burnPercentage.toString()
      const formattedAccumulatedPrize = ethers.formatUnits(accumulatedPrize, decimals)
      const formattedContractBalance = ethers.formatUnits(contractBalance, decimals)
      const formattedTotalBurned = ethers.formatUnits(totalBurned, decimals)
      const formattedUserBalance = ethers.formatUnits(userBalance, decimals)

      console.log("Fetched data:", {
        accumulatedPrize: formattedAccumulatedPrize,
        contractBalance: formattedContractBalance,
        participantsCount: participants.length,
      })

      // Formatar participantes
      const formattedParticipants = participants.map((p: any) => ({
        wallet: p[0],
        tickets: p[1].toString(),
      }))

      // Verificar se o usuário está participando
      let userTickets = "0"
      const userParticipating = formattedParticipants.some((p: Participant) => {
        if (p.wallet.toLowerCase() === userAddress.toLowerCase()) {
          userTickets = p.tickets
          return true
        }
        return false
      })

      setTpfBalance(formattedUserBalance)
      setLotteryInfo({
        minEntryTPF: formattedMinEntryTPF,
        burnPercentage: formattedBurnPercentage,
        accumulatedPrize: formattedAccumulatedPrize,
        contractBalance: formattedContractBalance,
        nextDrawTime: nextDrawTime.toString(),
        timeUntilNextDraw: timeUntilNextDraw.toString(),
        totalBurned: formattedTotalBurned,
        participants: formattedParticipants,
        userTickets,
        userParticipating,
        decimals,
      })
    } catch (err) {
      console.error("Error fetching lottery data:", err)
      setError(t("error_connecting", "Error connecting to lottery contract. Please try refreshing."))
    }
  }

  // Buscar dados da loteria
  useEffect(() => {
    setIsLoading(true)
    fetchLotteryData().finally(() => setIsLoading(false))

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(() => {
      fetchLotteryData()
    }, 30000)

    return () => clearInterval(interval)
  }, [userAddress, refreshTrigger])

  // Atualizar contador regressivo
  useEffect(() => {
    if (!lotteryInfo.timeUntilNextDraw || lotteryInfo.timeUntilNextDraw === "0") {
      setCountdown(t("draw_ready", "Draw ready!"))
      return
    }

    const updateCountdown = () => {
      const timeLeft = Number(lotteryInfo.timeUntilNextDraw)
      if (timeLeft <= 0) {
        setCountdown(t("draw_ready", "Draw ready!"))
        return
      }

      const days = Math.floor(timeLeft / (24 * 60 * 60))
      const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((timeLeft % (60 * 60)) / 60)
      const seconds = timeLeft % 60

      setCountdown(
        `${days}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds
          .toString()
          .padStart(2, "0")}s`,
      )
    }

    // Atualizar imediatamente
    updateCountdown()

    // E depois a cada segundo
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [lotteryInfo.timeUntilNextDraw, t])

  const handleParticipate = async () => {
    if (!participationAmount || Number(participationAmount) <= 0) {
      setError(t("please_enter_amount", "Please enter an amount"))
      return
    }

    const minEntry = Number(lotteryInfo.minEntryTPF)
    if (Number(participationAmount) < minEntry) {
      setError(t("minimum_entry_is", "Minimum entry is {minEntry} TPF").replace("{minEntry}", minEntry.toString()))
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(false)
    setTxHash(null)

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // Converter valor para wei
      const amountInWei = ethers.parseUnits(participationAmount, lotteryInfo.decimals).toString()
      console.log(`Participating with ${participationAmount} TPF (${amountInWei} wei)`)

      // Enviar tokens TPF para o contrato da loteria
      const transferResponse = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: TPF_TOKEN_ADDRESS,
            abi: [
              {
                inputs: [
                  { name: "to", type: "address" },
                  { name: "amount", type: "uint256" },
                ],
                name: "transfer",
                outputs: [{ name: "", type: "bool" }],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "transfer",
            args: [LOTTERY_CONTRACT_ADDRESS, amountInWei],
          },
        ],
      })

      console.log("Transfer response:", transferResponse.finalPayload)

      if (transferResponse.finalPayload.status === "error") {
        throw new Error(
          transferResponse.finalPayload.message ||
            transferResponse.finalPayload.description ||
            "Failed to transfer tokens",
        )
      }

      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(true)
      setSuccess(t("successfully_entered", "Successfully entered the lottery! Refreshing data..."))
      setTxHash(transferResponse.finalPayload.transaction_id || null)
      setParticipationAmount("")

      // Implementar estratégia de atualização mais agressiva
      // Primeiro atualizar imediatamente
      await fetchLotteryData()

      // Depois atualizar mais algumas vezes com atrasos
      setTimeout(() => fetchLotteryData(), 3000) // 3 segundos
      setTimeout(() => fetchLotteryData(), 6000) // 6 segundos
      setTimeout(() => fetchLotteryData(), 15000) // 15 segundos

      // Também acionar a atualização geral
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Error participating in lottery:", err)
      const errorMessage =
        err instanceof Error ? err.message : t("failed_to_participate", "Failed to participate in lottery")
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  // Formatar data
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "-"
    return new Date(Number(timestamp) * 1000).toLocaleString()
  }

  // Formatar endereço
  const formatAddress = (address: string) => {
    if (!address) return "-"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Calcular porcentagem de tickets
  const calculateTicketPercentage = (tickets: string) => {
    const totalTickets = lotteryInfo.participants.reduce((acc, p) => acc + Number(p.tickets), 0)
    if (totalTickets === 0) return "0%"
    return `${((Number(tickets) / totalTickets) * 100).toFixed(2)}%`
  }

  return (
    <div className="bg-gradient-to-b from-gray-900/90 to-purple-950/90 backdrop-blur-sm rounded-2xl p-5 max-w-md mx-auto shadow-xl border border-purple-700/50 animate-fadeIn">
      {/* Cabeçalho com título e subtítulo */}
      <div className="text-center mb-6 relative">
        {/* Fundo de brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-xl blur-xl animate-pulse"></div>

        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
            {t("lottery_title", "Loteria TPF")}
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full mb-3"></div>

          {/* Estrelas animadas */}
          <div className="absolute -top-4 -left-2 text-yellow-300 animate-pulse text-xl">✨</div>
          <div className="absolute -top-2 -right-1 text-yellow-300 animate-pulse delay-300 text-xl">✨</div>

          <p className="text-sm text-gray-300 max-w-xs mx-auto">
            {t("enter_now", "Entre agora")} {t("for_chance_to_win", "para ter a chance de ganhar muito!")}
            <br />
            {t("more_tpf_higher_chance", "Quanto mais enviares = Maior a chance de ganhares!")}
          </p>
        </div>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded-lg mb-4 border border-red-800/50 animate-fadeIn">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 text-green-300 text-sm p-4 rounded-lg mb-4 border border-green-500/50 animate-fadeIn">
          {success.includes("Successfully entered") ? (
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300 mb-2 animate-pulse">
                🍀 {t("good_luck", "Boa Sorte!")} 🍀
              </div>
              <p className="text-green-300">{t("success_entered", "Entraste com sucesso na loteria!")}</p>
              {txHash && (
                <div className="mt-3">
                  <a
                    href={`https://worldscan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-blue-900/50 hover:bg-blue-800/70 text-blue-300 px-3 py-1.5 rounded transition-colors"
                  >
                    {t("view_on_worldscan", "Ver no WorldScan")}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">{success}</div>
          )}
        </div>
      )}

      {/* Seção do Grande Prêmio */}
      <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm rounded-xl p-4 mb-6 border border-purple-500/50 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
        <div className="relative overflow-hidden">
          {/* Efeito de brilho animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-size-200"></div>

          <div className="text-center py-2">
            <h2 className="text-xl font-bold text-yellow-300 mb-1 flex items-center justify-center">
              <span className="text-2xl mr-1">🏆</span> {t("big_winner", "GRANDE VENCEDOR")}{" "}
              <span className="text-2xl ml-1">🏆</span>
            </h2>
            <div className="text-3xl font-extrabold text-white mb-2">
              {Number(lotteryInfo.contractBalance).toLocaleString()} TPF
            </div>
            <p className="text-sm text-purple-200">{t("could_be_yours_in", "Pode ser teu em:")}</p>
            <div className="text-xl font-mono text-yellow-300 mt-1 bg-purple-900/50 rounded-lg py-1 px-3 inline-block">
              {countdown === "Draw ready!" ? t("draw_ready", "Sorteio pronto!") : countdown}
            </div>

            {/* Chance do usuário abaixo do temporizador */}
            <div className="mt-2 text-sm">
              <span
                className={`bg-purple-900/50 rounded-lg py-1 px-3 ${
                  lotteryInfo.userParticipating ? "text-green-300" : "text-gray-300"
                }`}
              >
                {t("chance", "Chance")}:{" "}
                {lotteryInfo.userParticipating ? calculateTicketPercentage(lotteryInfo.userTickets) : "0%"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de participação integrado na mesma janela */}
      <div className="bg-gradient-to-r from-blue-900/70 to-purple-900/70 backdrop-blur-sm rounded-lg p-4 mb-4 border border-blue-600/50 shadow-lg transform hover:shadow-purple-500/20 hover:border-purple-500/70 transition-all duration-300">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              {t("your_tpf_balance", "Saldo TPF")}
            </label>
            <div className="w-full px-3 py-2 bg-gray-800/80 border border-purple-700/50 rounded-lg text-white font-bold">
              {Number(tpfBalance).toLocaleString()} TPF
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-1">
              {t("amount_to_enter", "Quantidade para entrar")}
            </label>
            <input
              type="number"
              value={participationAmount}
              onChange={(e) => setParticipationAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-2 bg-gray-800/80 border border-purple-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="text-xs text-purple-300 mt-1">
              {t("minimum_entry", "Entrada mínima")} - {lotteryInfo.minEntryTPF} TPF
            </p>
          </div>

          <button
            onClick={handleParticipate}
            disabled={
              isProcessing ||
              Number(participationAmount) <= 0 ||
              Number(participationAmount) < Number(lotteryInfo.minEntryTPF) ||
              Number(participationAmount) > Number(tpfBalance)
            }
            className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center
            ${
              isProcessing
                ? "bg-purple-700 text-white cursor-wait"
                : Number(participationAmount) <= 0 ||
                    Number(participationAmount) < Number(lotteryInfo.minEntryTPF) ||
                    Number(participationAmount) > Number(tpfBalance)
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-600/30 hover:scale-[1.02] transform"
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                {t("processing", "Processando...")}
              </div>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("enter_now_button", "ENTRE AGORA!")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ícones de Info e Total Queimado */}
      <div className="flex justify-center space-x-6 mt-4">
        {/* Ícone de Info */}
        <button
          onClick={() => setShowInfoModal(!showInfoModal)}
          className="flex flex-col items-center justify-center space-y-1"
        >
          <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center hover:bg-blue-800/70 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-300"
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
          </div>
          <span className="text-xs text-gray-400">{t("info", "Info")}</span>
        </button>

        {/* Ícone de Total Queimado */}
        <button
          onClick={() => setShowBurnedModal(!showBurnedModal)}
          className="flex flex-col items-center justify-center space-y-1"
        >
          <div className="w-10 h-10 rounded-full bg-orange-900/50 flex items-center justify-center hover:bg-orange-800/70 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-orange-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
              />
            </svg>
          </div>
          <span className="text-xs text-gray-400">{t("burned", "Burned")}</span>
        </button>
      </div>

      {/* Modal de Informações */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              className="bg-gradient-to-r from-blue-900/90 to-purple-900/90 backdrop-blur-sm rounded-lg p-5 border border-blue-600/50 shadow-lg max-w-md w-full m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("how_it_works_info", "Como Funciona")}
              </h3>

              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex items-start bg-gray-800/50 p-3 rounded-lg">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    1
                  </div>
                  <p>
                    {t("how_it_works_point1", "Participa na loteria enviando tokens TPF (min {minEntry} TPF)").replace(
                      "{minEntry}",
                      lotteryInfo.minEntryTPF,
                    )}
                  </p>
                </div>

                <div className="flex items-start bg-gray-800/50 p-3 rounded-lg">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    2
                  </div>
                  <p>
                    {t("how_it_works_point2", "Cada {minEntry} TPF dá-te 1 bilhete").replace(
                      "{minEntry}",
                      lotteryInfo.minEntryTPF,
                    )}
                  </p>
                </div>

                <div className="flex items-start bg-gray-800/50 p-3 rounded-lg">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    3
                  </div>
                  <p>{t("how_it_works_point3", "Mais bilhetes = maior chance de ganhar")}</p>
                </div>

                <div className="flex items-start bg-gray-800/50 p-3 rounded-lg">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    4
                  </div>
                  <p>{t("how_it_works_point4", "O vencedor é selecionado aleatoriamente todas as semanas")}</p>
                </div>

                <div className="flex items-start bg-gray-800/50 p-3 rounded-lg">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    5
                  </div>
                  <p>
                    {t("how_it_works_point5", "O vencedor recebe {winnerPercent}% do prêmio, {burnPercent}% é queimado")
                      .replace("{winnerPercent}", (100 - Number(lotteryInfo.burnPercentage)).toString())
                      .replace("{burnPercent}", lotteryInfo.burnPercentage)}
                  </p>
                </div>

                <div className="flex items-start bg-gray-800/50 p-3 rounded-lg">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                    6
                  </div>
                  <p>{t("all_weeks_have_one", "Todas as semanas têm uma loteria")}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {t("close", "Fechar")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Total Queimado */}
      <AnimatePresence>
        {showBurnedModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowBurnedModal(false)}
          >
            <motion.div
              className="bg-gradient-to-b from-gray-900/90 via-red-900/40 to-orange-900/30 backdrop-blur-sm rounded-lg p-5 border border-orange-600/50 shadow-lg max-w-md w-full m-4 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Elementos de animação de fogo */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden">
                <div className="absolute bottom-0 left-1/4 w-2 h-8 bg-orange-500 rounded-t-lg animate-pulse opacity-70"></div>
                <div className="absolute bottom-0 left-1/3 w-3 h-12 bg-orange-400 rounded-t-lg animate-pulse delay-100 opacity-60"></div>
                <div className="absolute bottom-0 left-1/2 w-4 h-16 bg-yellow-500 rounded-t-lg animate-pulse delay-200 opacity-80"></div>
                <div className="absolute bottom-0 left-2/3 w-3 h-10 bg-red-500 rounded-t-lg animate-pulse delay-300 opacity-70"></div>
                <div className="absolute bottom-0 left-3/4 w-2 h-6 bg-orange-600 rounded-t-lg animate-pulse delay-150 opacity-60"></div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="text-orange-500 mr-2">🔥</span>
                    {t("total_burned", "Total Queimado")}
                    <span className="text-orange-500 ml-2">🔥</span>
                  </h3>
                  <button
                    onClick={() => {
                      setSuccess(t("refreshing_data", "Atualizando dados..."))
                      fetchLotteryData().then(() => {
                        setSuccess(false)
                      })
                    }}
                    className="text-xs bg-orange-700 hover:bg-orange-600 text-white px-2 py-1 rounded-full transition-colors flex items-center shadow-md hover:shadow-orange-500/30"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {t("refresh", "Atualizar")}
                  </button>
                </div>

                <div className="text-center py-4">
                  <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 animate-pulse">
                    {Number(lotteryInfo.totalBurned).toLocaleString()} TPF
                  </div>
                  <p className="text-orange-300 mt-2">
                    {t("tokens_removed", "Tokens removidos permanentemente da circulação")}
                  </p>
                </div>

                {/* Chamas animadas na parte inferior */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-orange-600/40 to-transparent"></div>
              </div>

              <div className="mt-4 flex justify-center relative z-10">
                <button
                  onClick={() => setShowBurnedModal(false)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  {t("close", "Fechar")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
