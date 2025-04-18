"use client"

import { useEffect, useState } from "react"
import { MiniKit } from "@worldcoin/minikit-js"
import Login from "@/components/Login"
import Image from "next/image"
import { ClaimCoin } from "@/components/ClaimCoin"
import TokenWallet from "@/components/TokenWallet"
import Navigation from "@/components/Navigation"

interface User {
  walletAddress: string
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loginError, setLoginError] = useState("")
  const [activeTab, setActiveTab] = useState("wallet")

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  useEffect(() => {
    const checkMiniKit = async () => {
      try {
        const isInstalled = MiniKit.isInstalled()
        if (isInstalled) {
          setIsLoading(false)
          try {
            const response = await fetch("/api/auth/me")
            if (response.ok) {
              const data = await response.json()
              if (data.user) {
                setUser(data.user)
                setIsLoggedIn(true)
              }
            }
          } catch (error) {
            console.error("Error checking auth status:", error)
            setLoginError("Failed to check auth status")
            setIsLoading(false)
          }
        } else {
          setTimeout(checkMiniKit, 500)
        }
      } catch (error) {
        console.error("Error checking MiniKit:", error)
        setIsLoading(false)
        setLoginError("Failed to initialize MiniKit")
      }
    }

    checkMiniKit()
  }, [])

  const handleLoginSuccess = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
    setLoginError("")
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      if (response.ok) {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Logout error:", error)
      setLoginError("Logout failed")
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-3 sm:p-4 bg-black text-white">
        <div className="flex flex-col items-center justify-center text-center">
          <svg
            className="animate-spin h-12 w-12 sm:h-16 sm:w-16 text-blue-500"
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
          <p className="mt-4 text-base sm:text-lg font-medium">Loading MiniKit...</p>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">Please wait while we initialize the application</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-3 sm:p-4 bg-black text-white">
      <div className="w-full max-w-md mx-auto space-y-4 py-4 sm:py-6">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-block rounded-full shadow-lg mb-3 p-2 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
            <Image
              src="/images/tpf-logo.png"
              width={40}
              height={40}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
              alt="TPulseFi Logo"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            TPulseFi
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-400">Global Crypto Bridge</p>
        </div>

        {isLoggedIn && user ? (
          <>
            <section className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center">
                  Connected{" "}
                  <span className="ml-2 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full inline-block animate-pulse"></span>
                </h2>
                <button
                  onClick={handleLogout}
                  className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-4 sm:w-4 mr-1 inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mt-3">
                <p className="text-xs sm:text-sm text-gray-300">
                  Wallet Address:{" "}
                  <span className="font-semibold text-white">{truncateAddress(user.walletAddress)}</span>
                </p>
              </div>
            </section>

            {/* Navigation Menu */}
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content based on active tab */}
            <div className="transition-all duration-300">
              {activeTab === "wallet" && user.walletAddress && (
                <div className="animate-fadeIn">
                  <TokenWallet walletAddress={user.walletAddress} />
                </div>
              )}

              {activeTab === "airdrop" && user.walletAddress && (
                <div className="animate-fadeIn">
                  <ClaimCoin userAddress={user.walletAddress} />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Login onLoginSuccess={handleLoginSuccess} />
            {loginError && <p className="text-red-400 text-center mt-4 text-sm">{loginError}</p>}
          </>
        )}
      </div>
    </main>
  )
}
