"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { SquareTab, UserProfile } from "@/types/square"
import { getOrCreateProfile } from "@/lib/squareStorage"
import { isUserBanned } from "@/lib/squareService"
import SquareTabs from "./SquareTabs"
import RecentPosts from "./RecentPosts"
import PopularPosts from "./PopularPosts"
import MarketPosts from "./MarketPosts"
import ProfileSection from "./ProfileSection"
import BannedMessage from "./BannedMessage"

interface SquareProps {
  userAddress: string
}

export default function Square({ userAddress }: SquareProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<SquareTab>("recent")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userAddress) {
      // Obter ou criar perfil do usuário
      const profile = getOrCreateProfile(userAddress)
      setUserProfile(profile)
      setIsLoading(false)
    }
  }, [userAddress])

  // Verificar se o usuário está banido
  const isBanned = userProfile ? isUserBanned(userProfile) : false

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto shadow-xl border border-gray-800">
      {/* Perfil do usuário */}
      <ProfileSection userProfile={userProfile} currentUserAddress={userAddress} />

      {/* Mensagem de banimento (se aplicável) */}
      {isBanned && userProfile && <BannedMessage userProfile={userProfile} />}

      {/* Abas de navegação */}
      <SquareTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Conteúdo baseado na aba ativa */}
      <div className="mt-4">
        {activeTab === "recent" && (
          <RecentPosts userAddress={userAddress} userProfile={userProfile} isBanned={isBanned} />
        )}

        {activeTab === "popular" && (
          <PopularPosts userAddress={userAddress} userProfile={userProfile} isBanned={isBanned} />
        )}

        {activeTab === "market" && (
          <MarketPosts userAddress={userAddress} userProfile={userProfile} isBanned={isBanned} />
        )}
      </div>
    </div>
  )
}
