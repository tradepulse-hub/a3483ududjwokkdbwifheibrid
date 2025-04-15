"use client"

import { useContext } from "react"
import { WorldAppContext, type WorldAppState } from "@/components/wallet/world-app-provider"

export function useWorldApp(): WorldAppState {
  const context = useContext(WorldAppContext)

  if (!context) {
    throw new Error("useWorldApp must be used within a WorldAppProvider")
  }

  return context
}
