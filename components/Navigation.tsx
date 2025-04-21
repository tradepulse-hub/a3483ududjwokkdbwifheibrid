"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Home, Wallet, Gift, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const tabs = [
    {
      name: t("Home"),
      href: "/",
      icon: Home,
      current: pathname === "/",
    },
    {
      name: t("Wallet"),
      href: "/wallet",
      icon: Wallet,
      current: pathname === "/wallet",
    },
    {
      name: t("Airdrop"),
      href: "/airdrop",
      icon: Gift,
      current: pathname === "/airdrop",
    },
    {
      name: t("Lottery"),
      href: "/lottery",
      icon: Ticket,
      current: pathname === "/lottery",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="grid h-full grid-cols-4 mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            type="button"
            onClick={() => router.push(tab.href)}
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group",
              tab.current && "bg-gray-50 dark:bg-gray-800",
            )}
          >
            <tab.icon
              className={cn(
                "w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500",
                tab.current && "text-blue-600 dark:text-blue-500",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500",
                tab.current && "text-blue-600 dark:text-blue-500",
              )}
            >
              {tab.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
