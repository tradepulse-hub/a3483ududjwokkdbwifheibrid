"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"

type NavigationProps = {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  // Map activeTab to index
  useEffect(() => {
    const tabToIndex = {
      wallet: 0,
      lottery: 1,
      airdrop: 2,
    }
    setActiveIndex(tabToIndex[activeTab as keyof typeof tabToIndex] || 0)
  }, [activeTab])

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle tab change based on index
  const handleTabChange = (index: number) => {
    const indexToTab = ["wallet", "lottery", "airdrop"]
    onTabChange(indexToTab[index])
    setActiveIndex(index)
  }

  // Touch/mouse event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true)
    if ("touches" in e) {
      setStartX(e.touches[0].clientX)
    } else {
      setStartX(e.clientX)
    }
    setCurrentX(0)
  }

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return

    if ("touches" in e) {
      setCurrentX(e.touches[0].clientX - startX)
    } else {
      setCurrentX(e.clientX - startX)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    setIsDragging(false)

    // Determine if swipe was significant enough to change tab
    if (Math.abs(currentX) > 50) {
      if (currentX > 0 && activeIndex > 0) {
        // Swipe right, go to previous tab
        handleTabChange(activeIndex - 1)
      } else if (currentX < 0 && activeIndex < 2) {
        // Swipe left, go to next tab
        handleTabChange(activeIndex + 1)
      }
    }

    setCurrentX(0)
  }

  if (!mounted) return null

  const tabs = [
    {
      id: "wallet",
      label: t("wallet", "Wallet"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      ),
    },
    {
      id: "lottery",
      label: t("lottery", "Lottery"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "airdrop",
      label: t("airdrop_zone", "Airdrop Zone"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
  ]

  return (
    <div
      className="w-full max-w-md mx-auto mb-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 relative">
        {/* Sliding indicator */}
        <div
          className="absolute h-full w-1/3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 rounded-xl transition-all duration-300 ease-out"
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
            left: 0,
            top: 0,
          }}
        />

        {/* Tabs */}
        <div className="grid grid-cols-3 relative z-10">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(index)}
              className={`py-3 px-2 text-center transition-all duration-300 text-sm sm:text-base font-medium flex flex-col items-center justify-center ${
                activeIndex === index ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <div
                  className={`mb-1 transform transition-transform duration-300 ${activeIndex === index ? "scale-110" : "scale-90"}`}
                >
                  {tab.icon}
                </div>
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Swipe indicator */}
      <div className="flex justify-center mt-2">
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === index ? "w-6 bg-blue-500" : "w-1.5 bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
