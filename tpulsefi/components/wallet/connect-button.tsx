"use client"

import { Button } from "@/components/ui/button"
import { useWorldApp } from "@/lib/hooks/use-world-app"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function ConnectButton() {
  const { isConnected, connect, address } = useWorldApp()
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to connect:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  if (isConnected) {
    return (
      <Button variant="outline" onClick={() => router.push("/dashboard")}>
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </Button>
    )
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect World App"
      )}
    </Button>
  )
}
