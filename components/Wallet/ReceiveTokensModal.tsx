"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Copy, Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Token } from "@/types/token"
import QRCode from "react-qr-code"

interface ReceiveTokensModalProps {
  token: Token | null
  walletAddress: string
  isOpen: boolean
  onClose: () => void
  onSelectToken: () => void
}

export default function ReceiveTokensModal({
  token,
  walletAddress,
  isOpen,
  onClose,
  onSelectToken,
}: ReceiveTokensModalProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {token ? (
              <div className="flex items-center gap-2">
                <img src={token.icon || "/placeholder.svg"} alt={token.name} className="w-6 h-6" />
                {t("Receive")} {token.symbol}
              </div>
            ) : (
              t("Select a token to receive")
            )}
          </DialogTitle>
          <DialogDescription>
            {token
              ? t("Scan the QR code or copy your wallet address to receive") + " " + token.symbol
              : t("Choose which token you want to receive")}
          </DialogDescription>
        </DialogHeader>

        {token ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={walletAddress} size={180} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Wallet address")}</label>
              <div className="flex items-center gap-2">
                <div className="border rounded-md px-3 py-2 flex-1 bg-muted">
                  <p className="text-sm font-mono truncate">{walletAddress}</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(walletAddress)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onSelectToken}>
                {t("Change token")}
              </Button>
              <Button variant="outline" onClick={onClose}>
                {t("Close")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-4">
            {[
              {
                name: "Worldcoin",
                symbol: "WLD",
                icon: "/tokens/wld.svg",
              },
              {
                name: "Ethereum",
                symbol: "ETH",
                icon: "/tokens/eth.svg",
              },
            ].map((t) => (
              <Button
                key={t.symbol}
                variant="outline"
                className="flex items-center justify-start gap-2 h-auto py-3"
                onClick={onSelectToken}
              >
                <img src={t.icon || "/placeholder.svg"} alt={t.name} className="w-8 h-8" />
                <div className="text-left">
                  <p className="font-medium">{t.symbol}</p>
                  <p className="text-xs text-muted-foreground">{t.name}</p>
                </div>
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
