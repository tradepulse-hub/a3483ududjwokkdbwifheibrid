"use client"

import { useState, useEffect, type ReactNode } from "react"
import { LanguageContext, type Language, getTranslation } from "@/lib/languageContext"
import translations from "@/lib/translations"

export default function LanguageProvider({ children }: { children: ReactNode }) {
  // Tentar obter o idioma do localStorage, ou usar o idioma do navegador, ou padrão para inglês
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Tentar obter o idioma salvo no localStorage
    const savedLanguage = localStorage.getItem("language") as Language | null

    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // Tentar detectar o idioma do navegador
      const browserLanguage = navigator.language.split("-")[0] as Language

      // Verificar se o idioma do navegador é suportado
      if (Object.keys(translations).includes(browserLanguage)) {
        setLanguage(browserLanguage)
      }
      // Se não for suportado, mantém o inglês como padrão
    }
  }, [])

  // Salvar o idioma no localStorage quando ele mudar
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Função para traduzir texto
  const t = (key: string, fallback?: string): string => {
    return getTranslation(language, key, fallback)
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: (newLanguage: Language) => setLanguage(newLanguage),
        translations: translations[language] || translations.en,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}
