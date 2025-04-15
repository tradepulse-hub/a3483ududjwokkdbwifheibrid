"use client"

import type React from "react"

import { createContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createWalletClient, custom } from "viem"
import type { WalletClient, Chain } from "viem"

// Define custom chains
const worldChain: Chain = {
  id: 480,
  name: "World Chain",
  network: "worldchain",
  nativeCurrency: {
    decimals: 18,
    name: "World",
    symbol: "WLD",
  },
  rpcUrls: {
    default: {
      http: [`https://rpc.worldchain.io`],
    },
    public: {
      http: [`https://rpc.worldchain.io`],
    },
  },
  blockExplorers: {
    default: {
      name: "WorldScan",
      url: "https://worldscan.io",
    },
  },
}

const pulseChain: Chain = {
  id: 369,
  name: "PulseChain",
  network: "pulsechain",
  nativeCurrency: {
    decimals: 18,
    name: "Pulse",
    symbol: "PLS",
  },
  rpcUrls: {
    default: {
      http: [`https://rpc.pulsechain.com`],
    },
    public: {
      http: [`https://rpc.pulsechain.com`],
    },
  },
  blockExplorers: {
    default: {
      name: "PulseScan",
      url: "https://scan.pulsechain.com",
    },
  },
}

export interface WorldAppState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  client: WalletClient | null
  connect: () => Promise<void>
  disconnect: () => void
  switchChain: (chainId: number) => Promise<void>
  init: () => Promise<void>
}

export const WorldAppContext = createContext<WorldAppState | null>(null)

export function WorldAppProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [client, setClient] = useState<WalletClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const init = useCallback(async () => {
    // Check if World App is available
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Check if already connected
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
          const chainId = Number.parseInt(chainIdHex, 16)

          setAddress(accounts[0])
          setChainId(chainId)
          setIsConnected(true)

          // Create wallet client
          const client = createWalletClient({
            account: accounts[0],
            transport: custom(window.ethereum),
          })

          setClient(client)
        }
      } catch (error) {
        console.error("Error initializing World App:", error)
      }
    }
  }, [])

  const connect = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
        const chainId = Number.parseInt(chainIdHex, 16)

        setAddress(accounts[0])
        setChainId(chainId)
        setIsConnected(true)

        // Create wallet client
        const client = createWalletClient({
          account: accounts[0],
          transport: custom(window.ethereum),
        })

        setClient(client)
      } catch (error) {
        console.error("Error connecting to World App:", error)
        throw error
      }
    } else {
      console.error("World App not available")
      throw new Error("World App not available")
    }
  }, [])

  const disconnect = useCallback(() => {
    setIsConnected(false)
    setAddress(null)
    setChainId(null)
    setClient(null)
  }, [])

  const switchChain = useCallback(async (chainId: number) => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        })

        setChainId(chainId)
      } catch (error: any) {
        // If the chain is not added to World App, add it
        if (error.code === 4902) {
          try {
            const chain = chainId === 480 ? worldChain : pulseChain

            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${chainId.toString(16)}`,
                  chainName: chain.name,
                  nativeCurrency: chain.nativeCurrency,
                  rpcUrls: [chain.rpcUrls.default.http[0]],
                  blockExplorerUrls: [chain.blockExplorers?.default.url],
                },
              ],
            })

            setChainId(chainId)
          } catch (addError) {
            console.error("Error adding chain to World App:", addError)
            throw addError
          }
        } else {
          console.error("Error switching chain:", error)
          throw error
        }
      }
    }
  }, [])

  // Initialize World App connection
  useEffect(() => {
    const initializeWorldApp = async () => {
      try {
        await init()
      } catch (error) {
        console.error("Failed to initialize World App:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeWorldApp()
  }, [init])

  // Redirect to dashboard if connected
  useEffect(() => {
    if (isConnected && router && window.location.pathname === "/") {
      router.push("/dashboard")
    }
  }, [isConnected, router])

  const worldAppState: WorldAppState = {
    isConnected,
    address,
    chainId,
    client,
    connect,
    disconnect,
    switchChain,
    init,
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return <WorldAppContext.Provider value={worldAppState}>{children}</WorldAppContext.Provider>
}
