"use client"

import { createContext, useContext } from "react"
import translations from "./translations"

export type Language = "en" | "es" | "it" | "zh" | "fr" | "pt"

export interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  translations: Record<string, string>
  t: (key: string, fallback?: string) => string
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  translations: {},
  t: (key: string, fallback?: string) => fallback || key,
})

export const useLanguage = () => useContext(LanguageContext)

// Helper function to get translation
export const getTranslation = (language: Language, key: string, fallback?: string): string => {
  const translationSet = translations[language] || translations.en
  return translationSet[key] || fallback || key
}
