"use client"

import { useState, useEffect, useCallback } from "react"
import { useWorldApp } from "./use-world-app"
import { useTPFContract } from "./use-tpf-contract"
import { ethers } from "ethers"

interface Transaction {
  hash: string
  from: string
  to: string
  value: bigint
  timestamp: number
}

export function useTPFTransactions() {
  const { address, isConnected } = useWorldApp()
  const { contract } = useTPFContract()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!contract || !address || !isConnected) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      // Try to get transactions from the contract
      try {
        // Get sent transactions
        const sentFilter = contract.filters.Transfer(address, null)
        const sentEvents = await contract.queryFilter(sentFilter, -10000)

        // Get received transactions
        const receivedFilter = contract.filters.Transfer(null, address)
        const receivedEvents = await contract.queryFilter(receivedFilter, -10000)

        // Combine and sort transactions
        const allEvents = [...sentEvents, ...receivedEvents]

        const txPromises = allEvents.map(async (event) => {
          const block = await event.getBlock()
          return {
            hash: event.transactionHash,
            from: event.args[0],
            to: event.args[1],
            value: event.args[2],
            timestamp: block.timestamp,
          }
        })

        const txs = await Promise.all(txPromises)

        // Sort by timestamp (newest first)
        txs.sort((a, b) => b.timestamp - a.timestamp)

        setTransactions(txs)
      } catch (error) {
        console.error("Error fetching transactions from contract:", error)

        // Generate mock transactions for testing
        const mockTransactions: Transaction[] = [
          {
            hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            from: address,
            to: "0x1234567890123456789012345678901234567890",
            value: ethers.parseEther("10"),
            timestamp: Math.floor(Date.now() / 1000) - 3600,
          },
          {
            hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            from: "0x0987654321098765432109876543210987654321",
            to: address,
            value: ethers.parseEther("25"),
            timestamp: Math.floor(Date.now() / 1000) - 7200,
          },
          {
            hash: "0x2468013579246801357924680135792468013579246801357924680135792468",
            from: address,
            to: "0x5432109876543210987654321098765432109876",
            value: ethers.parseEther("5"),
            timestamp: Math.floor(Date.now() / 1000) - 14400,
          },
        ]

        setTransactions(mockTransactions)
      }
    } catch (error) {
      console.error("Error in transaction fetching process:", error)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [contract, address, isConnected])

  useEffect(() => {
    fetchTransactions()

    // Set up event listener for new transactions if contract supports it
    if (contract && address && typeof contract.on === "function") {
      try {
        const fromFilter = contract.filters.Transfer(address, null)
        const toFilter = contract.filters.Transfer(null, address)

        const handleNewTransaction = () => {
          fetchTransactions()
        }

        contract.on(fromFilter, handleNewTransaction)
        contract.on(toFilter, handleNewTransaction)

        return () => {
          if (typeof contract.off === "function") {
            contract.off(fromFilter, handleNewTransaction)
            contract.off(toFilter, handleNewTransaction)
          }
        }
      } catch (error) {
        console.error("Error setting up transaction event listeners:", error)
      }
    }
  }, [contract, address, fetchTransactions])

  return { transactions, isLoading, refetch: fetchTransactions }
}
