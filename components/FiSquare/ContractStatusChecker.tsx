"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle, CheckCircle } from "lucide-react"
import { checkContractStatus } from "@/lib/worldChainStorage"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ContractStatusChecker() {
  const { t } = useTranslation()
  const [isContractAccessible, setIsContractAccessible] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

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

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="mb-4">
      {isContractAccessible === null ? (
        <Alert className="bg-gray-100">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("Checking FiSquare Contract")}</AlertTitle>
          <AlertDescription>{t("Verifying connection to the FiSquare contract...")}</AlertDescription>
        </Alert>
      ) : isContractAccessible ? (
        <Alert className="bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">{t("FiSquare Contract Connected")}</AlertTitle>
          <AlertDescription>{t("Successfully connected to the FiSquare contract.")}</AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-700">{t("FiSquare Contract Unavailable")}</AlertTitle>
          <AlertDescription>
            {t("Unable to connect to the FiSquare contract. Some features may not work.")}
            <Button variant="outline" size="sm" onClick={checkStatus} disabled={isChecking} className="mt-2">
              {isChecking ? t("Checking...") : t("Try Again")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
