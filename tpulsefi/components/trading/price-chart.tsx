"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTPFWLDPriceHistory } from "@/lib/hooks/use-tpf-wld-price-history"
import { Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PriceChart() {
  const { priceHistory, isLoading } = useTPFWLDPriceHistory()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeframe, setTimeframe] = useState<"1h" | "1d" | "1w" | "1m">("1d")
  const [currentPrice, setCurrentPrice] = useState<string>("0.00")

  // Draw the chart using canvas
  useEffect(() => {
    if (!canvasRef.current || !priceHistory.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Filter data based on timeframe
    const now = Math.floor(Date.now() / 1000)
    let filteredData = [...priceHistory]

    if (timeframe === "1h") {
      filteredData = filteredData.filter((d) => d.time > now - 3600)
    } else if (timeframe === "1d") {
      filteredData = filteredData.filter((d) => d.time > now - 24 * 3600)
    } else if (timeframe === "1w") {
      filteredData = filteredData.filter((d) => d.time > now - 7 * 24 * 3600)
    }

    // Set current price
    if (filteredData.length > 0) {
      setCurrentPrice(filteredData[filteredData.length - 1].value.toFixed(4))
    }

    // Get min and max values for scaling
    const values = filteredData.map((d) => d.value)
    const minValue = Math.min(...values) * 0.99 // Add some padding
    const maxValue = Math.max(...values) * 1.01
    const valueRange = maxValue - minValue

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    ctx.scale(dpr, dpr)

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1

    // Horizontal grid lines
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = (canvas.clientHeight / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.clientWidth, y)
      ctx.stroke()

      // Draw price labels
      const price = maxValue - (i / gridLines) * valueRange
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(price.toFixed(4), 5, y - 5)
    }

    // Draw price line
    ctx.strokeStyle = "hsl(217, 91%, 60%)" // Blue color
    ctx.lineWidth = 2
    ctx.beginPath()

    filteredData.forEach((point, index) => {
      const x = (index / (filteredData.length - 1)) * canvas.clientWidth
      const normalizedValue = valueRange === 0 ? 0.5 : (point.value - minValue) / valueRange
      const y = canvas.clientHeight - normalizedValue * canvas.clientHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Fill area under the line
    ctx.lineTo(canvas.clientWidth, canvas.clientHeight)
    ctx.lineTo(0, canvas.clientHeight)
    ctx.closePath()
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)" // Light blue with transparency
    ctx.fill()

    // Draw time labels
    if (filteredData.length > 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"

      const labelCount = 5
      for (let i = 0; i < labelCount; i++) {
        const index = Math.floor((i / (labelCount - 1)) * (filteredData.length - 1))
        const x = (index / (filteredData.length - 1)) * canvas.clientWidth
        const date = new Date(filteredData[index].time * 1000)

        let label = ""
        if (timeframe === "1h") {
          label = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        } else {
          label = date.toLocaleDateString([], { month: "short", day: "numeric" })
        }

        ctx.fillText(label, x, canvas.clientHeight - 5)
      }
    }

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        canvas.width = canvas.clientWidth * dpr
        canvas.height = canvas.clientHeight * dpr

        // Redraw the chart
        const event = new Event("redraw")
        window.dispatchEvent(event)
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("redraw", () => {
      // This will trigger the effect to run again
      setTimeframe((prev) => prev)
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("redraw", () => {})
    }
  }, [priceHistory, timeframe])

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as "1h" | "1d" | "1w" | "1m")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>TPF/WLD Price</CardTitle>
            <CardDescription>Historical price data</CardDescription>
          </div>
          <Tabs defaultValue="1d" onValueChange={handleTimeframeChange}>
            <TabsList>
              <TabsTrigger value="1h">1H</TabsTrigger>
              <TabsTrigger value="1d">1D</TabsTrigger>
              <TabsTrigger value="1w">1W</TabsTrigger>
              <TabsTrigger value="1m">1M</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-4 left-4 bg-background/80 p-2 rounded-md backdrop-blur-sm">
              <div className="text-sm text-muted-foreground">Current Price</div>
              <div className="text-2xl font-bold">{currentPrice} WLD</div>
            </div>
            <canvas
              ref={canvasRef}
              className="w-full h-[400px] rounded-md"
              style={{ width: "100%", height: "400px" }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
