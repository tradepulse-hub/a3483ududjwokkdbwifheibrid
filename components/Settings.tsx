"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage, type Language } from "@/lib/languageContext"
import { SettingsIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Language mapping with flags and names
const languageInfo: Record<Language, { flag: string; name: string }> = {
  en: { flag: "🇬🇧", name: "English" },
  es: { flag: "🇪🇸", name: "Español" },
  it: { flag: "🇮🇹", name: "Italiano" },
  zh: { flag: "🇨🇳", name: "中文" },
  fr: { flag: "🇫🇷", name: "Français" },
  pt: { flag: "🇧🇷", name: "Português" },
}

type SettingsProps = {
  onLogout?: () => Promise<void>
}

export default function Settings({ onLogout }: SettingsProps) {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsLanguageMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    }
    setIsOpen(false)
  }

  return (
    <div className="fixed top-4 right-4 z-50" ref={modalRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-700 transition-colors"
        aria-label={t("settings", "Settings")}
      >
        <SettingsIcon size={18} className="text-gray-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 py-1 z-50"
          >
            {/* Settings Menu */}
            <div className="py-1">
              {/* Language Option */}
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                <span>{t("language", "Language")}</span>
                <span>{languageInfo[language].flag}</span>
              </button>

              {/* Language Submenu */}
              <AnimatePresence>
                {isLanguageMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-800/50 border-t border-b border-gray-700"
                  >
                    {Object.entries(languageInfo).map(([code, { flag, name }]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLanguage(code as Language)
                          setIsLanguageMenuOpen(false)
                        }}
                        className={`flex items-center w-full px-6 py-2 text-sm ${
                          language === code ? "bg-blue-600/50 text-white" : "text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        <span className="mr-2">{flag}</span>
                        <span>{name}</span>
                        {language === code && (
                          <svg
                            className="ml-auto h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Logout Option */}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
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
                {t("logout", "Logout")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
