"use client"

import { useLanguage } from "@/lib/languageContext"
import type { SquareTab } from "@/types/square"
import { motion } from "framer-motion"

interface SquareTabsProps {
  activeTab: SquareTab
  onTabChange: (tab: SquareTab) => void
}

export default function SquareTabs({ activeTab, onTabChange }: SquareTabsProps) {
  const { t } = useLanguage()

  return (
    <div className="flex bg-gray-800/50 backdrop-blur-sm p-0.5 border-y border-gray-700/30">
      <button
        onClick={() => onTabChange("recent")}
        className={`flex-1 py-1.5 text-xs font-medium transition-all duration-200 relative ${
          activeTab === "recent" ? "text-white" : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {activeTab === "recent" && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={false}
          />
        )}
        {t("most_recent", "Most Recent")}
      </button>
      <button
        onClick={() => onTabChange("popular")}
        className={`flex-1 py-1.5 text-xs font-medium transition-all duration-200 relative ${
          activeTab === "popular" ? "text-white" : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {activeTab === "popular" && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={false}
          />
        )}
        {t("popular", "Popular")}
      </button>
      <button
        onClick={() => onTabChange("market")}
        className={`flex-1 py-1.5 text-xs font-medium transition-all duration-200 relative ${
          activeTab === "market" ? "text-white" : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {activeTab === "market" && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={false}
          />
        )}
        {t("market", "Market")}
      </button>
    </div>
  )
}
