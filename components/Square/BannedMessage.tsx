"use client"

import { useLanguage } from "@/lib/languageContext"
import type { UserProfile } from "@/types/square"
import { getBanTimeRemaining, formatDate } from "@/lib/squareService"

interface BannedMessageProps {
  userProfile: UserProfile
}

export default function BannedMessage({ userProfile }: BannedMessageProps) {
  const { t } = useLanguage()

  if (!userProfile.banned) return null

  const banExpireDate = formatDate(userProfile.banned.until)
  const timeRemaining = getBanTimeRemaining(userProfile)

  return (
    <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4 mt-4 text-center">
      <div className="flex justify-center mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F87171"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>
      </div>
      <p className="text-red-300 text-sm">
        {t("banned_message", "You have been banned for {duration}. Reason: {reason}")
          .replace("{duration}", timeRemaining)
          .replace("{reason}", userProfile.banned.reason)}
      </p>
      <p className="text-xs text-red-200 mt-1">
        {t("ban_expires", "Ban expires on {date}").replace("{date}", banExpireDate)}
      </p>
    </div>
  )
}
