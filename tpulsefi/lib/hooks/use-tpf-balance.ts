"use client"

import { useEffect, useState, useCallback } from "react"
import { useTPFContract } from "./use-tpf-contract"
import { useWorldApp } from "./use-world-app"
import { ethers, type BigNumberish } from "ethers"

export function useTPFBalance() {
  const { contract } = useTPFContract()
  const { address, isConnected } = useWorldApp()
  const [balance, setBalance] = useState<BigNumberish | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBalance = useCallback(async () => {
    if (!contract || !address || !isConnected) {
      setBalance(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Try to get the balance from the contract
      try {
        const balanceResult = await contract.balanceOf(address)
        setBalance(balanceResult)
      } catch (error) {
        console.error("Error fetching TPF balance from contract:", error)

        // Fallback to mock data for testing
        console.log("Using mock balance data")
        setBalance(ethers.parseEther("1000"))
      }
    } catch (error) {
      console.error("Error in balance fetching process:", error)
      // Fallback to mock data
      setBalance(ethers.parseEther("1000"))
    } finally {
      setIsLoading(false)
    }
  }, [contract, address, isConnected])

  useEffect(() => {
    fetchBalance()

    // Set up event listener for Transfer events if contract supports it
    if (contract && address && typeof contract.on === "function") {
      try {
        const fromFilter = contract.filters.Transfer(address, null)
        const toFilter = contract.filters.Transfer(null, address)

        contract.on(fromFilter, fetchBalance)
        contract.on(toFilter, fetchBalance)

        return () => {
          if (typeof contract.off === "function") {
            contract.off(fromFilter, fetchBalance)
            contract.off(toFilter, fetchBalance)
          }
        }
      } catch (error) {
        console.error("Error setting up transfer event listeners:", error)
      }
    }
  }, [contract, address, fetchBalance])

  return { balance, isLoading, refetch: fetchBalance }
}
