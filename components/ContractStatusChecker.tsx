"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { AIRDROP_CONTRACT_ADDRESS } from "@/lib/airdropContractABI"
import { useLanguage } from "@/lib/languageContext"

// Lista de RPCs para tentar
const RPC_ENDPOINTS = [
  "https://rpc-testnet.worldcoin.org",
  "https://worldchain-testnet.g.alchemy.com/public",
  "https://worldchain-mainnet.g.alchemy.com/public",
  "https://rpc.worldcoin.org",
]

export default function ContractStatusChecker() {
  const { t } = useLanguage()
  const [status, setStatus] = useState<{
    checking: boolean
    results: Array<{
      rpc: string
      exists: boolean
      error?: string
    }>
  }>({
    checking: true,
    results: [],
  })

  useEffect(() => {
    async function checkContract() {
      const results = []

      for (const rpc of RPC_ENDPOINTS) {
        try {
          const provider = new ethers.JsonRpcProvider(rpc)
          const code = await provider.getCode(AIRDROP_CONTRACT_ADDRESS)

          if (code === "0x" || code === "") {
            results.push({
              rpc,
              exists: false,
              error: "No contract code found at this address",
            })
          } else {
            results.push({
              rpc,
              exists: true,
            })
          }
        } catch (error) {
          results.push({
            rpc,
            exists: false,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      setStatus({
        checking: false,
        results,
      })
    }

    checkContract()
  }, [])

  const anySuccess = status.results.some((result) => result.exists)

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 mt-4">
      <h3 className="text-lg font-medium text-white mb-3">{t("contract_status_check", "Contract Status Check")}</h3>

      {status.checking ? (
        <div className="flex items-center justify-center py-4">
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
          <span className="text-gray-300">{t("checking_contract", "Checking contract status...")}</span>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <div className="text-sm text-gray-300 mb-1">{t("contract_address", "Contract Address:")}</div>
            <div className="bg-gray-800 p-2 rounded font-mono text-xs text-gray-300 break-all">
              {AIRDROP_CONTRACT_ADDRESS}
            </div>
          </div>

          <div
            className={`p-3 rounded-lg mb-4 ${anySuccess ? "bg-green-900/30 border border-green-700" : "bg-red-900/30 border border-red-700"}`}
          >
            <div className="flex items-center">
              {anySuccess ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F87171"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
              <span className={anySuccess ? "text-green-400" : "text-red-400"}>
                {anySuccess
                  ? t("contract_accessible", "Contract is accessible")
                  : t("contract_not_accessible", "Contract is not accessible on any network")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-300 mb-1">{t("rpc_status", "RPC Status:")}</div>
            {status.results.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-xs ${result.exists ? "bg-green-900/20 border border-green-800/50" : "bg-red-900/20 border border-red-800/50"}`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-mono">{result.rpc}</div>
                  <div className={result.exists ? "text-green-400" : "text-red-400"}>
                    {result.exists ? t("available", "Available") : t("unavailable", "Unavailable")}
                  </div>
                </div>
                {result.error && <div className="mt-1 text-red-300">{result.error}</div>}
              </div>
            ))}
          </div>

          {!anySuccess && (
            <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg text-yellow-300 text-sm">
              <p className="font-medium mb-1">{t("possible_issues", "Possible issues:")}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t("not_deployed", "The contract may not be deployed yet")}</li>
                <li>{t("different_network", "The contract may be deployed on a different network")}</li>
                <li>{t("incorrect_address", "The contract address may be incorrect")}</li>
                <li>{t("rpc_unavailable", "The RPC endpoints may be unavailable")}</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
