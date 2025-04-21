"use client"

import { useState, useEffect } from "react"

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isEdge: boolean
  isMobileApp: boolean
  isStandalone: boolean
}

export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    isEdge: false,
    isMobileApp: false,
    isStandalone: false,
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const ua = window.navigator.userAgent
    const width = window.innerWidth

    // Detectar tipo de dispositivo
    const isMobile = width < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(ua)
    const isTablet = (width >= 768 && width < 1024) || /iPad/i.test(ua)
    const isDesktop = width >= 1024 && !/Mobi|Android|iPhone|iPad|iPod/i.test(ua)

    // Detectar sistema operacional
    const isIOS = /iPad|iPhone|iPod/i.test(ua) && !(window as any).MSStream
    const isAndroid = /Android/i.test(ua)

    // Detectar navegador
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua)
    const isChrome = /Chrome/i.test(ua) && !/Edge/i.test(ua)
    const isFirefox = /Firefox/i.test(ua)
    const isEdge = /Edge/i.test(ua)

    // Detectar se está em um app mobile
    const isMobileApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://")

    // Detectar se está em modo standalone (PWA)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isFirefox,
      isEdge,
      isMobileApp,
      isStandalone,
    })
  }, [])

  return deviceInfo
}
