"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/languageContext"
import type { Post, UserProfile } from "@/types/square"
import { getPosts } from "@/lib/squareStorage"
import { sortPostsByPopularity } from "@/lib/squareService"
import PostItem from "./PostItem"
import CreatePostForm from "./CreatePostForm"

interface PopularPostsProps {
  userAddress: string
  userProfile: UserProfile | null
  isBanned: boolean
}

export default function PopularPosts({ userAddress, userProfile, isBanned }: PopularPostsProps) {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Buscar posts e ordenar por popularidade (mais curtidos primeiro)
    const allPosts = getPosts()
    const sortedPosts = sortPostsByPopularity(allPosts)
    setPosts(sortedPosts)
  }, [refreshTrigger])

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handlePostDeleted = () => {
    setRefreshTrigger((prev) => prev + 1)
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
