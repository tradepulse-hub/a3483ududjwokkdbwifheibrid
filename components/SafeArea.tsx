"use client"

import { type ReactNode, useEffect, useState } from "react"

interface SafeAreaProps {
  children: ReactNode
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

export default function SafeArea({ children, top = true, bottom = true, left = true, right = true }: SafeAreaProps) {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  useEffect(() => {
    // Detectar se estamos em um ambiente iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

    if (isIOS) {
      // Obter as safe area insets se disponíveis
      const safeAreaNode = document.querySelector('meta[name="viewport-fit"]')
      if (safeAreaNode && window.CSS && window.CSS.supports("padding: env(safe-area-inset-top)")) {
        setSafeAreaInsets({
          top: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat") || "0"),
          bottom: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sab") || "0"),
          left: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sal") || "0"),
          right: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sar") || "0"),
        })
      }
    }
  }, [])

  return (
    <div
      style={{
        paddingTop: top ? `max(env(safe-area-inset-top), ${safeAreaInsets.top}px)` : 0,
        paddingBottom: bottom ? `max(env(safe-area-inset-bottom), ${safeAreaInsets.bottom}px)` : 0,
        paddingLeft: left ? `max(env(safe-area-inset-left), ${safeAreaInsets.left}px)` : 0,
        paddingRight: right ? `max(env(safe-area-inset-right), ${safeAreaInsets.right}px)` : 0,
      }}
    >
      {children}
    </div>
  )
}
