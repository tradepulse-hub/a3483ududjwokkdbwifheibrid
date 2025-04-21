"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { refreshCache } from "@/lib/worldChainStorage"
import CreatePostForm from "./CreatePostForm"
import RecentPosts from "./RecentPosts"
import SyncStatus from "./SyncStatus"

export default function FiSquarePage() {
  const { t } = useTranslation()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePostCreated = () => {
    // Trigger a refresh when a post is created
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleForceSync = async () => {
    await refreshCache()
    // Trigger a refresh after sync
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{t("FiSquare")}</h1>

      <SyncStatus onSync={handleForceSync} />

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="posts">{t("Posts")}</TabsTrigger>
          <TabsTrigger value="create">{t("Create Post")}</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <RecentPosts key={`posts-${refreshTrigger}`} />
        </TabsContent>

        <TabsContent value="create">
          <CreatePostForm onPostCreated={handlePostCreated} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
