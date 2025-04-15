"use client"

import { Button } from "@/components/ui/button"
import { useWorldIdVerification } from "@/lib/hooks/use-world-id-verification"
import { Loader2, Shield, ShieldAlert } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function WorldIdVerification() {
  const { isVerified, isVerifying, verify } = useWorldIdVerification()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isVerified ? "outline" : "default"}
            size="sm"
            onClick={verify}
            disabled={isVerifying || isVerified}
            className={isVerified ? "border-green-500 text-green-500" : ""}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : isVerified ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verified with World ID
              </>
            ) : (
              <>
                <ShieldAlert className="mr-2 h-4 w-4" />
                Verify with World ID
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isVerified
            ? "Your identity is verified with World ID"
            : "Verification with World ID is required for transactions"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
