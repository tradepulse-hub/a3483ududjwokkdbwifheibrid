import { type NextRequest, NextResponse } from "next/server"
import { ethers } from "ethers"
import { stakingContractABI } from "@/lib/stakingContractABI"

const STAKING_CONTRACT_ADDRESS = "0xb4b2f053031FC05aDBC858CA721185994e3c041B"
const RPC_URL = "https://rpc.ankr.com/polygon"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingContractABI, provider)

    const earnedRewards = await stakingContract.earned(address)

    return NextResponse.json({
      success: true,
      earnedRewards: earnedRewards.toString(),
    })
  } catch (error) {
    console.error("Error fetching staking rewards:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch staking rewards" }, { status: 500 })
  }
}
