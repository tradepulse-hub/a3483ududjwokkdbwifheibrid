"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { SquareTab, UserProfile } from "@/types/square"
import {
  getProfiles,
  getOrCreateProfile,
  initializeRealTimeListeners,
  removeRealTimeListeners,
  getPosts,
} from "@/lib/squareStorage"
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
  const [error, setError] = useState<string | null>(null)
  const [communityStats, setCommunityStats] = useState({
    activeUsers: 0,
    registeredUsers: 0,
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [listenersInitialized, setListenersInitialized] = useState(false)

  // Inicializar listeners em tempo real
  useEffect(() => {
    try {
      console.log("Initializing real-time listeners")

      // Verificar se os listeners já foram inicializados para evitar duplicação
      if (!listenersInitialized) {
        initializeRealTimeListeners(() => {
          // Callback quando os posts são atualizados
          console.log("Posts updated, triggering refresh")
          setRefreshTrigger((prev) => prev + 1)
        })
        setListenersInitialized(true)
      }

      // Limpar listeners quando o componente for desmontado
      return () => {
        console.log("Removing real-time listeners")
        removeRealTimeListeners()
        setListenersInitialized(false)
      }
    } catch (err) {
      console.error("Error initializing listeners:", err)
      setError(
        t("error_initializing_listeners", "Failed to initialize data listeners. Please try refreshing the page."),
      )
      // Garantir que o estado de carregamento seja desativado mesmo em caso de erro
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    async function loadData() {
      if (!userAddress) {
        setIsLoading(false)
        return
      }

      console.log("Loading FiSquare data for address:", userAddress)
      setIsLoading(true)
      setError(null)

      try {
        // Verificar se podemos acessar os dados básicos
        let testPosts = []
        try {
          testPosts = await getPosts()
          console.log(`Successfully fetched ${testPosts.length} posts`)
        } catch (postError) {
          console.error("Error fetching posts:", postError)
          throw new Error(t("error_fetching_posts", "Could not load posts. Please try again."))
        }

        // Obter ou criar perfil do usuário
        let profile = null
        try {
          console.log("Getting or creating user profile")
          profile = await getOrCreateProfile(userAddress)
          setUserProfile(profile)
          console.log("User profile loaded:", profile)
        } catch (profileError) {
          console.error("Error loading profile:", profileError)
          throw new Error(t("error_loading_profile", "Could not load your profile. Please try again."))
        }

        // Calcular estatísticas da comunidade
        try {
          console.log("Fetching all profiles for community stats")
          const allProfiles = await getProfiles()
          console.log(`Fetched ${allProfiles.length} profiles`)

          // Usuários ativos (todos os perfis)
          const activeUsers = allProfiles.length

          // Usuários registrados (com foto de perfil ou nickname)
          const registeredUsers = allProfiles.filter((p) => p.profilePicture !== null || p.nickname !== null).length

          setCommunityStats({
            activeUsers,
            registeredUsers,
          })
        } catch (statsError) {
          console.error("Error loading community stats:", statsError)
          // Não lançar erro aqui, apenas registrar, pois não é crítico
          setCommunityStats({
            activeUsers: 0,
            registeredUsers: 0,
          })
        }

        console.log("FiSquare data loaded successfully")
      } catch (error) {
        console.error("Error loading FiSquare data:", error)
        setError(
          error instanceof Error ? error.message : t("error_loading_data", "Failed to load data. Please try again."),
        )
      } finally {
        // Garantir que o estado de carregamento seja desativado mesmo em caso de erro
        setIsLoading(false)
      }
    }

    loadData()
  }, [userAddress, refreshTrigger, t])

  // Verificar se o usuário está banido
  const isBanned = userProfile ? isUserBanned(userProfile) : false

  // Se houver um erro, mostrar mensagem de erro
  if (error) {
    return (
      <div className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-800 p-4">
        <div className="text-center py-6">
          <div className="text-red-400 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">{t("error_loading", "Error Loading")}</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setRefreshTrigger((prev) => prev + 1)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {t("try_again", "Try Again")}
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-800 p-4">
        <div className="flex flex-col justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-400 text-sm">{t("loading_fisquare", "Loading FiSquare...")}</p>
        </div>
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
