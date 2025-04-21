"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/languageContext"
import { banUser } from "@/lib/squareStorage"

interface BanUserModalProps {
  userAddress: string
  adminAddress: string
  onClose: () => void
}

export default function BanUserModal({ userAddress, adminAddress, onClose }: BanUserModalProps) {
  const { t } = useLanguage()
  const [duration, setDuration] = useState(24) // Horas
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBanUser = () => {
    if (!reason.trim()) return

    setIsSubmitting(true)

    // Converter duração para milissegundos
    const durationMs = duration * 60 * 60 * 1000

    // Banir usuário
    banUser(userAddress, adminAddress, durationMs, reason.trim())

    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 max-w-md w-full">
        <h3 className="text-lg font-bold text-white mb-4">{t("ban_user", "Ban User")}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("ban_duration", "Ban Duration")} ({t("hours", "hours")})
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Number.parseInt(e.target.value) || 1))}
              min="1"
              className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t("ban_reason", "Ban Reason")}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {t("cancel", "Cancel")}
          </button>
          <button
            onClick={handleBanUser}
            disabled={!reason.trim() || isSubmitting}
            className={`px-3 py-1.5 rounded-lg text-white transition-colors ${
              !reason.trim() || isSubmitting ? "bg-gray-700 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
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
                {t("processing", "Processing...")}
              </span>
            ) : (
              t("confirm", "Confirm")
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
