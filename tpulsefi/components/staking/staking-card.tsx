"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStaking } from "@/lib/hooks/use-staking"
import { useTPFBalance } from "@/lib/hooks/use-tpf-balance"
import { ethers } from "ethers"
import { Loader2, Clock, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export function StakingCard() {
  const { stakingInfo, isLoading, isActionLoading, stakeTokens, withdrawTokens, claimRewards, calculateTimeRemaining } =
    useStaking()
  const { balance } = useTPFBalance()
  const { toast } = useToast()

  const [stakeAmount, setStakeAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  // Format amounts for display
  const formatAmount = (amount: any) => {
    if (!amount) return "0"
    return Number(ethers.formatEther(amount)).toFixed(4)
  }

  // Calculate progress of lock period
  const calculateProgress = () => {
    if (!stakingInfo || !stakingInfo.lockEndTime) return 0

    const stakingTimeMs = Number(stakingInfo.stakingTime) * 1000
    const lockEndTimeMs = stakingInfo.lockEndTime.getTime()
    const totalLockTime = lockEndTimeMs - stakingTimeMs
    const elapsed = Date.now() - stakingTimeMs

    return Math.min(100, Math.max(0, (elapsed / totalLockTime) * 100))
  }

  // Handle stake
  const handleStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para fazer staking",
        variant: "destructive",
      })
      return
    }

    try {
      const amountWei = ethers.parseEther(stakeAmount)

      // Check if user has enough balance
      if (balance && amountWei > balance) {
        toast({
          title: "Erro",
          description: "Saldo insuficiente",
          variant: "destructive",
        })
        return
      }

      await stakeTokens(amountWei)
      setStakeAmount("")
    } catch (error) {
      console.error("Error in stake handler:", error)
    }
  }

  // Handle withdraw
  const handleWithdraw = async (early = false) => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido para retirar",
        variant: "destructive",
      })
      return
    }

    try {
      const amountWei = ethers.parseEther(withdrawAmount)

      // Check if user has enough staked
      if (stakingInfo && amountWei > stakingInfo.stakedAmount) {
        toast({
          title: "Erro",
          description: "Valor de retirada maior que o valor em staking",
          variant: "destructive",
        })
        return
      }

      await withdrawTokens(amountWei, early)
      setWithdrawAmount("")
    } catch (error) {
      console.error("Error in withdraw handler:", error)
    }
  }

  // Get time remaining display
  const getTimeRemainingDisplay = () => {
    const timeRemaining = calculateTimeRemaining()
    if (!timeRemaining) return "Período de bloqueio concluído"

    return `${timeRemaining.days} dias e ${timeRemaining.hours} horas restantes`
  }

  // Check if early withdrawal
  const isEarlyWithdrawal = () => {
    return calculateTimeRemaining() !== null
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Staking de TPF</CardTitle>
        <CardDescription>Faça staking de TPF e ganhe 1% ao mês</CardDescription>
      </CardHeader>

      {isLoading ? (
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Valor em Staking</div>
                <div className="text-2xl font-bold">
                  {stakingInfo ? formatAmount(stakingInfo.stakedAmount) : "0"} TPF
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Recompensas Acumuladas</div>
                <div className="text-2xl font-bold">{stakingInfo ? formatAmount(stakingInfo.rewards) : "0"} TPF</div>
              </div>
            </div>

            {stakingInfo && Number(stakingInfo.stakedAmount) > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Período de Bloqueio
                  </div>
                  <div className="text-sm">{getTimeRemainingDisplay()}</div>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
            )}

            <Tabs defaultValue="stake" className="pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stake">Fazer Staking</TabsTrigger>
                <TabsTrigger value="withdraw">Retirar</TabsTrigger>
              </TabsList>

              <TabsContent value="stake" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="stake-amount">Valor para Staking</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={isActionLoading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => balance && setStakeAmount(ethers.formatEther(balance))}
                      disabled={isActionLoading || !balance}
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Saldo disponível: {balance ? formatAmount(balance) : "0"} TPF
                  </div>
                </div>

                <div className="rounded-md bg-muted p-3 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Período de bloqueio: 1 mês</li>
                    <li>Recompensa: 1% ao mês</li>
                    <li>Retirada antecipada: penalização de 0,1%</li>
                  </ul>
                </div>

                <Button
                  className="w-full"
                  onClick={handleStake}
                  disabled={isActionLoading || !stakeAmount || Number(stakeAmount) <= 0}
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Fazer Staking"
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="withdraw" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Valor para Retirar</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={isActionLoading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => stakingInfo && setWithdrawAmount(ethers.formatEther(stakingInfo.stakedAmount))}
                      disabled={isActionLoading || !stakingInfo || Number(stakingInfo.stakedAmount) <= 0}
                    >
                      MAX
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Valor em staking: {stakingInfo ? formatAmount(stakingInfo.stakedAmount) : "0"} TPF
                  </div>
                </div>

                {isEarlyWithdrawal() && (
                  <div className="rounded-md bg-amber-500/10 p-3 text-sm flex items-start">
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <strong>Retirada Antecipada:</strong> Você está retirando antes do fim do período de bloqueio. Uma
                      penalização de 0,1% será aplicada.
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleWithdraw(isEarlyWithdrawal())}
                    disabled={
                      isActionLoading ||
                      !withdrawAmount ||
                      Number(withdrawAmount) <= 0 ||
                      !stakingInfo ||
                      Number(stakingInfo.stakedAmount) <= 0
                    }
                  >
                    {isActionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : isEarlyWithdrawal() ? (
                      "Retirar com Penalização"
                    ) : (
                      "Retirar"
                    )}
                  </Button>

                  {Number(stakingInfo?.rewards) > 0 && (
                    <Button
                      variant="outline"
                      onClick={claimRewards}
                      disabled={isActionLoading || !stakingInfo || Number(stakingInfo.rewards) <= 0}
                    >
                      {isActionLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        `Reivindicar ${formatAmount(stakingInfo.rewards)} TPF de Recompensas`
                      )}
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </>
      )}
    </Card>
  )
}
