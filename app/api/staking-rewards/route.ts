import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"
import { stakingContractABI } from "@/lib/stakingContractABI"

const STAKING_CONTRACT_ADDRESS = "0xb4b2f053031FC05aDBC858CA721185994e3c041B"
// Update to use Worldchain RPC instead of Polygon
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    }

    console.log(`[Staking API] Fetching earned rewards for address: ${address}`)

    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingContractABI, provider)

    // Call earned function to get rewards
    const earnedRewards = await stakingContract.earned(address)
    console.log(`[Staking API] Raw earned rewards: ${earnedRewards.toString()}`)

    return NextResponse.json({
      success: true,
      earnedRewards: earnedRewards.toString(),
    })
  } catch (error) {
    console.error("Error fetching staking rewards:", error)

    // Return a more detailed error for debugging
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch staking rewards",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
