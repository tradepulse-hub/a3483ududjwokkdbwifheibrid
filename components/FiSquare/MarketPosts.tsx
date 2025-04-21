"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { Post, UserProfile } from "@/types/square"
import { SUPPORTED_CRYPTOS, filterPostsByCrypto } from "@/lib/squareService"
import PostItem from "./PostItem"
import CreatePostForm from "./CreatePostForm"

interface MarketPostsProps {
  userAddress: string
  userProfile: UserProfile | null
  isBanned: boolean
  initialPosts?: Post[] // Adicionado para aceitar posts iniciais
}

export default function MarketPosts({ userAddress, userProfile, isBanned, initialPosts = [] }: MarketPostsProps) {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [selectedCrypto, setSelectedCrypto] = useState<string>("ALL")
  const [isLoading, setIsLoading] = useState(false) // Começar como false já que temos posts iniciais
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Filtrar posts por criptomoeda selecionada quando os posts iniciais ou a criptomoeda selecionada mudarem
  useEffect(() => {
    if (initialPosts.length > 0) {
      if (selectedCrypto === "ALL") {
        setPosts(initialPosts)
      } else {
        const filteredPosts = filterPostsByCrypto(initialPosts, selectedCrypto)
        setPosts(filteredPosts)
      }
    }
  }, [initialPosts, selectedCrypto])

  const handlePostCreated = (newPost: Post) => {
    console.log("Post created, adding to list")
    // Adicionar o novo post apenas se corresponder ao filtro atual
    if (selectedCrypto === "ALL" || newPost.cryptoTags.includes(selectedCrypto)) {
      setPosts((prevPosts) => [newPost, ...prevPosts])
    }
  }

  const handlePostDeleted = (postId: string) => {
    console.log("Post deleted, removing from list")
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4 text-center">
        <p className="text-red-300 text-sm mb-2">{error}</p>
        <button
          onClick={() => {
            setError(null)
            setRefreshTrigger((prev) => prev + 1)
          }}
          className="text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded-md"
        >
          {t("try_again", "Try Again")}
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
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
              onPostDeleted={() => handlePostDeleted(post.id)}
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
