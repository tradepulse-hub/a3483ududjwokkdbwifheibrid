import { NextResponse } from "next/server"
import { ethers } from "ethers"
import { formatAppId } from "@/lib/env"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const txHash = searchParams.get("txHash")
  const appId = formatAppId(process.env.APP_ID || "")

  if (!txHash) {
    return NextResponse.json({ error: "Transaction hash is required" }, { status: 400 })
  }

  try {
    // Primeiro, verificar se o txHash é um ID de transação do MiniKit
    if (!txHash.startsWith("0x")) {
      // É um ID de transação do MiniKit, não um hash de transação
      console.log(`Verificando transação MiniKit ${txHash} para o app ${appId}`)

      try {
        const response = await fetch(
          `https://developer.worldcoin.org/api/v2/minikit/transaction/${txHash}?app_id=${appId}&type=transaction`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (!response.ok) {
          return NextResponse.json({
            status: "pending",
            message: `Error checking transaction: ${response.status}`,
          })
        }

        const transaction = await response.json()
        console.log("Transaction status from MiniKit API:", transaction)

        if (transaction.transactionStatus === "confirmed") {
          return NextResponse.json({
            status: "success",
            message: "Transaction was confirmed",
            blockHash: transaction.transactionHash,
          })
        } else if (transaction.transactionStatus === "failed") {
          return NextResponse.json({
            status: "failed",
            message: "Transaction failed on the blockchain",
            blockHash: transaction.transactionHash,
          })
        } else {
          return NextResponse.json({
            status: "pending",
            message: "Transaction is still pending",
          })
        }
      } catch (error) {
        console.error("Error checking MiniKit transaction status:", error)
        return NextResponse.json({
          status: "pending",
          message: "Error checking transaction status, will retry",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // É um hash de transação, verificar diretamente na blockchain
    console.log(`Verificando hash de transação ${txHash} na World Chain`)

    // Connect to Worldchain
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash as string)

    if (!receipt) {
      return NextResponse.json({
        status: "pending",
        message: "Transaction is still pending",
      })
    }

    // Check if transaction was successful
    if (receipt.status === 1) {
      return NextResponse.json({
        status: "success",
        message: "Transaction was successful",
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        gasUsed: receipt.gasUsed.toString(),
      })
    } else {
      return NextResponse.json({
        status: "failed",
        message: "Transaction failed",
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        gasUsed: receipt.gasUsed.toString(),
      })
    }
  } catch (error) {
    console.error("Error checking transaction status:", error)

    // If the error is "transaction not found", it's likely still pending
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({
        status: "pending",
        message: "Transaction is still pending or not found",
      })
    }

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
