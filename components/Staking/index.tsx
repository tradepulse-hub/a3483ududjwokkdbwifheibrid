"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import { ethers } from "ethers"
import { motion } from "framer-motion"

const STAKING_CONTRACT_ADDRESS = "0xb4b2f053031FC05aDBC858CA721185994e3c041B" // Updated staking contract address

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

  // Fetch staking data
  useEffect(() => {
    const fetchStakingData = async () => {
      if (!userAddress) return

      try {
        setIsLoading(true)

        // Get TPF balance
        const tpfBalanceResponse = await fetch(`/api/token-balance?address=${userAddress}&token=tpf`)
        const tpfBalanceData = await tpfBalanceResponse.json()
        if (tpfBalanceData.success) {
          setTpfBalance(ethers.formatEther(tpfBalanceData.balance.toString()))
        }

        // Get staked balance
        const stakedBalanceResponse = await fetch(`/api/staking-balance?address=${userAddress}`)
        const stakedBalanceData = await stakedBalanceResponse.json()
        if (stakedBalanceData.success) {
          setStakedBalance(ethers.formatEther(stakedBalanceData.stakedBalance.toString()))
        }

        // Get earned rewards
        const earnedRewardsResponse = await fetch(`/api/staking-rewards?address=${userAddress}`)
        const earnedRewardsData = await earnedRewardsResponse.json()
        if (earnedRewardsData.success) {
          setEarnedRewards(ethers.formatEther(earnedRewardsData.earnedRewards.toString()))
        }
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
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) return

    try {
      setIsStaking(true)
      setTransactionStatus("pending")

      const response = await fetch("/api/stake-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: userAddress,
          amount: stakeAmount,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransactionStatus("success")
        setStakeAmount("")
      } else {
        setTransactionStatus("error")
      }
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
    if (!unstakeAmount || Number.parseFloat(unstakeAmount) <= 0) return

    try {
      setIsUnstaking(true)
      setTransactionStatus("pending")

      const response = await fetch("/api/unstake-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: userAddress,
          amount: unstakeAmount,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransactionStatus("success")
        setUnstakeAmount("")
      } else {
        setTransactionStatus("error")
      }
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

      const response = await fetch("/api/claim-staking-rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: userAddress,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransactionStatus("success")
        setEarnedRewards("0")
      } else {
        setTransactionStatus("error")
      }
    } catch (error) {
      console.error("Error claiming rewards:", error)
      setTransactionStatus("error")
    } finally {
      setIsClaiming(false)
      // Reset status after 3 seconds
      setTimeout(() => setTransactionStatus(""), 3000)
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
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
          {t("staking_account", "Staking Account")}
        </h2>
        <p className="text-sm text-gray-500">{t("earn_interest_every_second", "Earn interest every second")}</p>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-3 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold">{t("balance", "Balance")}:</span>
          <span className="text-xl font-bold">{Number.parseFloat(stakedBalance).toFixed(2)} TPF</span>
        </div>
        <div className="text-xs text-gray-500 mb-3">{stakedBalance} TPF</div>

        {/* Rewards section */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">{t("rewards", "Rewards")}:</span>
          <div className="flex items-center">
            <span className="text-lg font-bold mr-2">{Number.parseFloat(earnedRewards).toFixed(8)}</span>
            <button
              onClick={handleClaimRewards}
              disabled={Number.parseFloat(earnedRewards) <= 0 || isClaiming}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                Number.parseFloat(earnedRewards) <= 0 || isClaiming
                  ? "bg-gray-300 text-gray-500"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isClaiming ? t("collecting", "Collecting...") : t("collect", "Collect")}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-3">
        <button
          onClick={() => setActiveTab("stake")}
          className={`flex-1 py-2 text-center rounded-l-lg ${
            activeTab === "stake" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {t("deposit", "Deposit")}
        </button>
        <button
          onClick={() => setActiveTab("unstake")}
          className={`flex-1 py-2 text-center rounded-r-lg ${
            activeTab === "unstake" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {t("withdraw", "Withdraw")}
        </button>
      </div>

      {/* Stake/Unstake Form */}
      {activeTab === "stake" ? (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("available_balance", "Available Balance")}: {Number.parseFloat(tpfBalance).toFixed(2)} TPF
            </label>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder={t("amount_to_stake", "Amount to stake")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <button
                onClick={() => setStakeAmount(tpfBalance)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-200 px-2 py-1 rounded text-gray-700"
              >
                {t("max", "MAX")}
              </button>
            </div>
          </div>

          <button
            onClick={handleStake}
            disabled={
              !stakeAmount ||
              Number.parseFloat(stakeAmount) <= 0 ||
              Number.parseFloat(stakeAmount) > Number.parseFloat(tpfBalance) ||
              isStaking
            }
            className={`w-full py-3 rounded-lg text-white font-medium ${
              !stakeAmount ||
              Number.parseFloat(stakeAmount) <= 0 ||
              Number.parseFloat(stakeAmount) > Number.parseFloat(tpfBalance) ||
              isStaking
                ? "bg-gray-400"
                : "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black"
            }`}
          >
            {isStaking ? t("staking", "Staking...") : t("stake_tpf", "Stake TPF")}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("staked_balance", "Staked Balance")}: {Number.parseFloat(stakedBalance).toFixed(2)} TPF
            </label>
            <div className="relative">
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder={t("amount_to_unstake", "Amount to unstake")}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <button
                onClick={() => setUnstakeAmount(stakedBalance)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-200 px-2 py-1 rounded text-gray-700"
              >
                {t("max", "MAX")}
              </button>
            </div>
          </div>

          <button
            onClick={handleUnstake}
            disabled={
              !unstakeAmount ||
              Number.parseFloat(unstakeAmount) <= 0 ||
              Number.parseFloat(unstakeAmount) > Number.parseFloat(stakedBalance) ||
              isUnstaking
            }
            className={`w-full py-3 rounded-lg text-white font-medium ${
              !unstakeAmount ||
              Number.parseFloat(unstakeAmount) <= 0 ||
              Number.parseFloat(unstakeAmount) > Number.parseFloat(stakedBalance) ||
              isUnstaking
                ? "bg-gray-400"
                : "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black"
            }`}
          >
            {isUnstaking ? t("unstaking", "Unstaking...") : t("unstake_tpf", "Unstake TPF")}
          </button>
        </div>
      )}

      {/* Transaction Status */}
      {transactionStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mt-3 p-3 rounded-lg text-center ${
            transactionStatus === "success"
              ? "bg-green-100 text-green-800"
              : transactionStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {transactionStatus === "success" && t("transaction_success", "Transaction successful!")}
          {transactionStatus === "error" && t("transaction_error", "Transaction failed. Please try again.")}
          {transactionStatus === "pending" && t("transaction_pending", "Transaction pending...")}
        </motion.div>
      )}

      {/* Info Section */}
      <div className="mt-auto p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
        <p className="mb-1">• {t("staking_info_1", "Stake TPF to earn rewards")}</p>
        <p className="mb-1">• {t("staking_info_2", "Rewards are distributed every second")}</p>
        <p>• {t("staking_info_3", "Minimum stake amount: 1 TPF")}</p>
      </div>
    </div>
  )
}
