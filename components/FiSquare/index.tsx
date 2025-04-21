"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { SquareTab, UserProfile } from "@/types/square"
import { getProfiles, getOrCreateProfile } from "@/lib/squareStorage"
import { isUserBanned } from "@/lib/squareService"
import SquareTabs from "./SquareTabs"
import RecentPosts from "./RecentPosts"
import PopularPosts from "./PopularPosts"
import MarketPosts from "./MarketPosts"
import ProfileSection from "./ProfileSection"
import BannedMessage from "./BannedMessage"
import { motion } from "framer-motion"

interface FiSquareProps {
  userAddress: string
}

export default function FiSquare({ userAddress }: FiSquareProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<SquareTab>("recent")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [communityStats, setCommunityStats] = useState({
    activeUsers: 0,
    registeredUsers: 0,
  })

  useEffect(() => {
    if (userAddress) {
      // Obter ou criar perfil do usuário
      const profile = getOrCreateProfile(userAddress)
      setUserProfile(profile)

      // Calcular estatísticas da comunidade
      const allProfiles = getProfiles()

      // Usuários ativos (todos os perfis)
      const activeUsers = allProfiles.length

      // Usuários registrados (com foto de perfil ou nickname)
      const registeredUsers = allProfiles.filter((p) => p.profilePicture !== null || p.nickname !== null).length

      setCommunityStats({
        activeUsers,
        registeredUsers,
      })

      setIsLoading(false)
    }
  }, [userAddress])

  // Verificar se o usuário está banido
  const isBanned = userProfile ? isUserBanned(userProfile) : false

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
      {/* Estatísticas da comunidade */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-2 border-b border-gray-800/50">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-300 font-medium">{t("community_stats", "Community Stats")}</div>
          <div className="flex space-x-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-blue-400">{communityStats.activeUsers}</span>
              <span className="text-[10px] text-gray-400">{t("active_users", "Active Users")}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-purple-400">{communityStats.registeredUsers}</span>
              <span className="text-[10px] text-gray-400">{t("registered_users", "Registered Users")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Perfil do usuário em formato compacto */}
      <ProfileSection userProfile={userProfile} currentUserAddress={userAddress} />

      {/* Mensagem de banimento (se aplicável) */}
      {isBanned && userProfile && <BannedMessage userProfile={userProfile} />}

      {/* Abas de navegação */}
      <SquareTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Conteúdo baseado na aba ativa */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-3"
      >
        {activeTab === "recent" && (
          <RecentPosts userAddress={userAddress} userProfile={userProfile} isBanned={isBanned} />
        )}

        {activeTab === "popular" && (
          <PopularPosts userAddress={userAddress} userProfile={userProfile} isBanned={isBanned} />
        )}

        {activeTab === "market" && (
          <MarketPosts userAddress={userAddress} userProfile={userProfile} isBanned={isBanned} />
        )}
      </motion.div>
    </div>
  )
}
