/**
 * Serviço para obter preços reais de tokens de várias fontes
 */

import { getTokenPrices as getDexScreenerTokenPrices } from "./dexscreenerService"

// Endereços dos tokens
export const TPF_ADDRESS = "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45".toLowerCase()
export const WLD_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003".toLowerCase()
export const DNA_ADDRESS = "0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113".toLowerCase()
export const WDD_ADDRESS = "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B".toLowerCase()
export const CASH_ADDRESS = "0xbfdA4F50a2d5B9b864511579D7dfa1C72f118575".toLowerCase()

// Valores fixos para fallback (caso as APIs falhem)
const FALLBACK_PRICES = {
  TPF: 0.0125, // Valor fixo para TPF
  WLD: 2.35, // Valor fixo para WLD
  DNA: 0.25, // Valor fixo para DNA
  WDD: 0.05, // Valor fixo para WDD
  CASH: 0.1, // Valor fixo para CASH
}

/**
 * Busca o preço do WLD no CoinGecko
 */
async function getWLDPriceFromCoinGecko(): Promise<number | null> {
  try {
    console.log("[RealPrice] Buscando preço do WLD no CoinGecko")

    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=worldcoin&vs_currencies=usd", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      console.log(`[RealPrice] Erro ao buscar preço do WLD: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data && data.worldcoin && data.worldcoin.usd) {
      const price = data.worldcoin.usd
      console.log(`[RealPrice] Preço do WLD: $${price}`)
      return price
    }

    return null
  } catch (error) {
    console.error("[RealPrice] Erro ao buscar preço do WLD:", error)
    return null
  }
}

/**
 * Busca o preço do token com base no símbolo
 */
export async function getTokenPrice(symbol: string): Promise<{
  price: number
  source: string
}> {
  console.log(`[RealPrice] Buscando preço para o token: ${symbol}`)

  try {
    let price: number | null = null
    let source = "api"

    if (symbol === "WLD") {
      // Buscar preço do WLD no CoinGecko
      price = await getWLDPriceFromCoinGecko()
      if (price !== null) {
        return { price, source: "coingecko" }
      }
    } else {
      // Buscar preço do DexScreener
      const tokenAddresses = {
        TPF: TPF_ADDRESS,
        DNA: DNA_ADDRESS,
        WDD: WDD_ADDRESS,
        CASH: CASH_ADDRESS,
      }

      const tokenAddress = tokenAddresses[symbol as keyof typeof tokenAddresses]

      if (tokenAddress) {
        const dexscreenerPairs = await getDexScreenerTokenPrices("worldchain", tokenAddress)
        if (dexscreenerPairs && dexscreenerPairs.length > 0) {
          const pair = dexscreenerPairs[0]
          price = Number(pair.priceUsd)
          source = "dexscreener"
          console.log(`[RealPrice] Preço do ${symbol} (DexScreener): $${price}`)
          return { price, source }
        }
      }
    }

    // Se não conseguiu obter o preço, usar o valor de fallback
    console.log(`[RealPrice] Usando valor de fallback para ${symbol}`)
    return {
      price: FALLBACK_PRICES[symbol as keyof typeof FALLBACK_PRICES] || 0,
      source: "fallback",
    }
  } catch (error) {
    console.error(`[RealPrice] Erro ao buscar preço do token ${symbol}:`, error)

    // Em caso de erro, retornar o valor de fallback
    return {
      price: FALLBACK_PRICES[symbol as keyof typeof FALLBACK_PRICES] || 0,
      source: "fallback_error",
    }
  }
}

/**
 * Gera dados históricos de preço simulados com base no preço atual
 */
export function generatePriceHistory(
  currentPrice: number,
  timeframe: string,
  volatility = 0.05,
): { time: string; price: number }[] {
  console.log(`[RealPrice] Gerando histórico de preços simulado para timeframe: ${timeframe}`)

  // Determinar o número de pontos com base no timeframe
  let points = 24
  switch (timeframe) {
    case "1m":
    case "5m":
    case "15m":
      points = 60
      break
    case "1h":
      points = 24
      break
    case "4h":
      points = 30
      break
    case "8h":
      points = 24
      break
    case "24h":
      points = 24
      break
    default:
      points = 24
  }

  // Gerar dados históricos simulados
  const now = new Date()
  const history: { time: string; price: number }[] = []

  for (let i = points; i >= 0; i--) {
    const date = new Date(now.getTime() - i * getTimeframeInMilliseconds(timeframe))

    // Gerar um preço com variação aleatória
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility)
    const price = currentPrice * randomFactor

    // Formatar a hora com base no timeframe
    let timeString
    if (["1m", "5m", "15m"].includes(timeframe)) {
      timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      timeString = date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    history.push({
      time: timeString,
      price,
    })
  }

  return history
}

/**
 * Converte o timeframe em milissegundos
 */
function getTimeframeInMilliseconds(timeframe: string): number {
  switch (timeframe) {
    case "1m":
      return 60 * 1000
    case "5m":
      return 5 * 60 * 1000
    case "15m":
      return 15 * 60 * 1000
    case "1h":
      return 60 * 60 * 1000
    case "4h":
      return 4 * 60 * 60 * 1000
    case "8h":
      return 8 * 60 * 60 * 1000
    case "24h":
      return 24 * 60 * 60 * 1000
    default:
      return 60 * 60 * 1000 // 1h por padrão
  }
}
