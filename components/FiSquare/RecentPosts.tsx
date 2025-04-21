"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { Post, UserProfile } from "@/types/square"
import { getPosts, createPost } from "@/lib/squareStorage"
import { sortPostsByDate } from "@/lib/squareService"
import PostItem from "./PostItem"
import CreatePostForm from "./CreatePostForm"

interface RecentPostsProps {
  userAddress: string
  userProfile: UserProfile | null
  isBanned: boolean
  onPostCreated?: () => void
}

export default function RecentPosts({ userAddress, userProfile, isBanned, onPostCreated }: RecentPostsProps) {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const isMountedRef = useRef(true)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Limpar referências quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  // Carregar posts
  useEffect(() => {
    async function loadPosts() {
      if (!isMountedRef.current) return

      console.log("Loading recent posts")
      setIsLoading(true)
      setError(null)

      // Definir timeout para garantir que o carregamento termine
      loadingTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && isLoading) {
          console.log("Loading timeout reached, forcing render with empty posts")
          setIsLoading(false)
        }
      }, 3000)

      try {
        // Buscar posts e ordenar por data (mais recentes primeiro)
        console.log("Fetching posts")
        const allPosts = await getPosts()
        console.log(`Fetched ${allPosts.length} posts`)

        if (!isMountedRef.current) return

        const sortedPosts = sortPostsByDate(allPosts)
        console.log("Posts sorted by date")

        setPosts(sortedPosts)
      } catch (error) {
        console.error("Error loading recent posts:", error)
        if (isMountedRef.current) {
          setError(t("failed_to_load_posts", "Failed to load posts. Please try again."))
        }
      } finally {
        // Limpar timeout
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }

        // Garantir que o estado de carregamento seja desativado mesmo em caso de erro
        if (isMountedRef.current) {
          setIsLoading(false)
          console.log("Recent posts loading complete")
        }
      }
    }

    loadPosts()
  }, [refreshTrigger, t])

  // Função para lidar com a criação de posts
  const handlePostCreated = async (postData: Omit<Post, "id" | "likes" | "comments">) => {
    try {
      console.log("Creating post in RecentPosts component")

      // Criar post no Firebase
      await createPost(postData)

      // Atualizar a lista de posts localmente para feedback imediato
      const newPost: Post = {
        ...postData,
        id: Date.now().toString(), // ID temporário
        likes: [],
        comments: [],
      }

      setPosts((prev) => sortPostsByDate([newPost, ...prev]))

      // Notificar o componente pai
      if (onPostCreated) {
        onPostCreated()
      }

      // Não atualizar o refreshTrigger aqui para evitar ciclos
    } catch (error) {
      console.error("Error creating post:", error)
      setError(t("failed_to_create_post", "Failed to create post. Please try again."))
    }
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
