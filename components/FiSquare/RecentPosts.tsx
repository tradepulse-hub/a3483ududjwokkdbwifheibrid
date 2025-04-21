"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Loader2 } from "lucide-react"
import { getRecentPosts, refreshCache } from "@/lib/worldChainStorage"
import type { Post } from "@/types/square"
import PostCard from "./PostCard"
import { Button } from "@/components/ui/button"

export default function RecentPosts() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPosts = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      if (forceRefresh) {
        setRefreshing(true)
        await refreshCache()
      }

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          setError(t("Loading posts is taking longer than expected. Please try refreshing."))
          setLoading(false)
        }
      }, 15000)

      const fetchedPosts = await getRecentPosts()
      setPosts(fetchedPosts)

      clearTimeout(timeoutId)
      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError(t("Failed to load posts. Please try again."))
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleRefresh = () => {
    fetchPosts(true)
  }

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-center text-sm text-gray-500">{t("Loading posts...")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("Recent Posts")}</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("Refreshing...")}
            </>
          ) : (
            t("Refresh")
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{t("Error")}</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && posts.length === 0 && !error ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">{t("No posts yet. Be the first to post!")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
