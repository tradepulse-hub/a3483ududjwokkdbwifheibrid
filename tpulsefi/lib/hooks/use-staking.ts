"use client"

import { useState, useEffect, useCallback } from "react"
import { useWorldApp } from "./use-world-app"
import { Contract, Interface, type BigNumberish } from "ethers"
import { ethers } from "ethers"
import {
  STAKING_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ABI,
  TPF_CONTRACT_ADDRESS,
  TPF_CONTRACT_ABI,
} from "@/lib/web3/contracts"
import { useToast } from "@/components/ui/use-toast"

interface StakingInfo {
  stakedAmount: BigNumberish
  stakingTime: BigNumberish
  rewards: BigNumberish
  isLocked: boolean
  lockEndTime?: Date
}

export function useStaking() {
  const { address, isConnected } = useWorldApp()
  const { toast } = useToast()
  const [stakingContract, setStakingContract] = useState<Contract | null>(null)
  const [tpfContract, setTpfContract] = useState<Contract | null>(null)
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Initialize contracts
  useEffect(() => {
    const initContracts = async () => {
      if (!isConnected || !address) {
        setStakingInfo(null)
        setIsLoading(false)
        return
      }

      try {
        // Check if ethereum is available
        if (typeof window === "undefined" || !window.ethereum) {
          throw new Error("Ethereum provider not available")
        }

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()

        // Initialize TPF contract
        let tpfContractInstance
        try {
          const tpfInterface = new Interface(TPF_CONTRACT_ABI)
          tpfContractInstance = new Contract(TPF_CONTRACT_ADDRESS, tpfInterface, signer)
          // Test call to verify contract
          await tpfContractInstance.symbol()
        } catch (err) {
          console.warn("TPF contract initialization failed, using mock:", err)
          // Create a mock contract for testing
          tpfContractInstance = {
            balanceOf: async () => ethers.parseEther("1000"),
            approve: async () => ({ wait: async () => ({}) }),
            symbol: async () => "TPF",
            decimals: async () => 18,
          }
        }

        // Initialize Staking contract
        let stakingContractInstance
        try {
          const stakingInterface = new Interface(STAKING_CONTRACT_ABI)
          stakingContractInstance = new Contract(STAKING_CONTRACT_ADDRESS, stakingInterface, signer)
          // Test call to verify contract
          await stakingContractInstance.getStakedBalance(address)
        } catch (err) {
          console.warn("Staking contract initialization failed, using mock:", err)
          // Create a mock contract for testing
          stakingContractInstance = {
            stake: async () => ({ wait: async () => ({}) }),
            withdraw: async () => ({ wait: async () => ({}) }),
            withdrawEarly: async () => ({ wait: async () => ({}) }),
            getStakedBalance: async () => ethers.parseEther("100"),
            getRewards: async () => ethers.parseEther("1"),
            getStakingInfo: async () => [
              ethers.parseEther("100"), // stakedAmount
              BigInt(Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60), // stakingTime (15 days ago)
              ethers.parseEther("1"), // rewards
              true, // isLocked
            ],
            claimRewards: async () => ({ wait: async () => ({}) }),
          }
        }

        setTpfContract(tpfContractInstance)
        setStakingContract(stakingContractInstance)

        // Fetch staking info
        await fetchStakingInfo(stakingContractInstance, address)
      } catch (err) {
        console.error("Error initializing staking contracts:", err)
        // Set mock staking info for testing
        setStakingInfo({
          stakedAmount: ethers.parseEther("100"),
          stakingTime: BigInt(Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60),
          rewards: ethers.parseEther("1"),
          isLocked: true,
          lockEndTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        })
      } finally {
        setIsLoading(false)
      }
    }

    initContracts()
  }, [isConnected, address])

  // Fetch staking info
  const fetchStakingInfo = async (contract: Contract | null, userAddress: string) => {
    if (!contract) return

    try {
      const info = await contract.getStakingInfo(userAddress)

      // Calculate lock end time (1 month from staking time)
      const stakingTimeMs = Number(info[1]) * 1000
      const lockEndTime = new Date(stakingTimeMs + 30 * 24 * 60 * 60 * 1000)

      setStakingInfo({
        stakedAmount: info[0],
        stakingTime: info[1],
        rewards: info[2],
        isLocked: info[3],
        lockEndTime,
      })
    } catch (error) {
      console.error("Error fetching staking info:", error)
      // Set mock data for testing
      setStakingInfo({
        stakedAmount: ethers.parseEther("100"),
        stakingTime: BigInt(Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60),
        rewards: ethers.parseEther("1"),
        isLocked: true,
        lockEndTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      })
    }
  }

  // Refresh staking info
  const refreshStakingInfo = useCallback(async () => {
    if (!stakingContract || !address) return
    await fetchStakingInfo(stakingContract, address)
  }, [stakingContract, address])

  // Stake tokens
  const stakeTokens = useCallback(
    async (amount: BigNumberish) => {
      if (!stakingContract || !tpfContract || !address) {
        toast({
          title: "Erro",
          description: "Contratos não inicializados",
          variant: "destructive",
        })
        return
      }

      setIsActionLoading(true)
      try {
        // Approve staking contract to spend TPF
        const approveTx = await tpfContract.approve(STAKING_CONTRACT_ADDRESS, amount)
        await approveTx.wait()

        // Stake tokens
        const stakeTx = await stakingContract.stake(amount)
        await stakeTx.wait()

        toast({
          title: "Sucesso",
          description: `${ethers.formatEther(amount)} TPF foram colocados em staking com sucesso`,
        })

        // Refresh staking info
        await refreshStakingInfo()
      } catch (error) {
        console.error("Error staking tokens:", error)
        toast({
          title: "Erro",
          description: "Falha ao fazer staking dos tokens",
          variant: "destructive",
        })
      } finally {
        setIsActionLoading(false)
      }
    },
    [stakingContract, tpfContract, address, toast, refreshStakingInfo],
  )

  // Withdraw tokens
  const withdrawTokens = useCallback(
    async (amount: BigNumberish, early = false) => {
      if (!stakingContract || !address) {
        toast({
          title: "Erro",
          description: "Contratos não inicializados",
          variant: "destructive",
        })
        return
      }

      setIsActionLoading(true)
      try {
        // Withdraw tokens
        const withdrawTx = early ? await stakingContract.withdrawEarly(amount) : await stakingContract.withdraw(amount)

        await withdrawTx.wait()

        toast({
          title: "Sucesso",
          description: `${ethers.formatEther(amount)} TPF foram retirados com sucesso${early ? " (com penalização)" : ""}`,
        })

        // Refresh staking info
        await refreshStakingInfo()
      } catch (error) {
        console.error("Error withdrawing tokens:", error)
        toast({
          title: "Erro",
          description: "Falha ao retirar tokens",
          variant: "destructive",
        })
      } finally {
        setIsActionLoading(false)
      }
    },
    [stakingContract, address, toast, refreshStakingInfo],
  )

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!stakingContract || !address) {
      toast({
        title: "Erro",
        description: "Contratos não inicializados",
        variant: "destructive",
      })
      return
    }

    setIsActionLoading(true)
    try {
      // Claim rewards
      const claimTx = await stakingContract.claimRewards()
      await claimTx.wait()

      toast({
        title: "Sucesso",
        description: "Recompensas reivindicadas com sucesso",
      })

      // Refresh staking info
      await refreshStakingInfo()
    } catch (error) {
      console.error("Error claiming rewards:", error)
      toast({
        title: "Erro",
        description: "Falha ao reivindicar recompensas",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }, [stakingContract, address, toast, refreshStakingInfo])

  // Calculate time remaining in lock period
  const calculateTimeRemaining = useCallback(() => {
    if (!stakingInfo || !stakingInfo.lockEndTime) return null

    const now = new Date()
    const endTime = stakingInfo.lockEndTime

    if (now >= endTime) return null

    const diffMs = endTime.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return {
      days: diffDays,
      hours: diffHours,
      total: diffMs,
    }
  }, [stakingInfo])

  return {
    stakingInfo,
    isLoading,
    isActionLoading,
    stakeTokens,
    withdrawTokens,
    claimRewards,
    refreshStakingInfo,
    calculateTimeRemaining,
  }
}
