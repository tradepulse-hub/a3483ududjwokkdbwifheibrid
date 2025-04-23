"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage, type Language } from "@/lib/languageContext"
import { Settings, Check, Lock, Unlock, X, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import TokenPriceTester from "./developer/TokenPriceTester"

// Mapeamento de idiomas para bandeiras e nomes
const languageInfo: Record<Language, { flag: string; name: string }> = {
  en: { flag: "🇬🇧", name: "English" },
  es: { flag: "🇪🇸", name: "Español" },
  it: { flag: "🇮🇹", name: "Italiano" },
  zh: { flag: "🇨🇳", name: "中文" },
  fr: { flag: "🇫🇷", name: "Français" },
  pt: { flag: "🇧🇷", name: "Português" },
}

// Senha para o modo desenvolvedor
const DEV_PASSWORD = "Setembro25@"

export default function SettingsModal() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"language" | "developer">("language")
  const [devPassword, setDevPassword] = useState("")
  const [devMode, setDevMode] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [showDevMenu, setShowDevMenu] = useState(false)
  const [activeDevTool, setActiveDevTool] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Fechar o modal quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Fechar o modal com a tecla ESC
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen])

  // Verificar a senha do modo desenvolvedor
  const checkDevPassword = () => {
    if (devPassword === DEV_PASSWORD) {
      setDevMode(true)
      setPasswordError(false)
      setShowDevMenu(true)
    } else {
      setPasswordError(true)
      setTimeout(() => setPasswordError(false), 2000)
    }
  }

  // Sair do modo desenvolvedor
  const exitDevMode = () => {
    setDevMode(false)
    setDevPassword("")
    setShowDevMenu(false)
    setActiveDevTool(null)
  }

  // Voltar ao menu principal do modo desenvolvedor
  const backToDevMenu = () => {
    setActiveDevTool(null)
  }

  return (
    <div className="fixed top-4 right-4 z-50" ref={modalRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-700 transition-colors"
        aria-label="Settings"
      >
        <Settings size={18} className="text-gray-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-2 w-72 rounded-lg shadow-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
              <h3 className="text-gray-200 font-medium">{t("settings", "Settings")}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            {!activeDevTool && (
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab("language")}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === "language"
                      ? "text-white border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {t("language", "Language")}
                </button>
                <button
                  onClick={() => setActiveTab("developer")}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    activeTab === "developer"
                      ? "text-white border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {t("developer_mode", "Developer Mode")}
                </button>
              </div>
            )}

            {/* Tab Content */}
            <div className="p-4">
              {activeDevTool ? (
                <div>
                  <button
                    onClick={backToDevMenu}
                    className="mb-4 flex items-center text-sm text-blue-400 hover:text-blue-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    {t("back_to_menu", "Back to Menu")}
                  </button>

                  {activeDevTool === "token_tester" && <TokenPriceTester />}
                </div>
              ) : activeTab === "language" ? (
                <div className="space-y-2">
                  {Object.entries(languageInfo).map(([code, { flag, name }]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLanguage(code as Language)
                      }}
                      className={`flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors ${
                        language === code ? "bg-blue-600/50 text-white" : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <span className="mr-2 text-lg">{flag}</span>
                      <span>{name}</span>
                      {language === code && <Check size={16} className="ml-auto text-blue-400" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {!devMode ? (
                    <>
                      <div className="flex items-center space-x-2 mb-3">
                        <Lock size={16} className="text-amber-500" />
                        <p className="text-sm text-gray-300">{t("dev_mode_locked", "Developer mode is locked")}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          {t("enter_password", "Enter password")}
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={devPassword}
                            onChange={(e) => setDevPassword(e.target.value)}
                            className={`w-full bg-gray-800 border ${
                              passwordError ? "border-red-500" : "border-gray-700"
                            } rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            placeholder="••••••••••••"
                          />
                          <AnimatePresence>
                            {passwordError && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500"
                              >
                                <AlertCircle size={16} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <AnimatePresence>
                          {passwordError && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-red-500 mt-1"
                            >
                              {t("incorrect_password", "Incorrect password")}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      <button
                        onClick={checkDevPassword}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {t("unlock", "Unlock")}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 mb-3">
                        <Unlock size={16} className="text-green-500" />
                        <p className="text-sm text-green-400">{t("dev_mode_unlocked", "Developer mode is unlocked")}</p>
                      </div>

                      <AnimatePresence>
                        {showDevMenu && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 py-2"
                          >
                            <p className="text-sm text-gray-300 mb-2">{t("dev_tools", "Developer Tools")}</p>

                            <button
                              className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 transition-colors"
                              onClick={() => setActiveDevTool("contract_debugger")}
                            >
                              {t("contract_debug", "Contract Debugger")}
                            </button>

                            <button
                              className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 transition-colors"
                              onClick={() => setActiveDevTool("network_inspector")}
                            >
                              {t("network_inspector", "Network Inspector")}
                            </button>

                            <button
                              className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 transition-colors"
                              onClick={() => setActiveDevTool("token_tester")}
                            >
                              {t("token_tester", "Token Tester")}
                            </button>

                            <button
                              className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-gray-300 transition-colors"
                              onClick={() => setActiveDevTool("api_explorer")}
                            >
                              {t("api_explorer", "API Explorer")}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={exitDevMode}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium transition-colors mt-4"
                      >
                        {t("exit_dev_mode", "Exit Developer Mode")}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
