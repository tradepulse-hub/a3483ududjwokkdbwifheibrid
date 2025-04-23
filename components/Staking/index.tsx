"use client"

import { useState, useCallback } from "react"
import { useLanguage } from "@/lib/languageContext"
import Image from "next/image"

// Extremely simplified component to ensure it renders properly
export function Staking({ userAddress }: { userAddress: string }) {
  const { t } = useLanguage()
  const [tpfBalance, setTpfBalance] = useState("1000.00")
  const [stakedBalance, setStakedBalance] = useState("500.00")
  const [rewards, setRewards] = useState("25.50")
  const [stakeAmount, setStakeAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState("")

  // Simple function to simulate staking
  const handleStake = useCallback(() => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) {
      setMessage("Please enter a valid amount")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    setIsProcessing(true)
    setMessage("Processing...")

    // Simulate transaction delay
    setTimeout(() => {
      const amount = Number.parseFloat(stakeAmount)
      setStakedBalance((prev) => (Number.parseFloat(prev) + amount).toFixed(2))
      setTpfBalance((prev) => (Number.parseFloat(prev) - amount).toFixed(2))
      setStakeAmount("")
      setMessage("Successfully staked!")
      setIsProcessing(false)

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000)
    }, 1500)
  }, [stakeAmount])

  // Simple function to simulate claiming rewards
  const handleClaimRewards = useCallback(() => {
    if (Number.parseFloat(rewards) <= 0) return

    setIsProcessing(true)
    setMessage("Claiming rewards...")

    // Simulate transaction delay
    setTimeout(() => {
      setTpfBalance((prev) => (Number.parseFloat(prev) + Number.parseFloat(rewards)).toFixed(2))
      setRewards("0.00")
      setMessage("Rewards claimed!")
      setIsProcessing(false)

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000)
    }, 1500)
  }, [rewards])

  return (
    <div className="flex flex-col h-full p-2">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Staking</h2>
        <p className="text-xs text-gray-500">Stake TPF to earn rewards</p>
      </div>

      {/* Balances */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 mr-2 flex items-center justify-center">
              <Image src="/images/tpf-logo.png" alt="TPF" width={24} height={24} className="rounded-full" />
            </div>
            <div>
              <div className="text-sm font-medium">TPF Balance</div>
              <div className="text-lg font-bold">{tpfBalance}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 mr-2 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.5l-1.8-1.8A2 2 0 0012.2 2H7.8a2 2 0 00-1.4.6L4.5 4H4zm7 5a3 3 0 100 6 3 3 0 000-6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium">Staked Balance</div>
              <div className="text-lg font-bold">{stakedBalance}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 mr-2 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                <path d="M10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium">Rewards</div>
              <div className="text-lg font-bold text-green-600">{rewards}</div>
            </div>
          </div>
          <button
            onClick={handleClaimRewards}
            disabled={Number.parseFloat(rewards) <= 0 || isProcessing}
            className={`px-3 py-1 rounded-lg text-white text-xs ${
              Number.parseFloat(rewards) <= 0 || isProcessing ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Claim
          </button>
        </div>
      </div>

      {/* Staking Form */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Stake</label>
          <div className="relative">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-2 pr-16 border border-gray-300 rounded-lg"
              disabled={isProcessing}
            />
            <button
              onClick={() => setStakeAmount(tpfBalance)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
              disabled={isProcessing}
            >
              MAX
            </button>
          </div>
        </div>

        <button
          onClick={handleStake}
          disabled={
            !stakeAmount ||
            Number.parseFloat(stakeAmount) <= 0 ||
            Number.parseFloat(stakeAmount) > Number.parseFloat(tpfBalance) ||
            isProcessing
          }
          className={`w-full py-2 rounded-lg text-white font-medium ${
            !stakeAmount ||
            Number.parseFloat(stakeAmount) <= 0 ||
            Number.parseFloat(stakeAmount) > Number.parseFloat(tpfBalance) ||
            isProcessing
              ? "bg-gray-400"
              : "bg-gray-700 hover:bg-gray-800"
          }`}
        >
          {isProcessing ? "Processing..." : "Stake TPF"}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-2 rounded-lg text-center text-sm ${
            message.includes("Success") || message.includes("claimed")
              ? "bg-green-100 text-green-700"
              : message.includes("Processing")
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-auto bg-gray-100 rounded-lg p-3 text-xs text-gray-600">
        <p className="mb-1">• Stake TPF to earn rewards</p>
        <p className="mb-1">• APR: 12.5%</p>
        <p>• No lock-up period, unstake anytime</p>
      </div>
    </div>
  )
}
