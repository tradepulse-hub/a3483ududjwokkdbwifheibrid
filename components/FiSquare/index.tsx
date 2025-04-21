"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { SquareTab, UserProfile, Post } from "@/types/square"
import SquareTabs from "./SquareTabs"
import RecentPosts from "./RecentPosts"
import PopularPosts from "./PopularPosts"
import MarketPosts from "./MarketPosts"
import ProfileSection from "./ProfileSection"
import BannedMessage from "./BannedMessage"
import { motion } from "framer-motion"

// Dados simulados para garantir que o componente sempre renderize algo
const MOCK_POSTS: Post[] = [
  {
    id: "post1",
    authorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    content: "Bem-vindo ao FiSquare! Este é um post de exemplo. #TPF #WLD",
    createdAt: Date.now() - 3600000,
    likes: [],
    comments: [],
    cryptoTags: ["TPF", "WLD"],
  },
  {
    id: "post2",
    authorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    content: "TPF está em alta hoje! 📈 #TPF",
    createdAt: Date.now() - 7200000,
    likes: [],
    comments: [],
    cryptoTags: ["TPF"],
    trend: "up",
  },
]

interface FiSquareProps {
  userAddress: string
}

export default function FiSquare({ userAddress }: FiSquareProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<SquareTab>("recent")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [communityStats, setCommunityStats] = useState({
    activeUsers: 1,
    registeredUsers: 1,
  })

  // Efeito para criar um perfil de usuário padrão e carregar dados simulados
  useEffect(() => {
    // Função para carregar dados (com fallback para dados simulados)
    const loadData = async () => {
      try {
        console.log("Loading FiSquare data for address:", userAddress)

        // Criar perfil de usuário padrão
        const defaultProfile: UserProfile = {
          address: userAddress,
          nickname: null,
          profilePicture: null,
          isAdmin: userAddress.toLowerCase() === "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677".toLowerCase(),
          createdAt: Date.now(),
          followers: [],
          following: [],
          postCount: 0,
        }

        setUserProfile(defaultProfile)

        // Usar dados simulados para garantir que algo seja exibido
        setPosts(MOCK_POSTS)

        // Tentar carregar dados reais do Firebase (opcional)
        try {
          // Aqui você pode adicionar chamadas para carregar dados reais
          // Se falhar, já temos os dados simulados como fallback
        } catch (firebaseError) {
          console.error("Error loading data from Firebase:", firebaseError)
          // Não definimos erro aqui, pois já temos dados simulados
        }
      } catch (error) {
        console.error("Error in loadData:", error)
        setError(
          error instanceof Error ? error.message : t("error_loading_data", "Failed to load data. Please try again."),
        )
      } finally {
        // Garantir que o estado de carregamento seja sempre desativado
        setIsLoading(false)
      }
    }

    // Adicionar um timeout para garantir que o carregamento termine mesmo se algo der errado
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Loading timeout reached, forcing render with mock data")
        setIsLoading(false)
      }
    }, 5000) // 5 segundos de timeout

    // Carregar dados
    loadData()

    // Limpar timeout quando o componente for desmontado
    return () => clearTimeout(loadingTimeout)
  }, [userAddress, t])

  // Verificar se o usuário está banido (sempre falso nesta versão simplificada)
  const isBanned = false

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
              setIsLoading(true)
              // Recarregar a página para tentar novamente
              window.location.reload()
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
          <RecentPosts userAddress={userAddress} userProfile={userProfile} isBanned={isBanned} initialPosts={posts} />
        )}

        {activeTab === "popular" && (
          <PopularPosts userAddress={userAddress} userProfile={userProfile} isBanned={isBanned} initialPosts={posts} />
        )}

        {activeTab === "market" && (
          <MarketPosts userAddress={userAddress} userProfile={userProfile} isBanned={isBanned} initialPosts={posts} />
        )}
      </motion.div>
    </div>
  )
}
