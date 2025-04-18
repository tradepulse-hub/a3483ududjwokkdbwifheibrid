"use client"

import { useState, useEffect } from "react"

type NavigationProps = {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [mounted, setMounted] = useState(false)

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
        <div className="grid grid-cols-2">
          <button
            onClick={() => onTabChange("wallet")}
            className={`py-3 px-2 text-center transition-all duration-300 text-sm sm:text-base font-medium ${
              activeTab === "wallet"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Wallet
            </div>
          </button>
          <button
            onClick={() => onTabChange("airdrop")}
            className={`py-3 px-2 text-center transition-all duration-300 text-sm sm:text-base font-medium ${
              activeTab === "airdrop"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Airdrop Zone
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
