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
    <div className="bg-red-900/30 border-y border-red-800/50 p-2 text-center">
      <div className="flex justify-center items-center mb-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F87171"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
        </svg>
        <span className="text-red-300 text-xs font-medium">{t("banned", "Banned")}</span>
      </div>
      <p className="text-red-300 text-xs">
        {t("banned_message", "You have been banned for {duration}. Reason: {reason}")
          .replace("{duration}", timeRemaining)
          .replace("{reason}", userProfile.banned.reason)}
      </p>
      <p className="text-[10px] text-red-200 mt-0.5">
        {t("ban_expires", "Ban expires on {date}").replace("{date}", banExpireDate)}
      </p>
    </div>
  )
}
