import { NextResponse } from "next/server"
import { ethers } from "ethers"
import { stakingContractABI } from "@/lib/stakingContractABI"

const STAKING_CONTRACT_ADDRESS = "0xb4b2f053031FC05aDBC858CA721185994e3c041B"
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"

export async function GET() {
  try {
    console.log(`[Staking API] Calculating APR`)

    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingContractABI, provider)

    // Get reward rate and total supply
    const [rewardRate, totalSupply, rewardDuration] = await Promise.all([
      stakingContract.rewardRate(),
      stakingContract.totalSupply(),
      stakingContract.rewardDuration(),
    ])

    console.log(`[Staking API] Reward rate: ${rewardRate.toString()}`)
    console.log(`[Staking API] Total supply: ${totalSupply.toString()}`)
    console.log(`[Staking API] Reward duration: ${rewardDuration.toString()}`)

    // Calculate APR
    // APR = (rewardRate * 365 days * 100) / totalSupply
    let apr = 0
    if (totalSupply.toString() !== "0") {
      // Convert to ether for better precision in calculation
      const rewardRateEther = Number(ethers.formatUnits(rewardRate, 18))
      const totalSupplyEther = Number(ethers.formatUnits(totalSupply, 18))

      // Calculate rewards per year
      const secondsPerYear = 365 * 24 * 60 * 60
      const rewardsPerYear = rewardRateEther * secondsPerYear

      // Calculate APR
      apr = (rewardsPerYear / totalSupplyEther) * 100
    }

    return NextResponse.json({
      success: true,
      apr: apr,
      rewardRate: rewardRate.toString(),
      totalSupply: totalSupply.toString(),
      rewardDuration: rewardDuration.toString(),
    })
  } catch (error) {
    console.error("Error calculating APR:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate APR",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
