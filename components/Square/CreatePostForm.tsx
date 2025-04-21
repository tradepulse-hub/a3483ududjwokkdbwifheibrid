"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "@/lib/languageContext"
import { createPost } from "@/lib/squareStorage"
import { extractHashtags, SUPPORTED_CRYPTOS, isCryptoSupported } from "@/lib/squareService"
import { motion } from "framer-motion"

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
  const [isExpanded, setIsExpanded] = useState(false)

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
    setIsExpanded(false)

    // Notificar que um post foi criado
    onPostCreated()
  }

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700/50 mb-3 overflow-hidden">
      {!isExpanded ? (
        // Versão compacta
        <div className="p-3 cursor-pointer" onClick={() => setIsExpanded(true)}>
          <div className="flex items-center">
            <div className="flex-1 bg-gray-900/80 border border-gray-700 rounded-full px-4 py-1.5 text-gray-400 text-sm">
              {t("write_something", "Write something...")}
            </div>
            <button className="ml-2 p-1.5 bg-blue-600 rounded-full text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        // Versão expandida
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-3"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("write_something", "Write something...")}
            className="w-full px-3 py-2 bg-gray-900/80 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-none"
            autoFocus
          />

          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {images.map((img, index) => (
                <div key={index} className="relative w-14 h-14 rounded overflow-hidden">
                  <img src={img || "/placeholder.svg"} alt="Uploaded" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setImages(images.filter((_, i) => i !== index))
                    }}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between mt-2">
            <div className="flex space-x-1">
              <label className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md cursor-pointer transition-colors text-xs">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              <button
                onClick={() => setTrend(trend === "up" ? null : "up")}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  trend === "up" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title={t("trending_up", "Trending Up")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17h4l3-6 4 11 3-5h4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5-5 9 9" />
                </svg>
              </button>

              <button
                onClick={() => setTrend(trend === "down" ? null : "down")}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  trend === "down" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title={t("trending_down", "Trending Down")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l3 6 4-11 3 5h4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l5-5 9-9" />
                </svg>
              </button>
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors"
              >
                {t("cancel", "Cancel")}
              </button>

              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className={`px-3 py-1 rounded-md text-white text-xs transition-colors ${
                  !content.trim() || isSubmitting ? "bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                    {t("posting", "Posting...")}
                  </span>
                ) : (
                  t("post", "Post")
                )}
              </button>
            </div>
          </div>

          {/* Mostrar criptomoedas suportadas */}
          <div className="mt-2 text-[10px] text-gray-500 flex flex-wrap gap-1">
            {SUPPORTED_CRYPTOS.map((crypto) => (
              <span key={crypto} className="bg-gray-800 px-1 py-0.5 rounded">
                #{crypto}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
