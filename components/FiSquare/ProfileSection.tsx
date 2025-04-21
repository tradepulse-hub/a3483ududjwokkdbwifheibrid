"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/languageContext"
import type { UserProfile } from "@/types/square"
import { saveProfile } from "@/lib/squareStorage"
import { getDefaultProfilePicture, isAdmin } from "@/lib/squareService"
import { motion } from "framer-motion"

interface ProfileSectionProps {
  userProfile: UserProfile | null
  currentUserAddress: string
  onProfileUpdate?: (updatedProfile: UserProfile) => void
}

export default function ProfileSection({ userProfile, currentUserAddress, onProfileUpdate }: ProfileSectionProps) {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(userProfile?.nickname || "")
  const [profilePicture, setProfilePicture] = useState<string | null>(userProfile?.profilePicture || null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!userProfile) return null

  const handleSaveProfile = async () => {
    if (!userProfile) return

    setIsSaving(true)
    setError(null)

    try {
      const updatedProfile = {
        ...userProfile,
        nickname: nickname.trim() || null,
        profilePicture,
      }

      // Salvar no Firebase
      await saveProfile(updatedProfile)

      // Notificar o componente pai sobre a atualização
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile)
      }

      setIsEditing(false)
    } catch (err) {
      console.error("Error saving profile:", err)
      setError(t("error_saving_profile", "Failed to save profile. Please try again."))
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="relative">
      {/* Background gradient banner */}
      <div className="h-16 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-size-200"></div>
      </div>

      {isEditing ? (
        // Modo de edição compacto
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 -mt-8 relative z-10">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg">
            <h3 className="text-sm font-semibold text-white mb-2">{t("edit_profile", "Edit Profile")}</h3>

            {error && (
              <div className="bg-red-900/30 text-red-300 text-xs p-2 rounded-md mb-3 border border-red-800/50">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">{t("nickname", "Nickname")}</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-900/80 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={t("nickname", "Nickname")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  {t("profile_picture", "Profile Picture")}
                </label>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    <Image
                      src={profilePicture || getDefaultProfilePicture(userProfile.address)}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md cursor-pointer transition-colors">
                    {t("attach_image", "Attach Image")}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors"
                  disabled={isSaving}
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors flex items-center"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("saving", "Saving...")}
                    </>
                  ) : (
                    t("save_profile", "Save Profile")
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        // Modo de visualização compacto
        <div className="flex items-center px-3 py-2 -mt-8 relative z-10">
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-800 shadow-lg">
              <Image
                src={userProfile.profilePicture || getDefaultProfilePicture(userProfile.address)}
                alt="Profile"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            {isAdmin(userProfile.address) && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-xs text-white px-1 py-0.5 rounded-full border border-gray-800 text-[10px]">
                {t("admin_badge", "Admin")}
              </div>
            )}
          </div>

          <div className="flex-1 ml-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm">
                  {userProfile.nickname ||
                    userProfile.address.substring(0, 6) +
                      "..." +
                      userProfile.address.substring(userProfile.address.length - 4)}
                </h3>
                <p className="text-xs text-gray-400">
                  {userProfile.followers.length} {t("followers", "Followers")} · {userProfile.following.length}{" "}
                  {t("following", "Following")}
                </p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="text-xs bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 px-2 py-1 rounded-md transition-colors border border-gray-700/50"
              >
                {t("edit_profile", "Edit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
