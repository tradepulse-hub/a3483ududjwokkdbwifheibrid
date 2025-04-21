"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage, type Language } from "@/lib/languageContext"
import { Globe } from "lucide-react"

// Mapeamento de idiomas para bandeiras e nomes
const languageInfo: Record<Language, { flag: string; name: string }> = {
  en: { flag: "🇬🇧", name: "English" },
  es: { flag: "🇪🇸", name: "Español" },
  it: { flag: "🇮🇹", name: "Italiano" },
  zh: { flag: "🇨🇳", name: "中文" },
  fr: { flag: "🇫🇷", name: "Français" },
  pt: { flag: "🇧🇷", name: "Português" },
}

export default function LanguageSelector() {
  const { language, setLanguage, translations } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar o dropdown quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-700 transition-colors"
        aria-label={translations.language}
      >
        <Globe size={18} className="text-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 py-1 z-50 animate-fadeIn">
          {Object.entries(languageInfo).map(([code, { flag, name }]) => (
            <button
              key={code}
              onClick={() => {
                setLanguage(code as Language)
                setIsOpen(false)
              }}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                language === code ? "bg-blue-600/50 text-white" : "text-gray-300 hover:bg-gray-800"
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
        </div>
      )}
    </div>
  )
}
