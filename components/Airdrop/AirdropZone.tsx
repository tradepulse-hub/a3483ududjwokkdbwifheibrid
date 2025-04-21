"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function AirdropZone() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [progress, setProgress] = useState(45)

  const handleClaim = async () => {
    setClaiming(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setClaiming(false)
    setClaimed(true)
    setProgress(100)

    toast({
      title: t("Success"),
      description: t("You have successfully claimed your airdrop!"),
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("Airdrop Zone")}</CardTitle>
        <CardDescription>{t("Claim your tokens from the airdrop campaign")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="claim">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="claim">{t("Claim")}</TabsTrigger>
            <TabsTrigger value="social">{t("Social")}</TabsTrigger>
          </TabsList>
          <TabsContent value="claim" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Progress")}</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Your Allocation")}</span>
                <span className="text-sm font-medium">1,000 WLD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("Contract Balance")}</span>
                <span className="text-sm font-medium">500,000 WLD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("End Date")}</span>
                <span className="text-sm font-medium">Dec 31, 2023</span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm">{t("Complete social tasks to increase your allocation")}</p>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Twitter: {t("Follow our account")}</span>
                  <Button variant="outline" size="sm">
                    {t("Complete")}
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Twitter: {t("Retweet our post")}</span>
                  <Button variant="outline" size="sm">
                    {t("Complete")}
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Discord: {t("Join our server")}</span>
                  <Button variant="outline" size="sm">
                    {t("Complete")}
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Telegram: {t("Join our channel")}</span>
                  <Button variant="outline" size="sm">
                    {t("Complete")}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleClaim} disabled={claiming || claimed}>
          {claiming ? t("Claiming...") : claimed ? t("Claimed") : t("Claim Airdrop")}
        </Button>
      </CardFooter>
    </Card>
  )
}
