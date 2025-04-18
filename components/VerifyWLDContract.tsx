"use client"

import { useState, useEffect } from "react"

export default function VerifyWLDContract() {
  const [contractInfo, setContractInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyContract = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/verify-wld-contract")
        const data = await response.json()

        setContractInfo(data)
      } catch (err) {
        console.error("Error verifying contract:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    verifyContract()
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 mt-4">
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-blue-500 mr-2"
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
          <span className="text-sm text-gray-300">Verifying WLD contract...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/50 rounded-xl p-4 border border-red-700 mt-4">
        <h3 className="text-red-300 font-medium mb-2">Error verifying WLD contract</h3>
        <p className="text-red-200 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl p-4 border mt-4 ${contractInfo?.valid ? "bg-green-900/20 border-green-700" : "bg-red-900/20 border-red-700"}`}
    >
      <h3 className={`font-medium mb-2 ${contractInfo?.valid ? "text-green-300" : "text-red-300"}`}>
        WLD Contract Verification
      </h3>

      <div className="space-y-2 text-sm">
        <p>
          <span className="text-gray-400">Network: </span>
          <span className="text-blue-300">{contractInfo?.network || "World Chain"}</span>
        </p>
        <p>
          <span className="text-gray-400">Address: </span>
          <span className="font-mono text-gray-300">[Address hidden for security]</span>
        </p>

        {contractInfo?.valid ? (
          <>
            <p>
              <span className="text-gray-400">Symbol: </span>
              <span className="text-gray-300">{contractInfo?.symbol}</span>
            </p>
            <p>
              <span className="text-gray-400">Name: </span>
              <span className="text-gray-300">{contractInfo?.name}</span>
            </p>
            <p>
              <span className="text-gray-400">Decimals: </span>
              <span className="text-gray-300">{contractInfo?.decimals}</span>
            </p>
            <p className="text-green-300 font-medium">✓ Valid WLD contract</p>
          </>
        ) : (
          <p className="text-red-300">✗ {contractInfo?.error || "Invalid WLD contract"}</p>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-900/30 rounded-lg text-xs text-blue-300">
        <p className="font-medium mb-1">Important:</p>
        <p>
          You need to register the WLD contract in the Worldcoin Developer Portal in the advanced settings of your
          application.
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Contract address: [Address hidden for security]</li>
          <li>Network: World Chain</li>
          <li>Description: "WLD Token Contract"</li>
        </ul>
      </div>
    </div>
  )
}
