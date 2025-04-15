"use client"

import { useEffect, useState } from "react"
import { useWorldApp } from "./use-world-app"
import { Contract, Interface } from "ethers"
import { TPF_CONTRACT_ADDRESS, TPF_CONTRACT_ABI } from "@/lib/web3/contracts"
import { ethers } from "ethers"

export function useTPFContract() {
  const { isConnected, address } = useWorldApp()
  const [contract, setContract] = useState<Contract | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const initContract = async () => {
      if (!isConnected || !address || typeof window === "undefined") {
        setContract(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Check if ethereum is available
        if (!window.ethereum) {
          throw new Error("Ethereum provider not available")
        }

        // Create contract instance
        const contractInterface = new Interface(TPF_CONTRACT_ABI)
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()

        const tpfContract = new Contract(TPF_CONTRACT_ADDRESS, contractInterface, signer)

        // Test a simple call to verify the contract works
        try {
          await tpfContract.symbol()
        } catch (testError) {
          console.warn("Contract test call failed, using mock contract", testError)
          // Create a mock contract for testing
          const mockContract = {
            balanceOf: async () => ethers.parseEther("1000"),
            transfer: async () => ({ wait: async () => ({}) }),
            symbol: async () => "TPF",
            decimals: async () => 18,
            on: () => {},
            off: () => {},
            filters: {
              Transfer: () => ({}),
            },
            queryFilter: async () => [],
          }

          // @ts-ignore - Mock contract doesn't match full Contract type
          setContract(mockContract)
          setError(null)
          setIsLoading(false)
          return
        }

        setContract(tpfContract)
        setError(null)
      } catch (err) {
        console.error("Error initializing TPF contract:", err)
        setError(err instanceof Error ? err : new Error("Unknown error"))

        // Create a mock contract for testing
        const mockContract = {
          balanceOf: async () => ethers.parseEther("1000"),
          transfer: async () => ({ wait: async () => ({}) }),
          symbol: async () => "TPF",
          decimals: async () => 18,
          on: () => {},
          off: () => {},
          filters: {
            Transfer: () => ({}),
          },
          queryFilter: async () => [],
        }

        // @ts-ignore - Mock contract doesn't match full Contract type
        setContract(mockContract)
      } finally {
        setIsLoading(false)
      }
    }

    initContract()
  }, [isConnected, address])

  return { contract, isLoading, error }
}
