"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { likePost, unlikePost } from "@/lib/worldChainStorage"
import type { Post } from "@/types/square"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

// Atualize a interface PostCardProps para incluir onPostUpdated
interface PostCardProps {
  post: Post
  onPostUpdated?: () => void
}

// Atualize a definição da função para incluir onPostUpdated
export default function PostCard({ post, onPostUpdated }: PostCardProps) {
  const { t } = useTranslation()
  const [isLiked, setIsLiked] = useState(false) // In a real app, check if the current user has liked the post
  const [likeCount, setLikeCount] = useState(post.likes.length)
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)

  // Atualize a função handleLikeToggle para chamar onPostUpdated
  const handleLikeToggle = async () => {
    try {
      setIsLiking(true)

      if (isLiked) {
        await unlikePost(post.id)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await likePost(post.id)
        setLikeCount((prev) => prev + 1)
      }

      setIsLiked(!isLiked)

      // Notify parent component that the post was updated
      if (onPostUpdated) {
        onPostUpdated()
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  // Extract crypto tags from content
  const renderContent = () => {
    if (!post.content) return null

    // Replace crypto tags with highlighted spans
    const parts = post.content.split(/(#\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <span key={index} className="text-primary font-medium">
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={`https://avatar.vercel.sh/${post.authorAddress}`} alt="Avatar" />
            <AvatarFallback>{post.authorAddress.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {post.authorAddress.substring(0, 6)}...{post.authorAddress.substring(38)}
            </h3>
            <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{t("More options")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>{t("Report")}</DropdownMenuItem>
            <DropdownMenuItem>{t("Copy link")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="whitespace-pre-wrap mb-3">{renderContent()}</p>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mt-3">
            {post.images.length === 1 ? (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative rounded-lg overflow-hidden cursor-pointer">
                    <img
                      src={post.images[0] || "/placeholder.svg"}
                      alt={t("Post image")}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <img src={post.images[0] || "/placeholder.svg"} alt={t("Post image")} className="w-full h-auto" />
                </DialogContent>
              </Dialog>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((img, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="relative rounded-lg overflow-hidden cursor-pointer aspect-square">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`${t("Post image")} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 3 && post.images.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-lg font-medium">+{post.images.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${t("Post image")} ${index + 1}`}
                        className="w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Crypto Tags */}
        {post.cryptoTags && post.cryptoTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.cryptoTags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
          onClick={handleLikeToggle}
          disabled={isLiking}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments?.length || 0}</span>
        </Button>

        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments Section (simplified) */}
      {showComments && (
        <div className="mt-4 pt-3 border-t">
          <h4 className="font-medium mb-2">{t("Comments")}</h4>
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://avatar.vercel.sh/${comment.authorAddress}`} alt="Avatar" />
                    <AvatarFallback>{comment.authorAddress.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted p-2 rounded-md">
                      <p className="text-xs font-medium">
                        {comment.authorAddress.substring(0, 6)}...{comment.authorAddress.substring(38)}
                      </p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("No comments yet")}</p>
          )}

          {/* Comment input (simplified) */}
          <div className="mt-3 flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <input
              type="text"
              placeholder={t("Add a comment...")}
              className="flex-1 bg-muted rounded-full px-3 py-1 text-sm"
            />
            <Button size="sm" variant="ghost">
              {t("Post")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
