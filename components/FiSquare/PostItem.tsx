"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/languageContext"
import type { Post, UserProfile } from "@/types/square"
import { getProfile, likePost, unlikePost, deletePost } from "@/lib/squareStorage"
import { getDisplayName, getDefaultProfilePicture, formatDate } from "@/lib/squareService"
import BanUserModal from "./BanUserModal"
import UserProfileModal from "./UserProfileModal"
import { motion } from "framer-motion"

interface PostItemProps {
  post: Post
  currentUserAddress: string
  currentUserProfile: UserProfile | null
  onPostDeleted?: () => void
}

export default function PostItem({ post, currentUserAddress, currentUserProfile, onPostDeleted }: PostItemProps) {
  const { t } = useLanguage()
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Buscar perfil do autor
  useEffect(() => {
    const profile = getProfile(post.authorAddress)
    setAuthorProfile(profile)
  }, [post.authorAddress])

  // Verificar se o usuário atual curtiu o post
  const isLiked = post.likes.includes(currentUserAddress)

  // Verificar se o usuário atual é o autor ou admin
  const isAuthor = post.authorAddress === currentUserAddress
  const isUserAdmin = currentUserProfile?.isAdmin || false
  const canModerate = isAuthor || isUserAdmin

  const handleLikeToggle = () => {
    if (isLiked) {
      unlikePost(post.id, currentUserAddress)
    } else {
      likePost(post.id, currentUserAddress)
    }
  }

  const handleDeletePost = () => {
    deletePost(post.id)
    setShowDeleteConfirm(false)
    if (onPostDeleted) onPostDeleted()
  }

  // Formatar conteúdo para destacar hashtags
  const formatContent = (content: string) => {
    return content.replace(/#(\w+)/g, '<span class="text-blue-400">#$1</span>')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700/50 mb-3 overflow-hidden"
    >
      {/* Cabeçalho do post */}
      <div className="flex items-center p-2 border-b border-gray-700/30">
        <div
          className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 mr-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowProfileModal(true)}
        >
          <Image
            src={authorProfile?.profilePicture || getDefaultProfilePicture(post.authorAddress)}
            alt="Profile"
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <h4
                className="font-medium text-white text-sm truncate cursor-pointer hover:underline"
                onClick={() => setShowProfileModal(true)}
              >
                {authorProfile ? getDisplayName(authorProfile) : post.authorAddress.substring(0, 6) + "..."}
              </h4>
              <p className="text-[10px] text-gray-400">{formatDate(post.createdAt)}</p>
            </div>

            {canModerate && (
              <div className="relative ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowOptions(!showOptions)
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-1 w-32 bg-gray-900 rounded-md shadow-lg border border-gray-700 z-10 text-xs">
                    {isUserAdmin && !isAuthor && (
                      <button
                        onClick={() => {
                          setShowBanModal(true)
                          setShowOptions(false)
                        }}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded-t-md"
                      >
                        {t("ban_user", "Ban User")}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true)
                        setShowOptions(false)
                      }}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800"
                    >
                      {t("delete_post", "Delete Post")}
                    </button>
                    <button
                      onClick={() => setShowOptions(false)}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-b-md"
                    >
                      {t("cancel", "Cancel")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo do post */}
      <div className="p-2">
        <p
          className="text-gray-200 text-sm whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        ></p>

        {/* Imagens anexadas - Dimensões maiores */}
        {post.images && post.images.length > 0 && (
          <div className="mt-2">
            {post.images.map((img, index) => (
              <div key={index} className="rounded-lg overflow-hidden mb-2 max-h-[400px]">
                <img
                  src={img || "/placeholder.svg"}
                  alt="Post attachment"
                  className="w-full h-auto object-contain max-h-[400px]"
                />
              </div>
            ))}
          </div>
        )}

        {/* Indicador de tendência */}
        {post.trend && (
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${
                post.trend === "up"
                  ? "bg-green-900/30 text-green-400 border border-green-700/50"
                  : "bg-red-900/30 text-red-400 border border-red-700/50"
              }`}
            >
              {post.trend === "up" ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2.5 w-2.5 mr-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  {t("trending_up", "Trending Up")}
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-2.5 w-2.5 mr-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {t("trending_down", "Trending Down")}
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Rodapé do post */}
      <div className="flex items-center justify-between text-xs text-gray-400 p-2 border-t border-gray-700/30">
        <div className="flex space-x-3">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center space-x-1 ${isLiked ? "text-red-400" : "hover:text-gray-300"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill={isLiked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{post.likes.length}</span>
          </button>

          <button className="flex items-center space-x-1 hover:text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.comments.length}</span>
          </button>
        </div>

        <div className="flex space-x-1 overflow-x-auto max-w-[50%]">
          {post.cryptoTags.map((tag) => (
            <span key={tag} className="text-blue-400 text-[10px] whitespace-nowrap">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-xs w-full">
            <h3 className="text-sm font-bold text-white mb-3">
              {t("delete_confirmation", "Are you sure you want to delete this post?")}
            </h3>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors"
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                onClick={handleDeletePost}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
              >
                {t("yes_delete", "Yes, Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de banimento */}
      {showBanModal && (
        <BanUserModal
          userAddress={post.authorAddress}
          adminAddress={currentUserAddress}
          onClose={() => setShowBanModal(false)}
        />
      )}

      {/* Modal de perfil do usuário */}
      {showProfileModal && authorProfile && (
        <UserProfileModal
          userProfile={authorProfile}
          currentUserAddress={currentUserAddress}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </motion.div>
  )
}
