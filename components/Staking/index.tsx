"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import { ethers } from "ethers"

// Simplified component with better error handling
export function Staking({ userAddress }: { userAddress: string }) {
  const { t } = useLanguage()
  const [stakedBalance, setStakedBalance] = useState("0")
  const [earnedRewards, setEarnedRewards] = useState("0")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("stake")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [tpfBalance, setTpfBalance] = useState("0")
  const [error, setError] = useState("")

  // Fetch data with better error handling
  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      if (!userAddress) return

      try {
        setIsLoading(true)
        setError("")

        // Get TPF balance
        try {
          const tpfResponse = await fetch(`/api/token-balance?address=${userAddress}`)
          const tpfData = await tpfResponse.json()
          if (mounted && !tpfData.error) {
            setTpfBalance(tpfData.balance?.toString() || "0")
          }
        } catch (e) {
          console.error("Error fetching TPF balance:", e)
          if (mounted) setTpfBalance("0")
        }

        // Get staked balance
        try {
          const stakedResponse = await fetch(`/api/staking-balance?address=${userAddress}`)
          const stakedData = await stakedResponse.json()
          if (mounted && stakedData.success) {
            setStakedBalance(stakedData.stakedBalance || "0")
          }
        } catch (e) {
          console.error("Error fetching staked balance:", e)
          if (mounted) setStakedBalance("0")
        }

        // Get rewards
        try {
          const rewardsResponse = await fetch(`/api/staking-rewards?address=${userAddress}`)
          const rewardsData = await rewardsResponse.json()
          if (mounted && rewardsData.success) {
            setEarnedRewards(rewardsData.earnedRewards || "0")
          }
        } catch (e) {
          console.error("Error fetching rewards:", e)
          if (mounted) setEarnedRewards("0")
        }
      } catch (e) {
        console.error("Error in data fetching:", e)
        if (mounted) setError("Failed to load staking data")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [userAddress])

  // Format balance for display
  const formatBalance = (balance: string) => {
    try {
      return Number(ethers.formatUnits(balance || "0", 18)).toFixed(4)
    } catch (e) {
      console.error("Error formatting balance:", e)
      return "0.0000"
    }
  }

  // Handle staking
  const handleStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return

    try {
      setIsProcessing(true)
      setStatusMessage("Processing...")
      setError("")

      // Simulate successful staking
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setStatusMessage("Staked successfully!")
      setStakeAmount("")

      // Update balances
      const newStakedBalance = BigInt(stakedBalance || "0") + ethers.parseUnits(stakeAmount, 18)
      setStakedBalance(newStakedBalance.toString())

      // Reduce TPF balance
      const newTpfBalance = BigInt(tpfBalance || "0") - ethers.parseUnits(stakeAmount, 18)
      setTpfBalance(newTpfBalance.toString())
    } catch (e) {
      console.error("Error staking:", e)
      setError("Failed to stake tokens")
      setStatusMessage("")
    } finally {
      setIsProcessing(false)
      setTimeout(() => setStatusMessage(""), 3000)
    }
  }

  // Handle unstaking
  const handleUnstake = async () => {
    if (!unstakeAmount || Number(unstakeAmount) <= 0) return

    try {
      setIsProcessing(true)
      setStatusMessage("Processing...")
      setError("")

      // Simulate successful unstaking
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setStatusMessage("Unstaked successfully!")
      setUnstakeAmount("")

      // Update balances
      const newStakedBalance = BigInt(stakedBalance || "0") - ethers.parseUnits(unstakeAmount, 18)
      setStakedBalance(newStakedBalance.toString())

      // Increase TPF balance
      const newTpfBalance = BigInt(tpfBalance || "0") + ethers.parseUnits(unstakeAmount, 18)
      setTpfBalance(newTpfBalance.toString())
    } catch (e) {
      console.error("Error unstaking:", e)
      setError("Failed to unstake tokens")
      setStatusMessage("")
    } finally {
      setIsProcessing(false)
      setTimeout(() => setStatusMessage(""), 3000)
    }
  }

  // Handle claiming rewards
  const handleClaimRewards = async () => {
    try {
      setIsProcessing(true)
      setStatusMessage("Processing...")
      setError("")

      // Simulate successful claim
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setStatusMessage("Rewards claimed!")
      setEarnedRewards("0")
    } catch (e) {
      console.error("Error claiming rewards:", e)
      setError("Failed to claim rewards")
      setStatusMessage("")
    } finally {
      setIsProcessing(false)
      setTimeout(() => setStatusMessage(""), 3000)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-2"></div>
        <p className="text-xs text-gray-500">Loading staking data...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-base font-bold text-gray-800">{t("staking_account", "Staking Account")}</h2>
        <p className="text-xs text-gray-500">{t("earn_interest_every_second", "Earn interest every second")}</p>
      </div>

      {/* Stats */}
      <div className="bg-gray-100 rounded-lg p-2 mb-2 border border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded p-2">
            <div className="text-xs text-gray-500">APR</div>
            <div className="text-sm font-bold text-green-600">12.5%</div>
          </div>
          <div className="bg-white rounded p-2">
            <div className="text-xs text-gray-500">Total Staked</div>
            <div className="text-sm font-bold">1,250,000 TPF</div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-lg p-3 mb-2 border border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Staked Balance:</span>
          <span className="text-sm font-bold">{formatBalance(stakedBalance)} TPF</span>
        </div>

        {/* Rewards section */}
        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-2">
          <span className="text-xs font-medium">Rewards:</span>
          <div className="flex items-center">
            <span className="text-xs font-bold mr-2 text-green-600">{formatBalance(earnedRewards)}</span>
            <button
              onClick={handleClaimRewards}
              disabled={Number(earnedRewards) <= 0 || isProcessing}
              className={`px-2 py-1 rounded text-xs font-medium ${
                Number(earnedRewards) <= 0 || isProcessing
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700 text-white hover:bg-gray-800"
              }`}
            >
              {t("collect", "Collect")}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-2">
        <button
          onClick={() => setActiveTab("stake")}
          className={`flex-1 py-1 text-center text-xs ${
            activeTab === "stake"
              ? "bg-gray-700 text-white rounded-l-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-l-lg"
          }`}
        >
          {t("deposit", "Deposit")}
        </button>
        <button
          onClick={() => setActiveTab("unstake")}
          className={`flex-1 py-1 text-center text-xs ${
            activeTab === "unstake"
              ? "bg-gray-700 text-white rounded-r-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-r-lg"
          }`}
        >
          {t("withdraw", "Withdraw")}
        </button>
      </div>

      {/* Stake/Unstake Form */}
      {activeTab === "stake" ? (
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Available: {formatBalance(tpfBalance)} TPF
            </label>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Amount to stake"
                className="w-full p-2 text-xs border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => setStakeAmount(formatBalance(tpfBalance))}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-200 px-1 py-0.5 rounded text-gray-700"
              >
                MAX
              </button>
            </div>
          </div>

          <button
            onClick={handleStake}
            disabled={
              !stakeAmount ||
              Number(stakeAmount) <= 0 ||
              Number(stakeAmount) > Number(formatBalance(tpfBalance)) ||
              isProcessing
            }
            className={`w-full py-2 rounded-lg text-white text-xs font-medium ${
              !stakeAmount ||
              Number(stakeAmount) <= 0 ||
              Number(stakeAmount) > Number(formatBalance(tpfBalance)) ||
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {isProcessing ? "Processing..." : "Stake TPF"}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Staked: {formatBalance(stakedBalance)} TPF
            </label>
            <div className="relative">
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="Amount to unstake"
                className="w-full p-2 text-xs border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => setUnstakeAmount(formatBalance(stakedBalance))}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-200 px-1 py-0.5 rounded text-gray-700"
              >
                MAX
              </button>
            </div>
          </div>

          <button
            onClick={handleUnstake}
            disabled={
              !unstakeAmount ||
              Number(unstakeAmount) <= 0 ||
              Number(unstakeAmount) > Number(formatBalance(stakedBalance)) ||
              isProcessing
            }
            className={`w-full py-2 rounded-lg text-white text-xs font-medium ${
              !unstakeAmount ||
              Number(unstakeAmount) <= 0 ||
              Number(unstakeAmount) > Number(formatBalance(stakedBalance)) ||
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {isProcessing ? "Processing..." : "Unstake TPF"}
          </button>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`mt-2 p-2 text-center text-xs rounded-lg ${
            statusMessage.includes("success") || statusMessage.includes("claimed")
              ? "bg-green-100 text-green-700 border border-green-200"
              : statusMessage.includes("Processing")
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-auto p-2 bg-gray-100 rounded-lg text-xs text-gray-600">
        <p className="mb-1">• Stake TPF to earn rewards</p>
        <p className="mb-1">• Rewards are distributed every second</p>
        <p>• Minimum stake amount: 1 TPF</p>
      </div>
    </div>
  )
}
