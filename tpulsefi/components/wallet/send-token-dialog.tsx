"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWorldApp } from "@/lib/hooks/use-world-app"
import { useTPFContract } from "@/lib/hooks/use-tpf-contract"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { parseEther } from "ethers"
import { useToast } from "@/components/ui/use-toast"
import { useWorldIdVerification } from "@/lib/hooks/use-world-id-verification"

interface SendTokenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SendTokenDialog({ open, onOpenChange, onSuccess }: SendTokenDialogProps) {
  const { address } = useWorldApp()
  const { contract } = useTPFContract()
  const { toast } = useToast()
  const { isVerified } = useWorldIdVerification()

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleSend = async () => {
    if (!contract || !address || !recipient || !amount) return

    if (!isVerified) {
      toast({
        title: "World ID Verification Required",
        description: "You need to verify with World ID before sending tokens.",
        variant: "destructive",
      })
      onOpenChange(false)
      return
    }

    if (!previewMode) {
      setPreviewMode(true)
      return
    }

    setIsLoading(true)
    try {
      const tx = await contract.transfer(recipient, parseEther(amount))
      await tx.wait()

      toast({
        title: "Transaction Successful",
        description: `Successfully sent ${amount} TPF to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Transaction failed:", error)
      toast({
        title: "Transaction Failed",
        description: "Failed to send tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setPreviewMode(false)
    }
  }

  const handleCancel = () => {
    if (previewMode) {
      setPreviewMode(false)
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{previewMode ? "Confirm Transaction" : "Send TPF"}</DialogTitle>
          <DialogDescription>
            {previewMode
              ? "Please review your transaction details before confirming."
              : "Enter the recipient address and amount to send."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={previewMode || isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={previewMode || isLoading}
            />
          </div>

          {previewMode && (
            <div className="rounded-lg border p-4 mt-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">From:</div>
                <div>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>

                <div className="text-muted-foreground">To:</div>
                <div>
                  {recipient.slice(0, 6)}...{recipient.slice(-4)}
                </div>

                <div className="text-muted-foreground">Amount:</div>
                <div>{amount} TPF</div>

                <div className="text-muted-foreground">Network:</div>
                <div>World Chain</div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {previewMode ? "Back" : "Cancel"}
          </Button>
          <Button onClick={handleSend} disabled={!recipient || !amount || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : previewMode ? (
              "Confirm & Send"
            ) : (
              "Preview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
