"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"

interface CreatePostFormProps {
  userAddress?: string
  onPostCreated?: () => void
}

export default function CreatePostForm({ userAddress, onPostCreated }: CreatePostFormProps) {
  const { t } = useTranslation()

  useEffect(() => {
    console.log("CreatePostForm component mounted")
    return () => {
      console.log("CreatePostForm component unmounted")
    }
  }, [])

  return (
    <div className="p-4">
      <p>{t("This feature has been removed")}</p>
    </div>
  )
}
