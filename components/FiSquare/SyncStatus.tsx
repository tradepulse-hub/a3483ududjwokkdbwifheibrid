"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { checkContractStatus } from "@/lib/worldChainStorage"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface SyncStatusProps {
  onSync: () => Promise<void>
}

export default function SyncStatus({ onSync }: SyncStatusProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isContractAccessible, setIsContractAccessible] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  const checkStatus = async () => {
    try {
      setIsChecking(true)
      const status = await checkContractStatus()
      setIsContractAccessible(status)
    } catch (error) {
      console.error("Error checking contract status:", error)
      setIsContractAccessible(false)
    } finally {
      setIsChecking(false)
    }
  }

  const handleSync = async () => {
    try {
      setIsSyncing(true)
      await onSync()
      setLastSyncTime(new Date())
      toast({
        title: t("Sync Complete"),
        description: t("Successfully synchronized with the blockchain"),
        duration: 3000,
      })
    } catch (error) {
      console.error("Error syncing:", error)
      toast({
        title: t("Sync Failed"),
        description: t("Failed to synchronize with the blockchain"),
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    checkStatus()

    // Check status every minute
    const intervalId = setInterval(checkStatus, 60000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="mb-4">
      {isContractAccessible === null ? (
        <Alert className="bg-gray-100">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>{t("Checking Connection")}</AlertTitle>
          <AlertDescription>{t("Verifying connection to the FiSquare contract...")}</AlertDescription>
        </Alert>
      ) : isContractAccessible ? (
        <Alert className="bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">{t("Connected to FiSquare")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {t("Successfully connected to the FiSquare contract.")}
              {lastSyncTime && (
                <span className="text-xs block mt-1">
                  {t("Last sync")}: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
            </span>
            <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing} className="ml-2">
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Syncing...")}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("Force Sync")}
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("Connection Error")}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{t("Unable to connect to the FiSquare contract. Some features may not work.")}</span>
            <Button variant="outline" size="sm" onClick={checkStatus} disabled={isChecking} className="ml-2">
              {isChecking ? t("Checking...") : t("Try Again")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
