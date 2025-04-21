"use client"

import type React from "react"

import { useState } from "react"
import { useLanguage } from "@/lib/languageContext"
import { createPost } from "@/lib/squareStorage"
import { extractHashtags, SUPPORTED_CRYPTOS, isCryptoSupported } from "@/lib/squareService"

interface CreatePostFormProps {
  userAddress: string
  onPostCreated: () => void
}

export default function CreatePostForm({ userAddress, onPostCreated }: CreatePostFormProps) {
  const { t } = useLanguage()
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [trend, setTrend] = useState<"up" | "down" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages([...images, reader.result as string])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!content.trim()) return

    setIsSubmitting(true)

    // Extrair hashtags de criptomoedas
    const allTags = extractHashtags(content)
    const cryptoTags = allTags.filter((tag) => isCryptoSupported(tag))

    // Criar o post
    createPost({
      authorAddress: userAddress,
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
      cryptoTags,
      trend,
    })

    // Limpar o formulário
    setContent("")
    setImages([])
    setTrend(null)
    setIsSubmitting(false)

    // Notificar que um post foi criado
    onPostCreated()
  }

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">{t("create_post", "Create Post")}</h3>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("write_something", "Write something...")}
        className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
      />

      {images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative w-16 h-16 rounded overflow-hidden">
              <img src={img || "/placeholder.svg"} alt="Uploaded" className="w-full h-full object-cover" />
              <button
                onClick={() => setImages(images.filter((_, i) => i !== index))}
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between mt-3">
        <div className="flex space-x-2">
          <label className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition-colors text-sm">
            {t("attach_image", "Attach Image")}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <div className="flex space-x-1">
            <button
              onClick={() => setTrend(trend === "up" ? null : "up")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                trend === "up" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {t("trending_up", "Trending Up")}
            </button>
            <button
              onClick={() => setTrend(trend === "down" ? null : "down")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                trend === "down" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {t("trending_down", "Trending Down")}
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className={`px-4 py-1.5 rounded-lg text-white text-sm transition-colors ${
            !content.trim() || isSubmitting ? "bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("posting", "Posting...")}
            </span>
          ) : (
            t("post", "Post")
          )}
        </button>
      </div>

      {/* Mostrar criptomoedas suportadas */}
      <div className="mt-3 text-xs text-gray-400">
        {t("supported_cryptos", "Supported cryptocurrencies:")}{" "}
        {SUPPORTED_CRYPTOS.map((crypto) => `#${crypto}`).join(", ")}
      </div>
    </div>
  )
}
