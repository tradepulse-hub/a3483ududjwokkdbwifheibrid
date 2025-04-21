"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Copy, Check, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Token } from "@/types/token"

interface TokenDetailModalProps {
  token: Token
  isOpen: boolean
  onClose: () => void
}

export default function TokenDetailModal({ token, isOpen, onClose }: TokenDetailModalProps) {
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
          <DialogTitle className="flex items-center gap-2">
            <img src={token.icon || "/placeholder.svg"} alt={token.name} className="w-6 h-6" />
            {t("Token details")}
          </DialogTitle>
          <DialogDescription>
            {t("View details and manage your")} {token.symbol} {t("token")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">{t("Details")}</TabsTrigger>
            <TabsTrigger value="transactions">{t("Transactions")}</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("Token name")}</p>
                <p className="font-medium">{token.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("Token symbol")}</p>
                <p className="font-medium">{token.symbol}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("Token balance")}</p>
                <p className="font-medium">{token.balance}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("Token contract")}</p>
                <div className="flex items-center gap-1">
                  <p className="font-medium text-xs truncate">
                    {token.address.substring(0, 10)}...{token.address.substring(token.address.length - 8)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(token.address)}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                    <a href={`https://etherscan.io/token/${token.address}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={onClose}>
                {t("Close")}
              </Button>
              <div className="space-x-2">
                <Button variant="outline">{t("Send")}</Button>
                <Button>{t("Receive")}</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("No transactions found")}</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
