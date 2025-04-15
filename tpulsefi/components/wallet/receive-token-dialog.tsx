"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useWorldApp } from "@/lib/hooks/use-world-app"
import { QRCodeSVG } from "qrcode.react"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReceiveTokenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiveTokenDialog({ open, onOpenChange }: ReceiveTokenDialogProps) {
  const { address } = useWorldApp()
  const { toast } = useToast()

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address Copied",
        description: "Your address has been copied to clipboard.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Receive TPF</DialogTitle>
          <DialogDescription>Share your address or QR code to receive TPF tokens.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {address && (
            <>
              <div className="bg-white p-4 rounded-lg mb-4">
                <QRCodeSVG value={address} size={200} level="H" includeMargin />
              </div>
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md w-full">
                <div className="text-sm truncate flex-1">{address}</div>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
