import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"
import { stakingContractABI } from "@/lib/stakingContractABI"

const STAKING_CONTRACT_ADDRESS = "0xb4b2f053031FC05aDBC858CA721185994e3c041B"
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    }

    console.log(`[Staking API] Fetching staked balance for address: ${address}`)

    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingContractABI, provider)

    // Call balanceOf function to get staked balance
    try {
      const stakedBalance = await stakingContract.balanceOf(address)
      console.log(`[Staking API] Raw staked balance: ${stakedBalance.toString()}`)

      return NextResponse.json({
        success: true,
        stakedBalance: stakedBalance.toString(),
      })
    } catch (contractError) {
      console.error("[Staking API] Contract error:", contractError)

      // Return a fallback value of 0 for balance
      return NextResponse.json({
        success: true,
        stakedBalance: "0",
        warning: "Failed to fetch balance from contract, returning 0 as fallback",
        details: contractError instanceof Error ? contractError.message : "Unknown contract error",
      })
    }
  } catch (error) {
    console.error("Error fetching staking balance:", error)

    // Return a more detailed error for debugging
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch staking balance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
