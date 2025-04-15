import type { BigNumberish } from "ethers"

// Calculate price impact
export function calculatePriceImpact(amountIn: BigNumberish, amountOut: BigNumberish, spotPrice: number): number {
  const amountInNumber = Number(amountIn) / 1e18
  const amountOutNumber = Number(amountOut) / 1e18

  const expectedAmountOut = amountInNumber * spotPrice
  const priceImpact = (1 - amountOutNumber / expectedAmountOut) * 100

  return Math.max(0, priceImpact)
}

// Calculate minimum amount out based on slippage
export function calculateMinAmountOut(amountOut: BigNumberish, slippageTolerance: number): BigNumberish {
  const slippageFactor = 1 - slippageTolerance / 100
  const amountOutNumber = Number(amountOut)
  const minAmountOutNumber = Math.floor(amountOutNumber * slippageFactor)

  return BigInt(minAmountOutNumber)
}

// Format amount with appropriate decimals
export function formatAmount(amount: BigNumberish, decimals = 18): string {
  const amountNumber = Number(amount) / 10 ** decimals

  if (amountNumber < 0.0001) {
    return "<0.0001"
  }

  if (amountNumber < 1) {
    return amountNumber.toFixed(4)
  }

  if (amountNumber < 1000) {
    return amountNumber.toFixed(2)
  }

  return amountNumber.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
