"use client"

import { useLanguage } from "@/lib/languageContext"
import type { SquareTab } from "@/types/square"

interface SquareTabsProps {
  activeTab: SquareTab
  onTabChange: (tab: SquareTab) => void
}

export default function SquareTabs({ activeTab, onTabChange }: SquareTabsProps) {
  const { t } = useLanguage()

  return (
    <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/30 mt-4">
      <button
        onClick={() => onTabChange("recent")}
        className={`flex-1 py-2 rounded-md transition-all duration-300 ${
          activeTab === "recent"
            ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white font-medium"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {t("most_recent", "Most Recent")}
      </button>
      <button
        onClick={() => onTabChange("popular")}
        className={`flex-1 py-2 rounded-md transition-all duration-300 ${
          activeTab === "popular"
            ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white font-medium"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {t("popular", "Popular")}
      </button>
      <button
        onClick={() => onTabChange("market")}
        className={`flex-1 py-2 rounded-md transition-all duration-300 ${
          activeTab === "market"
            ? "bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white font-medium"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {t("market", "Market")}
      </button>
    </div>
  )
}
