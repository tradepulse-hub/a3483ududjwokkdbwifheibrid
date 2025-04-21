"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Token } from "@/types/token"

interface SendTokensModalProps {
  token: Token | null
  isOpen: boolean
  onClose: () => void
  onSelectToken: () => void
}

export default function SendTokensModal({ token, isOpen, onClose, onSelectToken }: SendTokensModalProps) {
  const { t } = useTranslation()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [step, setStep] = useState<"select" | "details" | "confirm">("select")

  const handleContinue = () => {
    if (step === "select" && token) {
      setStep("details")
    } else if (step === "details") {
      setStep("confirm")
    } else {
      // Handle transaction submission
      onClose()
      // Reset state
      setRecipient("")
      setAmount("")
      setStep("select")
    }
  }

  const handleBack = () => {
    if (step === "details") {
      setStep("select")
    } else if (step === "confirm") {
      setStep("details")
    }
  }

  const handleClose = () => {
    onClose()
    // Reset state on close
    setRecipient("")
    setAmount("")
    setStep("select")
  }

  const handleMax = () => {
    if (token) {
      setAmount(token.balance.toString())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "select"
              ? t("Select a token to send")
              : step === "details"
                ? t("Send") + " " + (token?.symbol || "")
                : t("Confirm transaction")}
          </DialogTitle>
          <DialogDescription>
            {step === "select"
              ? t("Choose which token you want to send")
              : step === "details"
                ? t("Enter the recipient address and amount")
                : t("Review your transaction details before confirming")}
          </DialogDescription>
        </DialogHeader>

        {step === "select" ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            {[
              {
                name: "Worldcoin",
                symbol: "WLD",
                icon: "/tokens/wld.svg",
                balance: 100,
              },
              {
                name: "Ethereum",
                symbol: "ETH",
                icon: "/tokens/eth.svg",
                balance: 1.5,
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
                  <p className="text-xs text-muted-foreground">
                    {t.balance} {t.symbol}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        ) : step === "details" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">{t("Recipient")}</Label>
              <Input
                id="recipient"
                placeholder={t("Enter recipient address")}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="amount">{t("Amount")}</Label>
                {token && (
                  <span className="text-xs text-muted-foreground">
                    {t("Available")}: {token.balance} {token.symbol}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder={t("Enter amount")}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={handleMax}>
                  {t("Max")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("From")}</span>
                <span className="font-medium">Your Wallet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("To")}</span>
                <span className="font-medium">{recipient}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("Amount")}</span>
                <span className="font-medium">
                  {amount} {token?.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("Network fee")}</span>
                <span className="font-medium">~0.001 ETH</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t("Total amount")}</span>
                  <span className="font-medium">
                    {amount} {token?.symbol} + 0.001 ETH
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          {step !== "select" ? (
            <Button variant="outline" onClick={handleBack}>
              {t("Back")}
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              {t("Cancel")}
            </Button>
          )}
          <Button onClick={handleContinue} disabled={step === "select" && !token}>
            {step === "confirm" ? t("Confirm") : t("Continue")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
