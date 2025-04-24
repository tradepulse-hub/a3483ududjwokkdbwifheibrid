"use client"

import { useState, useEffect } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import { ethers } from "ethers"
import { useLanguage } from "@/lib/languageContext"
import Image from "next/image"

// Token addresses
const TOKEN_ADDRESSES = {
  WLD: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
  TPF: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
  DNA: "0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113",
  CASH: "0xbfdA4F50a2d5B9b864511579D7dfa1C72f118575",
  WDD: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B",
}

// Token info
const TOKENS = [
  {
    symbol: "WLD",
    name: "WorldCoin",
    logo: "/images/worldcoin-logo.jpeg",
    address: TOKEN_ADDRESSES.WLD,
    verified: true,
    decimals: 18,
  },
  {
    symbol: "TPF",
    name: "TPulseFi",
    logo: "/images/tpf-logo-new.png",
    address: TOKEN_ADDRESSES.TPF,
    verified: true,
    decimals: 18,
  },
  {
    symbol: "DNA",
    name: "DNA Token",
    logo: "/images/dna-token-logo.png",
    address: TOKEN_ADDRESSES.DNA,
    verified: true,
    decimals: 18,
  },
  {
    symbol: "CASH",
    name: "Cash",
    logo: "/images/cash-logo.png",
    address: TOKEN_ADDRESSES.CASH,
    verified: false,
    decimals: 18,
  },
  {
    symbol: "WDD",
    name: "Drachma",
    logo: "/images/drachma-logo.png",
    address: TOKEN_ADDRESSES.WDD,
    verified: false,
    decimals: 18,
  },
]

// ERC20 ABI for token interactions
const ERC20_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
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
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// Mock exchange rates between tokens (in a real app, these would come from an API or smart contract)
const EXCHANGE_RATES = {
  WLD: {
    TPF: 187.5, // 1 WLD = 187.5 TPF
    DNA: 9.4, // 1 WLD = 9.4 DNA
    CASH: 23.5, // 1 WLD = 23.5 CASH
    WDD: 47.0, // 1 WLD = 47.0 WDD
  },
  TPF: {
    WLD: 0.00533, // 1 TPF = 0.00533 WLD
    DNA: 0.05, // 1 TPF = 0.05 DNA
    CASH: 0.125, // 1 TPF = 0.125 CASH
    WDD: 0.25, // 1 TPF = 0.25 WDD
  },
  DNA: {
    WLD: 0.1064, // 1 DNA = 0.1064 WLD
    TPF: 20.0, // 1 DNA = 20.0 TPF
    CASH: 2.5, // 1 DNA = 2.5 CASH
    WDD: 5.0, // 1 DNA = 5.0 WDD
  },
  CASH: {
    WLD: 0.0426, // 1 CASH = 0.0426 WLD
    TPF: 8.0, // 1 CASH = 8.0 TPF
    DNA: 0.4, // 1 CASH = 0.4 DNA
    WDD: 2.0, // 1 CASH = 2.0 WDD
  },
  WDD: {
    WLD: 0.0213, // 1 WDD = 0.0213 WLD
    TPF: 4.0, // 1 WDD = 4.0 TPF
    DNA: 0.2, // 1 WDD = 0.2 DNA
    CASH: 0.5, // 1 WDD = 0.5 CASH
  },
}

type TokenBalance = {
  symbol: string
  balance: string
  loading: boolean
  error?: string
}

type SwapProps = {
  userAddress: string
}

