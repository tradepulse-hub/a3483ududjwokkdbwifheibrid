"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import { ethers } from "ethers"
import { motion, AnimatePresence } from "framer-motion"
import { MiniKit } from "@worldcoin/minikit-js"
import { TPF_TOKEN_ADDRESS } from "@/lib/constants"

const STAKING_CONTRACT_ADDRESS = "0xb4b2f053031FC05aDBC858CA721185994e3c041B"

interface StakingProps {
  userAddress: string
}

export function Staking({ userAddress }: StakingProps) {
  const { t } = useLanguage()
  const [stakedBalance, setStakedBalance] = useState("0")
  const [earnedRewards, setEarnedRewards] = useState("0")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("stake") // stake or unstake
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState("")
  const [tpfBalance, setTpfBalance] = useState("0")
  const [apr, setApr] = useState("12.5") // Default APR value
  const [totalStaked, setTotalStaked] = useState("0")

  // Fetch staking data
  useEffect(() => {
    const fetchStakingData = async () => {
      if (!userAddress) return

      try {
        setIsLoading(true)

        // Get TPF balance
        const tpfResponse = await fetch(`/api/token-balance?address=${userAddress}`)
        const tpfData = await tpfResponse.json()

        if (!tpfData.error) {
          setTpfBalance(tpfData.balance.toString())
        }

        // Get staked balance
        const stakedResponse = await fetch(`/api/staking-balance?address=${userAddress}`)
        const stakedData = await stakedResponse.json()

        if (stakedData.success) {
          setStakedBalance(stakedData.stakedBalance)
        }

        // Get earned rewards
        const rewardsResponse = await fetch(`/api/staking-rewards?address=${userAddress}`)
        const rewardsData = await rewardsResponse.json()

        if (rewardsData.success) {
          setEarnedRewards(rewardsData.earnedRewards)
        }

        // Simulate total staked (in a real app, this would come from the contract)
        setTotalStaked((Math.random() * 1000000 + 500000).toFixed(2))
      } catch (error) {
        console.error("Error fetching staking data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStakingData()

    // Set up interval to refresh data
    const intervalId = setInterval(fetchStakingData, 30000) // every 30 seconds

    return () => clearInterval(intervalId)
  }, [userAddress, transactionStatus])

  // Handle staking
  const handleStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return

    try {
      setIsStaking(true)
      setTransactionStatus("pending")

      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // Convert amount to wei
      const amountInWei = ethers.parseUnits(stakeAmount, 18).toString()

      // First approve the staking contract to spend tokens
      const approveResponse = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: TPF_TOKEN_ADDRESS,
            abi: [
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
            ],
            functionName: "approve",
            args: [STAKING_CONTRACT_ADDRESS, amountInWei],
          },
        ],
      })

      if (approveResponse.finalPayload.status === "error") {
        throw new Error("Failed to approve tokens")
      }

      // Then stake the tokens
      const stakeResponse = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: STAKING_CONTRACT_ADDRESS,
            abi: [
              {
                inputs: [{ name: "amount", type: "uint256" }],
                name: "stake",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "stake",
            args: [amountInWei],
          },
        ],
      })

      if (stakeResponse.finalPayload.status === "error") {
        throw new Error("Failed to stake tokens")
      }

      setTransactionStatus("success")
      setStakeAmount("")

      // Update balances after successful staking
      setTimeout(() => {
        fetch(`/api/token-balance?address=${userAddress}`)
          .then((res) => res.json())
          .then((data) => {
            if (!data.error) {
              setTpfBalance(data.balance.toString())
            }
          })
          .catch(console.error)

        fetch(`/api/staking-balance?address=${userAddress}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setStakedBalance(data.stakedBalance)
            }
          })
          .catch(console.error)
      }, 2000)
    } catch (error) {
      console.error("Error staking tokens:", error)
      setTransactionStatus("error")
    } finally {
      setIsStaking(false)
      // Reset status after 3 seconds
      setTimeout(() => setTransactionStatus(""), 3000)
    }
  }

  // Handle unstaking
  const handleUnstake = async () => {
    if (!unstakeAmount || Number(unstakeAmount) <= 0) return

    try {
      setIsUnstaking(true)
      setTransactionStatus("pending")

      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // Convert amount to wei
      const amountInWei = ethers.parseUnits(unstakeAmount, 18).toString()

      // Unstake tokens
      const unstakeResponse = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: STAKING_CONTRACT_ADDRESS,
            abi: [
              {
                inputs: [{ name: "amount", type: "uint256" }],
                name: "withdraw",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "withdraw",
            args: [amountInWei],
          },
        ],
      })

      if (unstakeResponse.finalPayload.status === "error") {
        throw new Error("Failed to unstake tokens")
      }

      setTransactionStatus("success")
      setUnstakeAmount("")

      // Update balances after successful unstaking
      setTimeout(() => {
        fetch(`/api/token-balance?address=${userAddress}`)
          .then((res) => res.json())
          .then((data) => {
            if (!data.error) {
              setTpfBalance(data.balance.toString())
            }
          })
          .catch(console.error)

        fetch(`/api/staking-balance?address=${userAddress}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setStakedBalance(data.stakedBalance)
            }
          })
          .catch(console.error)
      }, 2000)
    } catch (error) {
      console.error("Error unstaking tokens:", error)
      setTransactionStatus("error")
    } finally {
      setIsUnstaking(false)
      // Reset status after 3 seconds
      setTimeout(() => setTransactionStatus(""), 3000)
    }
  }

  // Handle claiming rewards
  const handleClaimRewards = async () => {
    try {
      setIsClaiming(true)
      setTransactionStatus("pending")

      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // Claim rewards
      const claimResponse = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: STAKING_CONTRACT_ADDRESS,
            abi: [
              {
                inputs: [],
                name: "claimReward",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "claimReward",
            args: [],
          },
        ],
      })

      if (claimResponse.finalPayload.status === "error") {
        throw new Error("Failed to claim rewards")
      }

      setTransactionStatus("success")
      setEarnedRewards("0")
    } catch (error) {
      console.error("Error claiming rewards:", error)
      setTransactionStatus("error")
    } finally {
      setIsClaiming(false)
      // Reset status after 3 seconds
      setTimeout(() => setTransactionStatus(""), 3000)
    }
  }

  // Format balance for display
  const formatBalance = (balance: string, decimals = 18) => {
    try {
      return Number(ethers.formatUnits(balance, decimals)).toFixed(2)
    } catch (error) {
      console.error("Error formatting balance:", error)
      return "0.00"
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-gray-600">{t("loading", "Loading...")}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
          {t("staking_account", "Staking Account")}
        </h2>
        <p className="text-xs text-gray-500">{t("earn_interest_every_second", "Earn interest every second")}</p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-md p-3 mb-2 border border-gray-300">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-xs text-gray-500">{t("total_staked", "Total Staked")}</div>
            <div className="text-sm font-bold">{Number(totalStaked).toLocaleString()} TPF</div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <div className="text-xs text-gray-500">{t("apr", "APR")}</div>
            <div className="text-sm font-bold text-green-600">{apr}%</div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-2 border border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold">{t("staked_balance", "Staked Balance")}:</span>
          <span className="text-base font-bold">{formatBalance(stakedBalance)} TPF</span>
        </div>
        <div className="text-xs text-gray-500 mb-2">{ethers.formatUnits(stakedBalance, 18)} TPF</div>

        {/* Rewards section */}
        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
          <span className="text-sm font-semibold">{t("rewards", "Rewards")}:</span>
          <div className="flex items-center">
            <span className="text-sm font-bold mr-2 text-green-600">{formatBalance(earnedRewards)}</span>
            <button
              onClick={handleClaimRewards}
              disabled={Number(earnedRewards) <= 0 || isClaiming}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                Number(earnedRewards) <= 0 || isClaiming
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:shadow-md hover:shadow-gray-500/20 transform hover:scale-105"
              }`}
            >
              {isClaiming ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                  {t("collecting", "Collecting...")}
                </div>
              ) : (
                t("collect", "Collect")
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-2">
        <button
          onClick={() => setActiveTab("stake")}
          className={`flex-1 py-1.5 text-center rounded-l-lg text-xs ${
            activeTab === "stake"
              ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {t("deposit", "Deposit")}
        </button>
        <button
          onClick={() => setActiveTab("unstake")}
          className={`flex-1 py-1.5 text-center rounded-r-lg text-xs ${
            activeTab === "unstake"
              ? "bg-gradient-to-r from-gray-700 to-gray-900 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {t("withdraw", "Withdraw")}
        </button>
      </div>

      {/* Stake/Unstake Form */}
      <AnimatePresence mode="wait">
        {activeTab === "stake" ? (
          <motion.div
            key="stake"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-md p-3 border border-gray-200"
          >
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("available_balance", "Available Balance")}: {formatBalance(tpfBalance)} TPF
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder={t("amount_to_stake", "Amount to stake")}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <button
                  onClick={() => setStakeAmount(ethers.formatUnits(tpfBalance, 18))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700"
                >
                  {t("max", "MAX")}
                </button>
              </div>
            </div>

            <button
              onClick={handleStake}
              disabled={
                !stakeAmount ||
                Number(stakeAmount) <= 0 ||
                Number(stakeAmount) > Number(ethers.formatUnits(tpfBalance, 18)) ||
                isStaking
              }
              className={`w-full py-2 rounded-lg text-white font-medium text-sm transition-all duration-300 ${
                !stakeAmount ||
                Number(stakeAmount) <= 0 ||
                Number(stakeAmount) > Number(ethers.formatUnits(tpfBalance, 18)) ||
                isStaking
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black hover:shadow-lg hover:shadow-gray-500/20 transform hover:scale-[1.02]"
              }`}
            >
              {isStaking ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  {t("staking", "Staking...")}
                </div>
              ) : (
                <div className="flex items-center justify-center">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t("stake_tpf", "Stake TPF")}
                </div>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="unstake"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-md p-3 border border-gray-200"
          >
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("staked_balance", "Staked Balance")}: {formatBalance(stakedBalance)} TPF
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder={t("amount_to_unstake", "Amount to unstake")}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
                <button
                  onClick={() => setUnstakeAmount(ethers.formatUnits(stakedBalance, 18))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700"
                >
                  {t("max", "MAX")}
                </button>
              </div>
            </div>

            <button
              onClick={handleUnstake}
              disabled={
                !unstakeAmount ||
                Number(unstakeAmount) <= 0 ||
                Number(unstakeAmount) > Number(ethers.formatUnits(stakedBalance, 18)) ||
                isUnstaking
              }
              className={`w-full py-2 rounded-lg text-white font-medium text-sm transition-all duration-300 ${
                !unstakeAmount ||
                Number(unstakeAmount) <= 0 ||
                Number(unstakeAmount) > Number(ethers.formatUnits(stakedBalance, 18)) ||
                isUnstaking
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black hover:shadow-lg hover:shadow-gray-500/20 transform hover:scale-[1.02]"
              }`}
            >
              {isUnstaking ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  {t("unstaking", "Unstaking...")}
                </div>
              ) : (
                <div className="flex items-center justify-center">
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {t("unstake_tpf", "Unstake TPF")}
                </div>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Status */}
      <AnimatePresence>
        {transactionStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mt-2 p-2 rounded-lg text-center text-xs ${
              transactionStatus === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : transactionStatus === "error"
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
            }`}
          >
            {transactionStatus === "success" && t("transaction_success", "Transaction successful!")}
            {transactionStatus === "error" && t("transaction_error", "Transaction failed. Please try again.")}
            {transactionStatus === "pending" && t("transaction_pending", "Transaction pending...")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Section */}
      <div className="mt-auto p-2 bg-gray-100 rounded-lg text-xs text-gray-600">
        <p className="mb-1">• {t("staking_info_1", "Stake TPF to earn rewards")}</p>
        <p className="mb-1">• {t("staking_info_2", "Rewards are distributed every second")}</p>
        <p>• {t("staking_info_3", "Minimum stake amount: 1 TPF")}</p>
      </div>
    </div>
  )
}
