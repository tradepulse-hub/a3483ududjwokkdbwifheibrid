import { NextResponse } from "next/server"
import { ethers } from "ethers"
import { airdropContractABI, AIRDROP_CONTRACT_ADDRESS } from "@/lib/airdropContractABI"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Address parameter is required",
        },
        { status: 400 },
      )
    }

    const provider = new ethers.JsonRpcProvider("https://rpc-testnet.worldcoin.org")
    const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, airdropContractABI, provider)

    const lastClaimTime = await contract.lastClaimTime(address)
    const claimInterval = await contract.CLAIM_INTERVAL()
    const dailyAirdrop = await contract.DAILY_AIRDROP()

    const now = Math.floor(Date.now() / 1000)
    const nextClaimTime = Number(lastClaimTime) + Number(claimInterval)
    const canClaim = Number(lastClaimTime) === 0 || now >= nextClaimTime

    return NextResponse.json({
      success: true,
      lastClaimTime: Number(lastClaimTime),
      nextClaimTime: nextClaimTime,
      canClaim: canClaim,
      timeRemaining: canClaim ? 0 : nextClaimTime - now,
      airdropAmount: ethers.formatUnits(dailyAirdrop, 18),
    })
  } catch (error) {
    console.error("Error fetching airdrop status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch airdrop status",
      },
      { status: 500 },
    )
  }
}
