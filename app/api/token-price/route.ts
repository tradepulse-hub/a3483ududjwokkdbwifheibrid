import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
  }

  try {
    console.log(`[API] Buscando preço para o token: ${symbol}`)

    // Preços fixos para demonstração
    const prices = {
      TPF: 0.0125,
      WLD: 2.35,
      DNA: 0.25,
    }

    const price = prices[symbol as keyof typeof prices] || 0

    return NextResponse.json({
      symbol,
      price,
      source: "fixed",
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
