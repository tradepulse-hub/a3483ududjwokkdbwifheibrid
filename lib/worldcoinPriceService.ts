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

      return {
        price,
        source: "worldcoin_api",
      }
    }

    // Se não conseguir obter o preço, usar valor padrão
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
      // TPF não está disponível na API, então retornamos WLD como fallback
      // Na prática, você precisaria implementar uma lógica específica para TPF
      return "WLD"
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
    case "WETH":
    case "ETH":
      return 3500.0
    default:
      return 0.0
  }
}

/**
 * Obtém dados históricos de preço reais (se disponíveis)
 * Para simplificar, esta função retorna um array vazio por enquanto
 */
export async function getTokenPriceHistory(
  symbol: string,
  timeframe: string,
): Promise<{ time: string; price: number }[]> {
  // Implementação futura para obter dados históricos reais
  return []
}
