"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { Post, UserProfile } from "@/types/square"
import { getPopularPosts } from "@/lib/localStorageService"
import PostItem from "./PostItem"
import CreatePostForm from "./CreatePostForm"

interface PopularPostsProps {
  userAddress: string
  userProfile: UserProfile | null
  isBanned: boolean
  onRefresh?: () => void
}

export default function PopularPosts({ userAddress, userProfile, isBanned, onRefresh }: PopularPostsProps) {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const isMountedRef = useRef(true)

  // Limpar referências quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Carregar posts
  useEffect(() => {
    async function loadPosts() {
      if (!isMountedRef.current) return

      console.log("Loading popular posts")
      setIsLoading(true)
      setError(null)

      try {
        // Buscar posts populares do localStorage (instantâneo)
        const popularPosts = getPopularPosts()
        console.log(`Loaded ${popularPosts.length} popular posts from localStorage`)

        if (isMountedRef.current) {
          setPosts(popularPosts)
        }
      } catch (error) {
        console.error("Error loading popular posts:", error)
        if (isMountedRef.current) {
          setError(t("failed_to_load_posts", "Failed to load posts. Please try again."))
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
          console.log("Popular posts loading complete")
        }
      }
    }

    // Carregar posts imediatamente
    loadPosts()
  }, [refreshTrigger, t])

  // Função para lidar com a criação de posts
  const handlePostCreated = () => {
    console.log("Post created, refreshing")
    setRefreshTrigger((prev) => prev + 1)
    if (onRefresh) onRefresh()
  }

  const handlePostDeleted = () => {
    console.log("Post deleted, refreshing")
    setRefreshTrigger((prev) => prev + 1)
    if (onRefresh) onRefresh()
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
          <p className="text-gray-300 text-sm mb-1">{t("no_posts_yet", "No posts yet")}</p>
          <p className="text-gray-400 text-xs">{t("be_first_to_post", "Be the first to post!")}</p>
        </div>
      )}
    </div>
  )
}
