"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export default function RecentPosts() {
  const { t } = useTranslation()

  useEffect(() => {
    console.log("RecentPosts component mounted")
    return () => {
      console.log("RecentPosts component unmounted")
    }
  }, [])

  return (
    <div className="p-4">
      <p>{t("This feature has been removed")}</p>
    </div>
  )
}
