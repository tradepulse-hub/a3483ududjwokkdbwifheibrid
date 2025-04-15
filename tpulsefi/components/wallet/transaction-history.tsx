"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTPFTransactions } from "@/lib/hooks/use-tpf-transactions"
import { formatEther } from "ethers"
import { Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorldApp } from "@/lib/hooks/use-world-app"

export function TransactionHistory() {
  const { address } = useWorldApp()
  const { transactions, isLoading, refetch } = useTPFTransactions()

  const getTransactionType = (from: string, to: string) => {
    if (!address) return "Unknown"
    if (from.toLowerCase() === address.toLowerCase()) return "Sent"
    if (to.toLowerCase() === address.toLowerCase()) return "Received"
    return "Unknown"
  }

  const getWorldScanUrl = (txHash: string) => {
    return `https://worldscan.io/tx/${txHash}`
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transaction History
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </Button>
        </CardTitle>
        <CardDescription>Recent TPF token transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No transactions found</div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.hash} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{getTransactionType(tx.from, tx.to)}</div>
                  <div className="text-sm text-muted-foreground">{new Date(tx.timestamp * 1000).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-medium">{Number.parseFloat(formatEther(tx.value)).toFixed(4)} TPF</div>
                    <div className="text-sm text-muted-foreground">
                      {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={getWorldScanUrl(tx.hash)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
