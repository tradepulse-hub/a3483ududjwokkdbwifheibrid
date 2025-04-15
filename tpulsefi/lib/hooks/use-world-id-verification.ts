"use client"

import { useState, useEffect } from "react"
import { useWorldApp } from "./use-world-app"

export function useWorldIdVerification() {
  const { address, isConnected } = useWorldApp()
  const [isVerified, setIsVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Check if user is already verified
  useEffect(() => {
    if (!address || !isConnected) {
      setIsVerified(false)
      return
    }

    // Check local storage for verification status
    const storedVerification = localStorage.getItem(`worldid-verified-${address.toLowerCase()}`)
    if (storedVerification) {
      setIsVerified(true)
    }
  }, [address, isConnected])

  const verify = async () => {
    if (!address || !isConnected || isVerified) return

    setIsVerifying(true)
    try {
      // In a real implementation, this would call the World ID API
      // For this demo, we'll simulate a successful verification after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store verification status in local storage
      localStorage.setItem(`worldid-verified-${address.toLowerCase()}`, "true")
      setIsVerified(true)
    } catch (error) {
      console.error("Error verifying with World ID:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  return { isVerified, isVerifying, verify }
}
