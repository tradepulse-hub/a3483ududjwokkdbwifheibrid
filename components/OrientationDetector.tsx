"use client"

import { useState, useEffect } from "react"

export default function OrientationDetector() {
  const [isLandscape, setIsLandscape] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [initialOrientation, setInitialOrientation] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar se estamos em um dispositivo móvel
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (!isMobile) return

    // Capturar a orientação inicial
    const initialIsLandscape = window.innerWidth > window.innerHeight
    setInitialOrientation(initialIsLandscape)

    // Só mostrar o aviso se realmente estiver em modo paisagem
    if (initialIsLandscape) {
      setIsLandscape(true)
      setShowWarning(true)
    }

    // Função para verificar a orientação real do dispositivo, não apenas as dimensões da janela
    const checkOrientation = () => {
      // Usar a API de orientação do dispositivo quando disponível
      if (window.screen && window.screen.orientation) {
        const type = window.screen.orientation.type
        const isLandscapeNow = type.includes("landscape")

        // Só atualizar se a orientação realmente mudou
        if (isLandscapeNow !== isLandscape) {
          setIsLandscape(isLandscapeNow)
          setShowWarning(isLandscapeNow)
        }
      } else {
        // Fallback para dispositivos que não suportam a API de orientação
        // Ignorar mudanças pequenas que podem ser causadas pelo teclado virtual
        const currentIsLandscape = window.innerWidth > window.innerHeight

        // Só mostrar o aviso se a orientação realmente mudou em relação à inicial
        if (currentIsLandscape !== initialOrientation) {
          setIsLandscape(currentIsLandscape)
          setShowWarning(currentIsLandscape)
        }
      }
    }

    // Verificar orientação apenas em eventos de orientationchange, não em resize
    window.addEventListener("orientationchange", checkOrientation)

    return () => {
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [isLandscape, initialOrientation])

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
