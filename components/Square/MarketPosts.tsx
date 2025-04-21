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
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Buscar todos os posts
    const allPosts = getPosts()

    // Filtrar por criptomoeda selecionada (se não for "ALL")
    if (selectedCrypto === "ALL") {
      setPosts(allPosts)
    } else {
      const filteredPosts = filterPostsByCrypto(allPosts, selectedCrypto)
      setPosts(filteredPosts)
    }
  }, [selectedCrypto, refreshTrigger])

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handlePostDeleted = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div>
      {/* Seletor de criptomoedas */}
      <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCrypto("ALL")}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              selectedCrypto === "ALL" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t("all", "All")}
          </button>

          {SUPPORTED_CRYPTOS.map((crypto) => (
            <button
              key={crypto}
              onClick={() => setSelectedCrypto(crypto)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
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
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 text-center">
          <p className="text-gray-300 mb-2">
            {selectedCrypto === "ALL"
              ? t("no_posts_yet", "No posts yet")
              : t("no_posts_for_crypto", "No posts for #{crypto} yet").replace("{crypto}", selectedCrypto)}
          </p>
          <p className="text-gray-400 text-sm">{t("be_first_to_post", "Be the first to post!")}</p>
        </div>
      )}
    </div>
  )
}
