"use client"

import { useEffect, useRef } from "react"

export default function ChartBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Detectar se é um dispositivo móvel
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    // Chart line properties - reduzir a complexidade em dispositivos móveis
    const lineCount = isMobile ? 4 : 8
    const lines = Array.from({ length: lineCount }, (_, i) => ({
      points: [],
      speed: 0.5 + Math.random() * 1.5,
      amplitude: 50 + Math.random() * 100,
      frequency: 0.01 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
      y: canvas.height * (0.3 + (i * 0.5) / lineCount),
      opacity: 0.1 + Math.random() * 0.2,
      width: 1 + Math.random() * 2,
    }))

    // Generate initial points for each line - reduzir a densidade de pontos em dispositivos móveis
    const pointSpacing = isMobile ? 10 : 5
    lines.forEach((line) => {
      line.points = Array.from({ length: Math.ceil(canvas.width / pointSpacing) }, (_, i) => {
        const x = i * pointSpacing
        const y = line.y + Math.sin(x * line.frequency + line.phase) * line.amplitude * (0.5 + Math.random() * 0.5)
        return { x, y }
      })
    })

    // Animation variables
    let animationFrameId: number
    let time = 0

    // Animation function
    const animate = () => {
      time += 0.01

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw each line
      lines.forEach((line) => {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(0, 255, 128, ${line.opacity})`
        ctx.lineWidth = line.width

        // Update points and draw line
        line.points.forEach((point, i) => {
          // Move points to the left
          point.x -= line.speed

          // If point moves off screen, reset it to the right
          if (point.x < 0) {
            point.x = canvas.width
            const lastPoint = line.points[i === 0 ? line.points.length - 1 : i - 1]
            // Ensure smooth transition by using the last point's y value as a base
            point.y =
              line.y +
              Math.sin(point.x * line.frequency + line.phase + time) * line.amplitude * (0.5 + Math.random() * 0.5)
          }

          // Draw line segment
          if (i === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })

        ctx.stroke()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />
}
