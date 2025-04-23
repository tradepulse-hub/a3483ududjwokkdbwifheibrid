import { NextResponse } from "next/server"
import { getTokenPrice, generatePriceHistory } from "@/lib/unoService"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")
  const timeframe = searchParams.get("timeframe") || "1h"

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
  }

  try {
    console.log(`[UNO API] Buscando preço para o token: ${symbol}`)

    // Buscar preço do token usando o serviço UNO
    const price = getTokenPrice(symbol)

    // Gerar histórico de preços para o gráfico
    const history = generatePriceHistory(symbol, timeframe)

    // Calcular variação de preço
    const firstPrice = history[0].price
    const lastPrice = history[history.length - 1].price
    const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0

    return NextResponse.json({
      symbol,
      price,
      priceChange,
      history,
      source: "uno",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[UNO API] Erro ao buscar preço do token ${symbol}:`, error)

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
