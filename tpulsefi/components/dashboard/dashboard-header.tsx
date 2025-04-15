"use client"

import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { ConnectButton } from "@/components/wallet/connect-button"
import { ModeToggle } from "@/components/mode-toggle"
import { useWorldApp } from "@/lib/hooks/use-world-app"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function DashboardHeader() {
  const { isConnected, disconnect } = useWorldApp()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl">TPulseFi</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <Button variant="outline" size="icon" onClick={disconnect} title="Disconnect">
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <ConnectButton />
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
