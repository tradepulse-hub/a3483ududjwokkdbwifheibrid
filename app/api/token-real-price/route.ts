import { NextResponse } from "next/server"
import { getTokenPrice } from "@/lib/realPriceService"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
  }

  try {
    console.log(`[API] Buscando preço real para o token: ${symbol}`)

    // Buscar preço do token usando o serviço de preços reais
    const priceData = await getTokenPrice(symbol)

    return NextResponse.json({
      symbol,
      ...priceData,
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
