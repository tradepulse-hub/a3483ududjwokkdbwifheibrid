"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { Post, UserProfile } from "@/types/square"
import { getPosts } from "@/lib/squareStorage"
import { SUPPORTED_CRYPTOS, filterPostsByCrypto } from "@/lib/squareService"
import PostItem from "./PostItem"
import CreatePostForm from "./CreatePostForm"

interface MarketPostsProps {
  userAddress: string
  userProfile: UserProfile | null
  isBanned: boolean
}

export default function MarketPosts({ userAddress, userProfile, isBanned }: MarketPostsProps) {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<string>("ALL")
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true)
      try {
        // Buscar todos os posts
        const allPosts = await getPosts()

        // Filtrar por criptomoeda selecionada (se não for "ALL")
        if (selectedCrypto === "ALL") {
          setPosts(allPosts)
        } else {
          const filteredPosts = filterPostsByCrypto(allPosts, selectedCrypto)
          setPosts(filteredPosts)
        }
      } catch (error) {
        console.error("Error loading market posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [selectedCrypto, refreshTrigger])

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handlePostDeleted = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Seletor de criptomoedas */}
      <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50 mb-3 overflow-x-auto">
        <div className="flex gap-1 whitespace-nowrap">
          <button
            onClick={() => setSelectedCrypto("ALL")}
            className={`px-2 py-1 rounded-full text-xs transition-colors ${
              selectedCrypto === "ALL" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t("all", "All")}
          </button>

          {SUPPORTED_CRYPTOS.map((crypto) => (
            <button
              key={crypto}
              onClick={() => setSelectedCrypto(crypto)}
              className={`px-2 py-1 rounded-full text-xs transition-colors ${
                selectedCrypto === crypto ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              #{crypto}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário de criação de post (se não estiver banido) */}
      {!isBanned && <CreatePostForm userAddress={userAddress} onPostCreated={handlePostCreated} />}

      {/* Lista de posts */}
      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              currentUserAddress={userAddress}
              currentUserProfile={userProfile}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 text-center">
          <p className="text-gray-300 text-sm mb-1">
            {selectedCrypto === "ALL"
              ? t("no_posts_yet", "No posts yet")
              : t("no_posts_for_crypto", "No posts for #{crypto} yet").replace("{crypto}", selectedCrypto)}
          </p>
          <p className="text-gray-400 text-xs">{t("be_first_to_post", "Be the first to post!")}</p>
        </div>
      )}
    </div>
  )
}
