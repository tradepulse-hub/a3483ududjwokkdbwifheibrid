"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/languageContext"
import type { UserProfile, Post } from "@/types/square"
import { getPosts, followUser, unfollowUser } from "@/lib/squareStorage"
import { getDefaultProfilePicture, formatDate, isAdmin } from "@/lib/squareService"
import PostItem from "./PostItem"
import { motion } from "framer-motion"

interface UserProfileModalProps {
  userProfile: UserProfile
  currentUserAddress: string
  onClose: () => void
}

export default function UserProfileModal({ userProfile, currentUserAddress, onClose }: UserProfileModalProps) {
  const { t } = useLanguage()
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null)

  // Verificar se o usuário atual está seguindo o perfil exibido
  useEffect(() => {
    setIsFollowing(userProfile.followers.includes(currentUserAddress))
  }, [userProfile.followers, currentUserAddress])

  // Buscar posts do usuário
  useEffect(() => {
    const allPosts = getPosts()
    const filteredPosts = allPosts.filter((post) => post.authorAddress === userProfile.address)
    // Ordenar por data (mais recentes primeiro)
    filteredPosts.sort((a, b) => b.createdAt - a.createdAt)
    setUserPosts(filteredPosts)
  }, [userProfile.address])

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [onClose])

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(currentUserAddress, userProfile.address)
      setIsFollowing(false)
    } else {
      followUser(currentUserAddress, userProfile.address)
      setIsFollowing(true)
    }
  }

  const handlePostDeleted = () => {
    // Atualizar a lista de posts quando um post for excluído
    const allPosts = getPosts()
    const filteredPosts = allPosts.filter((post) => post.authorAddress === userProfile.address)
    filteredPosts.sort((a, b) => b.createdAt - a.createdAt)
    setUserPosts(filteredPosts)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 rounded-xl border border-gray-700/50 shadow-2xl w-full max-w-md mx-4 my-8 relative z-10 max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho com botão de fechar */}
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={onClose}
            className="bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 p-1 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Banner e foto de perfil - versão mais compacta */}
        <div className="relative">
          <div className="h-24 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-size-200"></div>
          </div>

          <div className="absolute left-3 -bottom-8">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-900 shadow-xl">
              <Image
                src={userProfile.profilePicture || getDefaultProfilePicture(userProfile.address)}
                alt="Profile"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            {isAdmin(userProfile.address) && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[8px] text-white px-1 py-0.5 rounded-full border border-gray-800">
                {t("admin_badge", "Admin")}
              </div>
            )}
          </div>
        </div>

        {/* Informações do perfil - mais compactas */}
        <div className="pt-10 px-3 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-bold text-white">
                {userProfile.nickname ||
                  userProfile.address.substring(0, 6) +
                    "..." +
                    userProfile.address.substring(userProfile.address.length - 4)}
              </h2>
              <p className="text-[10px] text-gray-400">
                {t("user_since", "User since {date}").replace("{date}", formatDate(userProfile.createdAt))}
              </p>
            </div>

            {userProfile.address !== currentUserAddress && (
              <button
                onClick={handleFollowToggle}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isFollowing ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isFollowing ? t("unfollow", "Unfollow") : t("follow", "Follow")}
              </button>
            )}
          </div>

          {/* Estatísticas - mais compactas */}
          <div className="flex justify-around mt-3 bg-gray-800/50 rounded-lg p-2 border border-gray-700/30">
            <div className="text-center">
              <div className="text-sm font-bold text-white">{userProfile.postCount}</div>
              <div className="text-[10px] text-gray-400">{t("posts", "Posts")}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">{userProfile.followers.length}</div>
              <div className="text-[10px] text-gray-400">{t("followers", "Followers")}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">{userProfile.following.length}</div>
              <div className="text-[10px] text-gray-400">{t("following", "Following")}</div>
            </div>
          </div>

          {/* Endereço da carteira - mais compacto */}
          <div className="mt-2 bg-gray-800/50 rounded-lg p-2 border border-gray-700/30">
            <p className="text-[10px] text-gray-400 mb-0.5">{t("wallet_address", "Wallet Address")}</p>
            <p className="text-[10px] font-mono text-gray-300 break-all">{userProfile.address}</p>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-700/30 my-1"></div>

        {/* Posts do usuário - com rolagem própria */}
        <div className="px-3 pb-3 flex-1 overflow-hidden">
          <h3 className="text-sm font-semibold text-white mb-2">{t("user_posts", "Posts")}</h3>

          <div className="overflow-y-auto max-h-[calc(85vh-220px)] pr-1 -mr-1">
            {userPosts.length > 0 ? (
              <div className="space-y-2">
                {userPosts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    currentUserAddress={currentUserAddress}
                    currentUserProfile={currentUserProfile}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700/30">
                <p className="text-gray-400 text-xs">{t("no_posts_yet", "No posts yet")}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
