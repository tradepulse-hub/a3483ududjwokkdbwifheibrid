import { NextResponse } from "next/server"
import { getTokenPrice } from "@/lib/worldcoinPriceService"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
  }

  try {
    console.log(`[API] Buscando preço para o token: ${symbol}`)

    // Obter o preço do token da API oficial da Worldcoin
    const { price, source } = await getTokenPrice(symbol)

    // Retornar apenas o preço atual e a fonte
    return NextResponse.json({
      symbol,
      price,
      source,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[API] Erro ao buscar preço do token ${symbol}:`, error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        symbol,
        price: null,
        source: "error",
      },
      { status: 500 },
    )
  }
}