export default function Swap({ userAddress }: SwapProps) {
  const { t } = useLanguage()
  const [fromToken, setFromToken] = useState(TOKENS[0]) // Default: WLD
  const [toToken, setToToken] = useState(TOKENS[1]) // Default: TPF
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [showFromTokenSelector, setShowFromTokenSelector] = useState(false)
  const [showToTokenSelector, setShowToTokenSelector] = useState(false)

  // Fetch token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!userAddress) return

      // Initialize balances with loading state
      setBalances(
        TOKENS.map((token) => ({
          symbol: token.symbol,
          balance: "0",
          loading: true,
        })),
      )

      try {
        const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

        // Fetch balances for each token
        const balancePromises = TOKENS.map(async (token) => {
          try {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
            const balance = await tokenContract.balanceOf(userAddress)
            const formattedBalance = ethers.formatUnits(balance, token.decimals)

            return {
              symbol: token.symbol,
              balance: Number(formattedBalance).toFixed(4),
              loading: false,
            }
          } catch (err) {
            console.error(`Error fetching ${token.symbol} balance:`, err)
            return {
              symbol: token.symbol,
              balance: "0",
              loading: false,
              error: `Failed to fetch ${token.symbol} balance`,
            }
          }
        })

        const newBalances = await Promise.all(balancePromises)
        setBalances(newBalances)
      } catch (err) {
        console.error("Error fetching balances:", err)
        setError("Failed to fetch token balances")
      }
    }

    if (userAddress) {
      fetchBalances()
    }
  }, [userAddress, success])

  // Calculate to amount when from amount or tokens change
  useEffect(() => {
    if (!fromAmount || isNaN(Number(fromAmount))) {
      setToAmount("")
      return
    }

    // Get exchange rate
    const rate = EXCHANGE_RATES[fromToken.symbol][toToken.symbol]
    if (!rate) {
      setToAmount("")
      return
    }

    // Calculate to amount
    const calculatedToAmount = Number(fromAmount) * rate
    setToAmount(calculatedToAmount.toFixed(6))
  }, [fromAmount, fromToken, toToken])

  // Handle token swap
  const handleSwap = async () => {
    if (!userAddress || !fromAmount || !toAmount) {
      setError("Please enter an amount to swap")
      return
    }

    if (Number(fromAmount) <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    const fromBalance = balances.find((b) => b.symbol === fromToken.symbol)?.balance || "0"
    if (Number(fromAmount) > Number(fromBalance)) {
      setError(`Insufficient ${fromToken.symbol} balance`)
      return
    }

    setIsSwapping(true)
    setError(null)
    setSuccess(null)
    setTxHash(null)

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error("MiniKit is not installed")
      }

      // In a real app, this would be a call to a swap contract
      // For this demo, we'll simulate a swap by transferring tokens to a mock address

      // Convert amount to wei
      const amountInWei = ethers.parseUnits(fromAmount, fromToken.decimals).toString()

      // Mock recipient address (in a real app, this would be the swap contract)
      const mockRecipientAddress = "0x000000000000000000000000000000000000dEaD"

      console.log(`Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`)
      console.log(`Amount in wei: ${amountInWei}`)

      // Send transaction
      const response = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: fromToken.address,
            abi: [
              {
                inputs: [
                  { name: "recipient", type: "address" },
                  { name: "amount", type: "uint256" },
                ],
                name: "transfer",
                outputs: [{ name: "", type: "bool" }],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "transfer",
            args: [mockRecipientAddress, amountInWei],
          },
        ],
      })

      if (response.finalPayload.status === "error") {
        throw new Error(response.finalPayload.message || "Transaction failed")
      }

      setSuccess(`Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`)
      setTxHash(response.finalPayload.transaction_id || null)

      // Reset form
      setFromAmount("")
      setToAmount("")

      // Refresh balances after a short delay
      setTimeout(() => {
        const fetchBalances = async () => {
          try {
            const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

            // Fetch balances for each token
            const balancePromises = TOKENS.map(async (token) => {
              try {
                const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
                const balance = await tokenContract.balanceOf(userAddress)
                const formattedBalance = ethers.formatUnits(balance, token.decimals)

                return {
                  symbol: token.symbol,
                  balance: Number(formattedBalance).toFixed(4),
                  loading: false,
                }
              } catch (err) {
                return {
                  symbol: token.symbol,
                  balance: "0",
                  loading: false,
                  error: `Failed to fetch ${token.symbol} balance`,
                }
              }
            })

            const newBalances = await Promise.all(balancePromises)
            setBalances(newBalances)
          } catch (err) {
            console.error("Error refreshing balances:", err)
          }
        }

        fetchBalances()
      }, 3000)
    } catch (err) {
      console.error("Error swapping tokens:", err)
      setError(err instanceof Error ? err.message : "Failed to swap tokens")
    } finally {
      setIsSwapping(false)
    }
  }

  // Swap tokens
  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    // toAmount will be recalculated by the effect
  }

  // Set max amount
  const handleSetMaxAmount = () => {
    const balance = balances.find((b) => b.symbol === fromToken.symbol)?.balance || "0"
    setFromAmount(balance)
  }

  // Get token balance
  const getTokenBalance = (symbol: string) => {
    const balance = balances.find((b) => b.symbol === symbol)
    if (balance?.loading) return "Loading..."
    return balance?.balance || "0"
  }

  // Token selector
  const TokenSelector = ({ isFrom }: { isFrom: boolean }) => {
    const currentToken = isFrom ? fromToken : toToken
    const otherToken = isFrom ? toToken : fromToken
    const setToken = isFrom ? setFromToken : setToToken
    const showSelector = isFrom ? showFromTokenSelector : showToTokenSelector
    const setShowSelector = isFrom ? setShowFromTokenSelector : setShowToTokenSelector

    return (
      <div className="relative">
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1 transition-colors"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden">
            <Image
              src={currentToken.logo || "/placeholder.svg"}
              alt={currentToken.symbol}
              width={20}
              height={20}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs font-medium">{currentToken.symbol}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3 w-3 transition-transform ${showSelector ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSelector && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="p-1">
              {TOKENS.filter((token) => token.symbol !== otherToken.symbol).map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    setToken(token)
                    setShowSelector(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src={token.logo || "/placeholder.svg"}
                      alt={token.symbol}
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium">{token.symbol}</div>
                    <div className="text-[10px] text-gray-500">{token.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-3 text-white rounded-t-lg">
        <h2 className="text-lg font-bold text-center">Token Swap</h2>
        <p className="text-xs text-center text-gray-300">Swap between WLD, TPF, DNA, CASH, and WDD</p>
      </div>

      <div className="flex-1 p-3 bg-white rounded-b-lg overflow-auto">
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
                  View on WorldScan
                </a>
              </div>
            )}
          </div>
        )}

        {/* From token */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-gray-700">From</label>
            <div className="text-[10px] text-gray-500">
              Balance: {getTokenBalance(fromToken.symbol)} {fromToken.symbol}
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
            <TokenSelector isFrom={true} />
            <div className="flex-1 relative">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-sm text-right focus:outline-none"
              />
              <button
                onClick={handleSetMaxAmount}
                className="absolute right-0 top-0 text-[10px] text-blue-600 hover:text-blue-800"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleSwapTokens}
            className="bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* To token */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-gray-700">To</label>
            <div className="text-[10px] text-gray-500">
              Balance: {getTokenBalance(toToken.symbol)} {toToken.symbol}
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
            <TokenSelector isFrom={false} />
            <input
              type="text"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-sm text-right focus:outline-none"
            />
          </div>
        </div>

        {/* Exchange rate */}
        {fromAmount && toAmount && (
          <div className="text-[10px] text-gray-500 text-center mb-3">
            1 {fromToken.symbol} ≈ {EXCHANGE_RATES[fromToken.symbol][toToken.symbol]} {toToken.symbol}
          </div>
        )}

        {/* Swap button */}
        <button
          onClick={handleSwap}
          disabled={isSwapping || !fromAmount || Number(fromAmount) <= 0}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 text-sm ${
            isSwapping || !fromAmount || Number(fromAmount) <= 0
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-lg hover:shadow-gray-500/20"
          }`}
        >
          {isSwapping ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Swapping...
            </div>
          ) : (
            "Swap"
          )}
        </button>

        {/* Token balances */}
        <div className="mt-4">
          <h3 className="text-xs font-medium text-gray-700 mb-2">Your Balances</h3>
          <div className="space-y-2">
            {balances.map((balance) => (
              <div key={balance.symbol} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src={TOKENS.find((t) => t.symbol === balance.symbol)?.logo || ""}
                      alt={balance.symbol}
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium">{balance.symbol}</span>
                </div>
                <span className="text-xs">{balance.loading ? "Loading..." : balance.balance}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-2">
          <p className="text-[10px] text-blue-700">
            This is a demo swap interface. In a real application, swaps would be executed through a decentralized
            exchange contract.
          </p>
        </div>
      </div>
    </div>
  )
}
