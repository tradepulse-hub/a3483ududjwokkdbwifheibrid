"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { getRecentPosts, refreshCache } from "@/lib/worldChainStorage"
import type { Post } from "@/types/square"
import PostCard from "./PostCard"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function RecentPosts() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchPosts = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && loading) return

      setRefreshing(forceRefresh)
      if (forceRefresh) {
        setLoading(true)
      }
      setError(null)

      // If forcing a refresh, clear the cache first
      if (forceRefresh) {
        await refreshCache()
        toast({
          title: t("Refreshing posts"),
          description: t("Fetching the latest posts from the blockchain..."),
          duration: 3000,
        })
      }

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          setError(t("Loading posts is taking longer than expected. Please try refreshing."))
          setLoading(false)
          setRefreshing(false)
        }
      }, 15000)

      // Fetch posts with a small delay to ensure blockchain sync
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const fetchedPosts = await getRecentPosts()

      console.log(`Fetched ${fetchedPosts.length} posts:`, fetchedPosts)
      setPosts(fetchedPosts)
      setLastRefresh(new Date())

      clearTimeout(timeoutId)
      setLoading(false)
      setRefreshing(false)

      if (forceRefresh) {
        toast({
          title: t("Posts refreshed"),
          description: t("Successfully loaded the latest posts"),
          duration: 3000,
        })
      }
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError(t("Failed to load posts. Please try again."))
      setLoading(false)
      setRefreshing(false)

      if (forceRefresh) {
        toast({
          title: t("Error"),
          description: t("Failed to refresh posts. Please try again."),
          variant: "destructive",
          duration: 3000,
        })
      }
    }
  }

  useEffect(() => {
    fetchPosts()

    // Set up a refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchPosts(true)
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const handleRefresh = () => {
    fetchPosts(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("Recent Posts")}</h2>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              {t("Last updated")}: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("Refreshing...")}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("Refresh")}
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !refreshing ? (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-center text-sm text-gray-500">{t("Loading posts...")}</p>
        </div>
      ) : posts.length === 0 && !error ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">{t("No posts yet. Be the first to post!")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={handleRefresh} />
          ))}
        </div>
      )}
    </div>
  )
}
