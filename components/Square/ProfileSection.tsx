"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/languageContext"
import type { UserProfile } from "@/types/square"
import { saveProfile } from "@/lib/squareStorage"
import { getDefaultProfilePicture, isAdmin } from "@/lib/squareService"

interface ProfileSectionProps {
  userProfile: UserProfile | null
  currentUserAddress: string
}

export default function ProfileSection({ userProfile, currentUserAddress }: ProfileSectionProps) {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(userProfile?.nickname || "")
  const [profilePicture, setProfilePicture] = useState<string | null>(userProfile?.profilePicture || null)

  if (!userProfile) return null

  const handleSaveProfile = () => {
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        nickname: nickname.trim() || null,
        profilePicture,
      }
      saveProfile(updatedProfile)
      setIsEditing(false)
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
    <div className="bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
      {isEditing ? (
        // Modo de edição
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-3">{t("edit_profile", "Edit Profile")}</h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t("nickname", "Nickname")}</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("nickname", "Nickname")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t("profile_picture", "Profile Picture")}
            </label>
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                <Image
                  src={profilePicture || getDefaultProfilePicture(userProfile.address)}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                {t("attach_image", "Attach Image")}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {t("cancel", "Cancel")}
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {t("save_profile", "Save Profile")}
            </button>
          </div>
        </div>
      ) : (
        // Modo de visualização
        <div className="flex items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 mr-4">
              <Image
                src={userProfile.profilePicture || getDefaultProfilePicture(userProfile.address)}
                alt="Profile"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            {isAdmin(userProfile.address) && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-xs text-white px-1.5 py-0.5 rounded-full border border-gray-800">
                {t("admin_badge", "Admin")}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">
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
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg transition-colors"
              >
                {t("edit_profile", "Edit Profile")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
