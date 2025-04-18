import { NextResponse } from "next/server"
import { ethers } from "ethers"
import { airdropContractABI, AIRDROP_CONTRACT_ADDRESS } from "@/lib/airdropContractABI"

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider("https://rpc-testnet.worldcoin.org")
    const contract = new ethers.Contract(AIRDROP_CONTRACT_ADDRESS, airdropContractABI, provider)

    const balance = await contract.contractBalance()
    const formattedBalance = ethers.formatUnits(balance, 18)

    return NextResponse.json({
      success: true,
      balance: formattedBalance,
    })
  } catch (error) {
    console.error("Error fetching airdrop contract balance:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch airdrop contract balance",
      },
      { status: 500 },
    )
  }
}
