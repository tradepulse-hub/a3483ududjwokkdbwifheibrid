"use client"

import { useState, useEffect, useRef } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { ethers } from "ethers"
import { useLanguage } from "@/lib/languageContext"
import { TPF_TOKEN_ADDRESS } from "@/lib/constants"

// Staking contract address
const STAKING_CONTRACT_ADDRESS = "0xb4b2f053031FC05aDBC858CA721185994e3c041B"

// ERC20 ABI for TPF token
const TPF_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
]

export function Staking({ userAddress }: { userAddress: string }) {
  console.log("STAKING COMPONENT RENDERING", { userAddress })
  const { t } = useLanguage()
  const componentRef = useRef<HTMLDivElement>(null)

  // State for balances and amounts
  const [tpfBalance, setTpfBalance] = useState<string>("0")
  const [stakedBalance, setStakedBalance] = useState<string>("0")
  const [earnedRewards, setEarnedRewards] = useState<string>("0")
  const [stakeAmount, setStakeAmount] = useState<string>("")
  const [unstakeAmount, setUnstakeAmount] = useState<string>("")

  // UI state
  const [activeTab, setActiveTab] = useState<"stake" | "unstake" | "rewards">("stake")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [isUnstaking, setIsUnstaking] = useState<boolean>(false)
  const [isClaiming, setIsClaiming] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [visibilityCount, setVisibilityCount] = useState<number>(0)

  // Log when component mounts and unmounts to debug visibility issues
  useEffect(() => {
    console.log("STAKING COMPONENT MOUNTED")

    // Add a periodic console log to check if component is still rendered
    const interval = setInterval(() => {
      console.log("STAKING COMPONENT STILL MOUNTED", {
        visibilityCount,
        isComponentVisible: componentRef.current !== null,
        componentRect: componentRef.current?.getBoundingClientRect(),
      })
      setVisibilityCount((prev) => prev + 1)
    }, 2000)

    return () => {
      console.log("STAKING COMPONENT UNMOUNTED")
      clearInterval(interval)
    }
  }, [visibilityCount])

  // Fetch balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!userAddress) return
      console.log("FETCHING BALANCES FOR", userAddress)

      setIsLoading(true)
      setError(null)

      try {
        // Fetch TPF balance
        const tpfResponse = await fetch(`/api/token-balance?address=${userAddress}`)
        const tpfData = await tpfResponse.json()
        console.log("TPF BALANCE RESPONSE:", tpfData)

        if (tpfData.error) {
          console.error("Error fetching TPF balance:", tpfData.error)
          setError("Failed to fetch TPF balance")
        } else {
          // Format balance with 2 decimal places
          const formattedBalance = tpfData.balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          setTpfBalance(formattedBalance)
        }

        // Fetch staked balance
        try {
          // For now, we'll use a simulated value
          // In a real implementation, this would call the staking contract
          const stakedAmount = Math.random() * 500
          const formattedStaked = stakedAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          setStakedBalance(formattedStaked)

          // Simulate earned rewards
          const rewardsAmount = stakedAmount * 0.05
          const formattedRewards = rewardsAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          setEarnedRewards(formattedRewards)
        } catch (err) {
          console.error("Error fetching staking data:", err)
          setError("Failed to fetch staking data")
        }
      } catch (err) {
        console.error("Error in fetchBalances:", err)
        setError("Failed to fetch balances")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()

    // Refresh every 30 seconds
    const interval = setInterval(fetchBalances, 30000)
    return () => clearInterval(interval)
  }, [userAddress, refreshTrigger])

  // Handle staking
  const handleStake = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (Number.parseFloat(stakeAmount) > Number.parseFloat(tpfBalance.replace(/,/g, ""))) {
      setError("Insufficient balance")
      return
    }

    setIsStaking(true)
    setError(null)
    setSuccess(null)
    setTxHash(null)

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // First approve the staking contract to spend tokens
      const amountInWei = ethers.parseUnits(stakeAmount, 18).toString()

      // Approve transaction
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
        throw new Error(
          approveResponse.finalPayload.message ||
            approveResponse.finalPayload.description ||
            "Failed to approve tokens",
        )
      }

      // Wait a bit for the approval to be processed
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Now stake the tokens
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
        throw new Error(
          stakeResponse.finalPayload.message || stakeResponse.finalPayload.description || "Failed to stake tokens",
        )
      }

      setSuccess("Successfully staked tokens!")
      setTxHash(stakeResponse.finalPayload.transaction_id || null)
      setStakeAmount("")

      // Refresh balances
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Error staking tokens:", err)
      setError(err instanceof Error ? err.message : "Failed to stake tokens")
    } finally {
      setIsStaking(false)
    }
  }

  // Handle unstaking
  const handleUnstake = async () => {
    if (!unstakeAmount || Number.parseFloat(unstakeAmount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (Number.parseFloat(unstakeAmount) > Number.parseFloat(stakedBalance.replace(/,/g, ""))) {
      setError("Insufficient staked balance")
      return
    }

    setIsUnstaking(true)
    setError(null)
    setSuccess(null)
    setTxHash(null)

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      const amountInWei = ethers.parseUnits(unstakeAmount, 18).toString()

      // Unstake transaction
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
        throw new Error(
          unstakeResponse.finalPayload.message ||
            unstakeResponse.finalPayload.description ||
            "Failed to unstake tokens",
        )
      }

      setSuccess("Successfully unstaked tokens!")
      setTxHash(unstakeResponse.finalPayload.transaction_id || null)
      setUnstakeAmount("")

      // Refresh balances
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Error unstaking tokens:", err)
      setError(err instanceof Error ? err.message : "Failed to unstake tokens")
    } finally {
      setIsUnstaking(false)
    }
  }

  // Handle claiming rewards
  const handleClaimRewards = async () => {
    setIsClaiming(true)
    setError(null)
    setSuccess(null)
    setTxHash(null)

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // Claim rewards transaction
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
        throw new Error(
          claimResponse.finalPayload.message || claimResponse.finalPayload.description || "Failed to claim rewards",
        )
      }

      setSuccess("Successfully claimed rewards!")
      setTxHash(claimResponse.finalPayload.transaction_id || null)

      // Refresh balances
      setRefreshTrigger((prev) => prev + 1)
    } catch (err) {
      console.error("Error claiming rewards:", err)
      setError(err instanceof Error ? err.message : "Failed to claim rewards")
    } finally {
      setIsClaiming(false)
    }
  }

  // Set max amount
  const setMaxStakeAmount = () => {
    setStakeAmount(tpfBalance.replace(/,/g, ""))
  }

  const setMaxUnstakeAmount = () => {
    setUnstakeAmount(stakedBalance.replace(/,/g, ""))
  }

  return (
    <div
      ref={componentRef}
      className="bg-white rounded-lg border border-gray-200 shadow-md h-full overflow-hidden flex flex-col"
      style={{
        position: "relative",
        minHeight: "300px",
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 text-white">
        <h2 className="text-xl font-bold text-center">{t("staking_account", "Staking Account")}</h2>
        <p className="text-sm text-center text-gray-300">
          {t("earn_interest_every_second", "Earn interest every second")}
        </p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 border-b border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500">{t("available_balance", "Available Balance")}</p>
          <p className="text-sm font-bold">{tpfBalance} TPF</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">{t("staked_balance", "Staked Balance")}</p>
          <p className="text-sm font-bold">{stakedBalance} TPF</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">{t("rewards", "Rewards")}</p>
          <p className="text-sm font-bold text-green-600">{earnedRewards} TPF</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === "stake" ? "text-gray-800 border-b-2 border-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("stake")}
        >
          {t("deposit", "Deposit")}
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === "unstake" ? "text-gray-800 border-b-2 border-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("unstake")}
        >
          {t("withdraw", "Withdraw")}
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === "rewards" ? "text-gray-800 border-b-2 border-gray-800" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("rewards")}
        >
          {t("rewards", "Rewards")}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-auto">
        {/* Error and success messages */}
        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg mb-3 border border-red-200">{error}</div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 text-xs p-2 rounded-lg mb-3 border border-green-200">
            {success}
            {txHash && (
              <div className="mt-1">
                <a
                  href={`https://worldscan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-[10px]"
                >
                  {t("view_on_worldscan", "View on WorldScan")}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Stake tab */}
        {activeTab === "stake" && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("amount_to_stake", "Amount to stake")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={setMaxStakeAmount}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
                  >
                    {t("max", "MAX")}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount || Number.parseFloat(stakeAmount) <= 0}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                isStaking || !stakeAmount || Number.parseFloat(stakeAmount) <= 0
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-lg hover:shadow-gray-500/20"
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
                t("stake_tpf", "Stake TPF")
              )}
            </button>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-700 mb-2">
                {t("staking_info_1", "Stake TPF to earn rewards")}
              </h4>
              <ul className="text-xs text-blue-600 space-y-1 list-disc pl-4">
                <li>{t("staking_info_2", "Rewards are distributed every second")}</li>
                <li>{t("staking_info_3", "Minimum stake amount: 1 TPF")}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Unstake tab */}
        {activeTab === "unstake" && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("amount_to_unstake", "Amount to unstake")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={setMaxUnstakeAmount}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
                  >
                    {t("max", "MAX")}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleUnstake}
              disabled={isUnstaking || !unstakeAmount || Number.parseFloat(unstakeAmount) <= 0}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                isUnstaking || !unstakeAmount || Number.parseFloat(unstakeAmount) <= 0
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-lg hover:shadow-gray-500/20"
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
                t("unstake_tpf", "Unstake TPF")
              )}
            </button>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700">
                {t(
                  "unstaking_warning",
                  "You can unstake your TPF tokens at any time. Unstaking will not claim your pending rewards.",
                )}
              </p>
            </div>
          </div>
        )}

        {/* Rewards tab */}
        {activeTab === "rewards" && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium text-green-700 mb-2">{t("earned_rewards", "Earned Rewards")}</h3>
              <p className="text-2xl font-bold text-green-600">{earnedRewards} TPF</p>
            </div>

            <button
              onClick={handleClaimRewards}
              disabled={isClaiming || Number.parseFloat(earnedRewards.replace(/,/g, "")) <= 0}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                isClaiming || Number.parseFloat(earnedRewards.replace(/,/g, "")) <= 0
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/20"
              }`}
            >
              {isClaiming ? (
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
                  {t("collecting", "Collecting...")}
                </div>
              ) : (
                t("collect", "Collect")
              )}
            </button>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                {t(
                  "rewards_info",
                  "Rewards are calculated based on your staked amount and the time you've been staking. Claim your rewards at any time.",
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
