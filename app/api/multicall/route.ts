import { NextResponse } from "next/server"
import { ethers } from "ethers"

// ABI do contrato Multicall3
const multicallABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall3.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        internalType: "bytes[]",
        name: "returnData",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
]

const MULTICALL_CONTRACT_ADDRESS = "0x613db17d5f6251106e4b4e44162ffFf8c8621235"
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"

export async function POST(request: Request) {
  try {
    const { calls } = await request.json()

    if (!calls || !Array.isArray(calls)) {
      return NextResponse.json({ error: "Invalid calls array" }, { status: 400 })
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const multicallContract = new ethers.Contract(MULTICALL_CONTRACT_ADDRESS, multicallABI, provider)

    const { blockNumber, returnData } = await multicallContract.aggregate(calls)

    return NextResponse.json({
      blockNumber: Number(blockNumber),
      returnData: returnData.map(ethers.toUtf8String),
    })
  } catch (error) {
    console.error("Error in Multicall API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
