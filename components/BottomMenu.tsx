"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import { motion, AnimatePresence } from "framer-motion"
import SendTokensModal from "./SendTokensModal"
import ReceiveTokensModal from "./ReceiveTokensModal"
import Image from "next/image"

type BottomMenuProps = {
  activeTab: string
  onTabChange: (tab: string) => void
  isVisible?: boolean // Nova prop para controlar a visibilidade
}

export default function BottomMenu({ activeTab, onTabChange, isVisible = true }: BottomMenuProps) {
  const { t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Adicionar estados para os modais
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)

  // Fechar o menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains("menu-backdrop")) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isMenuOpen])

  // Fechar o menu ao selecionar uma opção
  const handleTabSelect = (tab: string) => {
    onTabChange(tab)
    setIsMenuOpen(false)
  }

  const tabs = [
    {
      id: "wallet",
      label: t("wallet", "Wallet"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      id: "staking",
      label: t("staking", "Staking"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "airdrop",
      label: t("airdrop_zone", "Airdrop Zone"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      id: "lottery",
      label: t("lottery", "Lottery"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ]

  if (!isVisible) {
    return (
      <>
        {/* Modal de Send */}
        <SendTokensModal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} />

        {/* Modal de Receive */}
        <ReceiveTokensModal isOpen={isReceiveModalOpen} onClose={() => setIsReceiveModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      {/* Botões de ação fixos na parte inferior */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-4">
        {/* Botão Receive (à esquerda) */}
        <button
          onClick={() => setIsReceiveModalOpen(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center shadow-lg shadow-gray-500/30 hover:scale-110 transition-all duration-300"
          aria-label={t("receive", "Receive")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 5v14" />
            <path d="m5 12 7 7 7-7" />
          </svg>
        </button>

        {/* Botão de menu principal com o logotipo */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-600/30 hover:scale-110 transition-all duration-300 overflow-hidden"
          aria-label="Menu"
        >
          <motion.div
            animate={{ rotate: isMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12" // Ajustado para um tamanho um pouco menor para melhor encaixe
          >
            <Image
              src="/images/logo-menu.png"
              alt="Menu Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </motion.div>
        </button>

        {/* Botão Send (à direita) */}
        <button
          onClick={() => setIsSendModalOpen(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center shadow-lg shadow-gray-500/30 hover:scale-110 transition-all duration-300"
          aria-label={t("send", "Send")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Menu modal (manter o código existente) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 menu-backdrop bg-black/70 backdrop-blur-sm flex items-end justify-center"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-t-2xl w-full max-w-md p-6 border-t border-x border-gray-600/50 shadow-2xl"
            >
              <div className="flex justify-center mb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
              </div>

              <h3 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 mb-4">
                {t("menu", "Menu")}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-gray-600/80 to-gray-700/80 shadow-lg shadow-gray-600/20"
                        : "bg-gray-800/80 hover:bg-gray-700/80"
                    }`}
                  >
                    <div className={`mb-2 ${activeTab === tab.id ? "text-white" : "text-gray-400"}`}>{tab.icon}</div>
                    <span className={`text-sm ${activeTab === tab.id ? "text-white font-medium" : "text-gray-400"}`}>
                      {tab.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">{t("select_option", "Select an option to continue")}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Send */}
      <SendTokensModal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} />

      {/* Modal de Receive */}
      <ReceiveTokensModal isOpen={isReceiveModalOpen} onClose={() => setIsReceiveModalOpen(false)} />
    </>
  )
}
