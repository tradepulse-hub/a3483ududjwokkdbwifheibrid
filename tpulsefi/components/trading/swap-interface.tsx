"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownUp, Loader2, Settings } from "lucide-react"
import { useTPFWLDSwap } from "@/lib/hooks/use-tpf-wld-swap"
import { formatEther, parseEther } from "ethers"
import { useToast } from "@/components/ui/use-toast"
import { useWorldIdVerification } from "@/lib/hooks/use-world-id-verification"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"

export function SwapInterface() {
  const { toast } = useToast()
  const { isVerified } = useWorldIdVerification()
  const { getAmountOut, swap, isLoading, tpfBalance, wldBalance } = useTPFWLDSwap()

  const [inputAmount, setInputAmount] = useState("")
  const [outputAmount, setOutputAmount] = useState("")
  const [isTPFToWLD, setIsTPFToWLD] = useState(true)
  const [slippage, setSlippage] = useState(0.5) // Default 0.5%
  const [isCalculating, setIsCalculating] = useState(false)

  // Calculate output amount when input changes
  useEffect(() => {
    const calculateOutput = async () => {
      if (!inputAmount || Number.parseFloat(inputAmount) === 0) {
        setOutputAmount("")
        return
      }

      setIsCalculating(true)
      try {
        const amountIn = parseEther(inputAmount)
        const amountOut = await getAmountOut(amountIn, isTPFToWLD)
        setOutputAmount(formatEther(amountOut))
      } catch (error) {
        console.error("Error calculating output:", error)
        setOutputAmount("")
      } finally {
        setIsCalculating(false)
      }
    }

    calculateOutput()
  }, [inputAmount, isTPFToWLD, getAmountOut])

  const handleSwapDirection = () => {
    setIsTPFToWLD(!isTPFToWLD)
    setInputAmount("")
    setOutputAmount("")
  }

  const handleSwap = async () => {
    if (!isVerified) {
      toast({
        title: "World ID Verification Required",
        description: "You need to verify with World ID before swapping tokens.",
        variant: "destructive",
      })
      return
    }

    if (!inputAmount || Number.parseFloat(inputAmount) === 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap.",
        variant: "destructive",
      })
      return
    }

    try {
      const amountIn = parseEther(inputAmount)
      const minAmountOut = parseEther(outputAmount)
        .mul(Math.floor((100 - slippage) * 100))
        .div(10000)

      await swap(amountIn, minAmountOut, isTPFToWLD)

      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${inputAmount} ${isTPFToWLD ? "TPF" : "WLD"} for ${outputAmount} ${isTPFToWLD ? "WLD" : "TPF"}`,
      })

      setInputAmount("")
      setOutputAmount("")
    } catch (error) {
      console.error("Swap failed:", error)
      toast({
        title: "Swap Failed",
        description: "Failed to swap tokens. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getMaxAmount = () => {
    if (isTPFToWLD && tpfBalance) {
      return formatEther(tpfBalance)
    } else if (!isTPFToWLD && wldBalance) {
      return formatEther(wldBalance)
    }
    return "0"
  }

  const handleSetMax = () => {
    const maxAmount = getMaxAmount()
    setInputAmount(maxAmount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Swap
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Slippage Tolerance</h4>
                  <p className="text-sm text-muted-foreground">
                    Your transaction will revert if the price changes unfavorably by more than this percentage.
                  </p>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[slippage]}
                      min={0.1}
                      max={5}
                      step={0.1}
                      onValueChange={(value) => setSlippage(value[0])}
                    />
                    <span className="w-12 text-right">{slippage}%</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CardTitle>
        <CardDescription>Swap between TPF and WLD tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="input-amount">From</Label>
              <div className="text-sm text-muted-foreground">
                Balance: {Number.parseFloat(getMaxAmount()).toFixed(4)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="input-amount"
                  type="number"
                  placeholder="0.0"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                  onClick={handleSetMax}
                >
                  MAX
                </Button>
              </div>
              <div className="w-24 text-right font-medium">{isTPFToWLD ? "TPF" : "WLD"}</div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={handleSwapDirection} disabled={isLoading}>
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="output-amount">To</Label>
              <div className="text-sm text-muted-foreground">{isCalculating && "Calculating..."}</div>
            </div>
            <div className="flex items-center gap-2">
              <Input id="output-amount" type="number" placeholder="0.0" value={outputAmount} disabled />
              <div className="w-24 text-right font-medium">{isTPFToWLD ? "WLD" : "TPF"}</div>
            </div>
          </div>

          {inputAmount && outputAmount && (
            <div className="rounded-lg border p-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>
                  1 {isTPFToWLD ? "TPF" : "WLD"} ={" "}
                  {(Number.parseFloat(outputAmount) / Number.parseFloat(inputAmount)).toFixed(6)}{" "}
                  {isTPFToWLD ? "WLD" : "TPF"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Received</span>
                <span>
                  {(Number.parseFloat(outputAmount) * (1 - slippage / 100)).toFixed(6)} {isTPFToWLD ? "WLD" : "TPF"}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSwap}
          disabled={!inputAmount || Number.parseFloat(inputAmount) === 0 || isLoading || isCalculating}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : (
            "Swap"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
