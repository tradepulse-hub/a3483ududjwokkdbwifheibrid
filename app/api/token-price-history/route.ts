import { NextResponse } from "next/server"
import { getTokenPriceHistory } from "@/lib/geckoTerminalService"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")
  const timeframe = searchParams.get("timeframe") || "1h"

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    console.log(`[API] Fetching price history for token: ${address}, timeframe: ${timeframe}`)

    // Buscar histórico de preços do token usando o serviço GeckoTerminal
    const history = await getTokenPriceHistory(address, timeframe)

    if (history.length === 0) {
      return NextResponse.json(
        {
          error: "Could not fetch token price history",
          history: [],
          source: "unavailable",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      history,
      source: "gecko_terminal",
    })
  } catch (error) {
    console.error("[API] Error fetching token price history:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        history: [],
        source: "error",
      },
      { status: 500 },
    )
  }
}
