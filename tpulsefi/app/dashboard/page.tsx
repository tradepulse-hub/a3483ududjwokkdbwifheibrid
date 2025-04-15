import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { WalletBalance } from "@/components/wallet/wallet-balance"
import { TransactionHistory } from "@/components/wallet/transaction-history"
import { SwapInterface } from "@/components/trading/swap-interface"
import { PriceChart } from "@/components/trading/price-chart"
import { WorldIdVerification } from "@/components/wallet/world-id-verification"
import { StakingCard } from "@/components/staking/staking-card"

export const metadata: Metadata = {
  title: "Dashboard | TPulseFi",
  description: "Manage your TPF tokens and swap between TPF and WLD",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <WorldIdVerification />
        </div>

        <DashboardTabs
          walletTab={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <WalletBalance />
              <TransactionHistory />
            </div>
          }
          swapTab={
            <div className="grid gap-4 md:grid-cols-2">
              <PriceChart />
              <SwapInterface />
            </div>
          }
          stakingTab={
            <div className="grid gap-4 md:grid-cols-2">
              <StakingCard />
            </div>
          }
        />
      </div>
    </div>
  )
}
