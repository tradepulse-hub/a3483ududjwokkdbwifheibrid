import { NextResponse } from "next/server"
import { formatAppId } from "@/lib/env"
import { checkTransactionStatus } from "@/lib/airdropService"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const txId = searchParams.get("txId")
  const appId = formatAppId(process.env.APP_ID || "")

  if (!txId) {
    return NextResponse.json({ error: "ID da transação não fornecido" }, { status: 400 })
  }

  try {
    console.log(`Verificando transação ${txId} para o app ${appId}`)

    // Verificar o status da transação
    const status = await checkTransactionStatus(txId)

    return NextResponse.json(status)
  } catch (error) {
    console.error("Erro ao verificar status da transação:", error)
    return NextResponse.json(
      {
        error: "Erro ao verificar status da transação",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
