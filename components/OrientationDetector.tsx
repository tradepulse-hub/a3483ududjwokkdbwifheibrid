"use client"

import { useState, useEffect } from "react"

export default function OrientationDetector() {
  const [isLandscape, setIsLandscape] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Verificar se estamos em um dispositivo móvel
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (!isMobile) return

    const checkOrientation = () => {
      const isLandscapeNow = window.innerWidth > window.innerHeight
      setIsLandscape(isLandscapeNow)
      setShowWarning(isLandscapeNow)
    }

    // Verificar orientação inicial
    checkOrientation()

    // Adicionar listener para mudanças de orientação
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  // Esconder o aviso após 5 segundos
  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => {
        setShowWarning(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showWarning])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-lg p-4 max-w-xs text-center">
        <div className="text-yellow-400 text-4xl mb-2">📱</div>
        <h3 className="text-white font-bold text-lg mb-2">Modo retrato recomendado</h3>
        <p className="text-gray-300 text-sm mb-4">
          Para uma melhor experiência, recomendamos usar o aplicativo no modo retrato.
        </p>
        <button
          onClick={() => setShowWarning(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Entendi
        </button>
      </div>
    </div>
  )
}
