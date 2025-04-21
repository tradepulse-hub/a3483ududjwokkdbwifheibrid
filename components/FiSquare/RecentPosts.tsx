"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { Post, UserProfile } from "@/types/square"
import { getPosts } from "@/lib/squareStorage"
import { sortPostsByDate } from "@/lib/squareService"
import PostItem from "./PostItem"
import CreatePostForm from "./CreatePostForm"

interface RecentPostsProps {
  userAddress: string
  userProfile: UserProfile | null
  isBanned: boolean
}

export default function RecentPosts({ userAddress, userProfile, isBanned }: RecentPostsProps) {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    async function loadPosts() {
      console.log("Loading recent posts")
      setIsLoading(true)
      setError(null)

      try {
        // Buscar posts e ordenar por data (mais recentes primeiro)
        console.log("Fetching posts")
        const allPosts = await getPosts()
        console.log(`Fetched ${allPosts.length} posts`)

        const sortedPosts = sortPostsByDate(allPosts)
        console.log("Posts sorted by date")

        setPosts(sortedPosts)
      } catch (error) {
        console.error("Error loading recent posts:", error)
        setError(t("failed_to_load_posts", "Failed to load posts. Please try again."))
      } finally {
        // Garantir que o estado de carregamento seja desativado mesmo em caso de erro
        setIsLoading(false)
        console.log("Recent posts loading complete")
      }
    }

    loadPosts()
  }, [refreshTrigger, t])

  const handlePostCreated = () => {
    console.log("Post created, refreshing")
    setRefreshTrigger((prev) => prev + 1)
  }

  const handlePostDeleted = () => {
    console.log("Post deleted, refreshing")
    setRefreshTrigger((prev) => prev + 1)
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
