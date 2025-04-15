"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTPFBalance } from "@/lib/hooks/use-tpf-balance"
import { formatEther } from "ethers"
import { Loader2, Send, QrCode } from "lucide-react"
import { useState } from "react"
import { SendTokenDialog } from "./send-token-dialog"
import { ReceiveTokenDialog } from "./receive-token-dialog"

export function WalletBalance() {
  const { balance, isLoading, refetch } = useTPFBalance()
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          TPF Balance
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
        <CardDescription>Your TPF token balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-6">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <div className="text-center">
              <div className="text-4xl font-bold">
                {balance ? Number.parseFloat(formatEther(balance)).toFixed(4) : "0.0000"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">TPF</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="w-[48%]" onClick={() => setSendDialogOpen(true)}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
        <Button variant="outline" className="w-[48%]" onClick={() => setReceiveDialogOpen(true)}>
          <QrCode className="mr-2 h-4 w-4" />
          Receive
        </Button>
      </CardFooter>

      <SendTokenDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} onSuccess={() => refetch()} />

      <ReceiveTokenDialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen} />
    </Card>
  )
}
