/**
 * Serviço para obter preços reais de tokens da API oficial da Worldcoin
 */

// URL base da API
const API_BASE_URL = "https://app-backend.worldcoin.dev/public/v1/miniapps/prices"

// Tipos para a resposta da API conforme a documentação
interface PriceResponse {
  result: {
    prices: {
      [cryptoCurrency: string]: {
        [fiatCurrency: string]: {
          asset: string
          amount: string
          decimals: number
          symbol: string
        }
      }
    }
  }
}

/**
 * Obtém preços de criptomoedas em moedas fiduciárias
 * @param cryptoCurrencies Lista de criptomoedas (ex: WLD,USDCE)
 * @param fiatCurrencies Lista de moedas fiduciárias (ex: USD,EUR)
 * @returns Objeto com preços
 */
export async function getTokenPrices(
  cryptoCurrencies: string[],
  fiatCurrencies: string[] = ["USD"],
): Promise<PriceResponse | null> {
  try {
    // Construir a URL exatamente como no exemplo
    const apiUrl = `${API_BASE_URL}?cryptoCurrencies=${cryptoCurrencies.join(",")}&fiatCurrencies=${fiatCurrencies.join(",")}`

    console.log(`[WorldcoinPrice] Fetching prices from: ${apiUrl}`)

    // Usando fetch exatamente como no exemplo fornecido
    const response = await fetch(apiUrl, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[WorldcoinPrice] Received price data:`, data)

    return data as PriceResponse
  } catch (error) {
    console.error("[WorldcoinPrice] Error fetching token prices:", error)
    return null
  }
}

/**
 * Converte o valor da API para o preço real
 * @param amount Valor retornado pela API
 * @param decimals Número de casas decimais
 * @returns Preço convertido
 */
function convertPrice(amount: string, decimals: number): number {
  return Number(amount) * Math.pow(10, -decimals)
}

/**
 * Obtém o preço de um token específico em USD
 * @param symbol Símbolo do token (ex: WLD, USDCE)
 * @returns Preço em USD ou valor padrão em caso de erro
 */
export async function getTokenPrice(symbol: string): Promise<{
  price: number
  source: string
}> {
  try {
    // Normalizar o símbolo para o formato esperado pela API
    const normalizedSymbol = normalizeTokenSymbol(symbol)

    // Se o token não for suportado pela API da Worldcoin, usar fallback
    if (normalizedSymbol === "UNSUPPORTED") {
      return {
        price: getDefaultPrice(symbol),
        source: "fallback_unsupported",
      }
    }

    // Obter preços da API usando apenas o token específico
    const priceData = await getTokenPrices([normalizedSymbol], ["USD"])

    if (
      priceData &&
      priceData.result &&
      priceData.result.prices &&
      priceData.result.prices[normalizedSymbol] &&
      priceData.result.prices[normalizedSymbol].USD
    ) {
      const priceInfo = priceData.result.prices[normalizedSymbol].USD
      // Converter o preço usando amount e decimals
      const price = convertPrice(priceInfo.amount, priceInfo.decimals)

      console.log(`[WorldcoinPrice] Price for ${symbol}: $${price} (from API)`)
      return {
        price,
        source: "worldcoin_api",
      }
    }

    // Se não conseguir obter o preço, usar valor padrão
    console.log(`[WorldcoinPrice] Using default price for ${symbol}`)
    return {
      price: getDefaultPrice(symbol),
      source: "fallback",
    }
  } catch (error) {
    console.error(`[WorldcoinPrice] Error getting price for ${symbol}:`, error)
    return {
      price: getDefaultPrice(symbol),
      source: "fallback_error",
    }
  }
}

/**
 * Normaliza o símbolo do token para o formato esperado pela API
 */
function normalizeTokenSymbol(symbol: string): string {
  // A API espera WLD e USDCE, então precisamos normalizar outros símbolos
  switch (symbol.toUpperCase()) {
    case "WLD":
      return "WLD"
    case "USDC":
    case "USDCE":
      return "USDCE"
    case "TPF":
    case "DNA":
    case "WDD":
    case "CASH":
      // Tokens não suportados pela API da Worldcoin
      return "UNSUPPORTED"
    default:
      return symbol.toUpperCase()
  }
}

/**
 * Retorna um preço padrão para o token em caso de falha na API
 */
function getDefaultPrice(symbol: string): number {
  switch (symbol.toUpperCase()) {
    case "WLD":
      return 2.35
    case "USDC":
    case "USDCE":
      return 1.0
    case "TPF":
      return 0.0125
    case "DNA":
      return 0.25
    case "WDD":
      return 0.05
    case "CASH":
      return 0.1
    case "WETH":
    case "ETH":
      return 3500.0
    default:
      return 0.0
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
  console.log(`[WorldcoinPrice] Generating simulated price history for timeframe: ${timeframe}`)

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
