"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { SquareTab, UserProfile } from "@/types/square"
import {
  getProfiles,
  getOrCreateProfile,
  initializeExampleData,
  initializeRealTimeListeners,
  removeRealTimeListeners,
} from "@/lib/sharedStorageService"
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
    activeUsers: 1,
    registeredUsers: 1,
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const initialized = useRef(false)

  // Inicializar dados de exemplo e listeners em tempo real
  useEffect(() => {
    if (!initialized.current) {
      const initializeData = async () => {
        try {
          // Inicializar dados de exemplo
          await initializeExampleData()

          // Configurar listeners em tempo real
          initializeRealTimeListeners(() => {
            console.log("Posts updated, triggering refresh")
            setRefreshTrigger((prev) => prev + 1)
          })

          initialized.current = true
        } catch (error) {
          console.error("Error initializing data:", error)
          setError("Failed to initialize data. Please try again.")
        }
      }

      initializeData()
    }

    // Limpar listeners quando o componente for desmontado
    return () => {
      removeRealTimeListeners()
    }
  }, [])

  // Carregar dados do usuário e estatísticas
  useEffect(() => {
    let isMounted = true
    const loadingTimeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Loading timeout reached, forcing render")
        setIsLoading(false)
      }
    }, 2000) // Reduzido para 2 segundos para melhor experiência do usuário

    async function loadData() {
      if (!userAddress || !isMounted) return

      console.log("Loading FiSquare data for address:", userAddress)
      setIsLoading(true)
      setError(null)

      try {
        // Obter ou criar perfil do usuário
        let profile = null
        try {
          console.log("Getting or creating user profile")
          profile = await getOrCreateProfile(userAddress)
          if (isMounted) {
            setUserProfile(profile)
          }
          console.log("User profile loaded:", profile)
        } catch (profileError) {
          console.error("Error loading profile:", profileError)
          // Criar perfil padrão em memória para não bloquear a UI
          profile = {
            address: userAddress,
            nickname: null,
            profilePicture: null,
            isAdmin: userAddress.toLowerCase() === "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677".toLowerCase(),
            createdAt: Date.now(),
            followers: [],
            following: [],
            postCount: 0,
          }
          if (isMounted) {
            setUserProfile(profile)
          }
        }

        // Calcular estatísticas da comunidade
        try {
          console.log("Fetching all profiles for community stats")
          const allProfiles = await getProfiles()
          console.log(`Fetched ${allProfiles.length} profiles`)

          // Usuários ativos (todos os perfis)
          const activeUsers = Math.max(allProfiles.length, 1)

          // Usuários registrados (com foto de perfil ou nickname)
          const registeredUsers = Math.max(
            allProfiles.filter((p) => p.profilePicture !== null || p.nickname !== null).length,
            1,
          )

          if (isMounted) {
            setCommunityStats({
              activeUsers,
              registeredUsers,
            })
          }
        } catch (statsError) {
          console.error("Error loading community stats:", statsError)
          // Manter os valores padrão
        }

        console.log("FiSquare data loaded successfully")
      } catch (error) {
        console.error("Error loading FiSquare data:", error)
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : t("error_loading_data", "Failed to load data. Please try again."),
          )
        }
      } finally {
        // Garantir que o estado de carregamento seja desativado mesmo em caso de erro
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    // Limpar timeout e marcar componente como desmontado
    return () => {
      isMounted = false
      clearTimeout(loadingTimeoutId)
    }
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

  // Função para atualizar o perfil do usuário após edição
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
  }

  // Função para lidar com a criação de posts
  const handlePostCreated = () => {
    console.log("Post created in parent component")
    setRefreshTrigger((prev) => prev + 1)
  }

  // Função para forçar uma atualização manual
  const handleForceRefresh = () => {
    console.log("Forcing refresh")
    setRefreshTrigger((prev) => prev + 1)
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
            <button
              onClick={handleForceRefresh}
              className="ml-2 text-xs bg-blue-600/80 hover:bg-blue-600 text-white px-2 py-1 rounded-md transition-colors"
              title={t("refresh_now", "Refresh Now")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Perfil do usuário em formato compacto */}
      <ProfileSection
        userProfile={userProfile}
        currentUserAddress={userAddress}
        onProfileUpdate={handleProfileUpdate}
      />

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
          <RecentPosts
            userAddress={userAddress}
            userProfile={userProfile}
            isBanned={isBanned}
            onPostCreated={handlePostCreated}
          />
        )}

        {activeTab === "popular" && (
          <PopularPosts
            userAddress={userAddress}
            userProfile={userProfile}
            isBanned={isBanned}
            onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}

        {activeTab === "market" && (
          <MarketPosts
            userAddress={userAddress}
            userProfile={userProfile}
            isBanned={isBanned}
            onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}
      </motion.div>
    </div>
  )
}
