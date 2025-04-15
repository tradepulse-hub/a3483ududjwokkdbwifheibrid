"use client"

import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, ArrowLeftRight, LockKeyhole } from "lucide-react"

interface DashboardTabsProps {
  walletTab: React.ReactNode
  swapTab: React.ReactNode
  stakingTab: React.ReactNode
}

export function DashboardTabs({ walletTab, swapTab, stakingTab }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="wallet" className="space-y-4">
      <TabsList>
        <TabsTrigger value="wallet" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span>Wallet</span>
        </TabsTrigger>
        <TabsTrigger value="swap" className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          <span>Swap</span>
        </TabsTrigger>
        <TabsTrigger value="staking" className="flex items-center gap-2">
          <LockKeyhole className="h-4 w-4" />
          <span>Staking</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="wallet" className="space-y-4">
        {walletTab}
      </TabsContent>
      <TabsContent value="swap" className="space-y-4">
        {swapTab}
      </TabsContent>
      <TabsContent value="staking" className="space-y-4">
        {stakingTab}
      </TabsContent>
    </Tabs>
  )
}
