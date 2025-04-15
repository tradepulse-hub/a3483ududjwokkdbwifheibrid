"use client"

import { useState, useEffect } from "react"

// Define the correct type for chart data
interface PriceData {
  time: number // Unix timestamp in seconds
  value: number
}

export function useTPFWLDPriceHistory() {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPriceHistory = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, this would fetch data from an API
        // For this demo, we'll generate mock data
        const now = Math.floor(Date.now() / 1000) // Current time in seconds
        const mockData: PriceData[] = []

        // Generate 30 days of hourly data
        for (let i = 30 * 24; i >= 0; i--) {
          const time = now - i * 60 * 60

          // Base price with some randomness
          const basePrice = 0.85
          const randomFactor = 0.05 * (Math.random() - 0.5)
          const trendFactor = Math.sin(i / 24) * 0.03 // Add a sine wave trend

          const price = basePrice + randomFactor + trendFactor

          mockData.push({
            time: time, // Time in seconds for the chart
            value: price,
          })
        }

        setPriceHistory(mockData)
      } catch (error) {
        console.error("Error fetching price history:", error)
        // Provide some fallback data
        const now = Math.floor(Date.now() / 1000)
        const fallbackData: PriceData[] = Array.from({ length: 24 }, (_, i) => ({
          time: now - i * 3600,
          value: 0.85 + Math.sin(i / 4) * 0.03,
        }))
        setPriceHistory(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceHistory()
  }, [])

  return { priceHistory, isLoading }
}
