/**
 * Serviço para interagir com o UNO e obter preços corretos dos tokens
 */

// Endereços corretos dos tokens na rede Optimism
export const TOKEN_ADDRESSES = {
  // Endereço do USDC na Optimism
  USDC: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
  // Endereço do WETH na Optimism
  WETH: "0x4200000000000000000000000000000000000006",
  // Endereço do WLD na Optimism
  WLD: "0x2C6d1Cb5C10Ae9E0a2B6DD0Ff7e4C89Bc8b1C369",
  // Endereço do TPF (se disponível)
  TPF: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
}

// ID do aplicativo UNO
export const UNO_APP_ID = "app_a4f7f3e62c1de0b9490a5260cb390b56"

// ID do nosso aplicativo
export const OUR_APP_ID = process.env.APP_ID || ""

/**
 * Gera uma URL de deeplink para o UNO
 */
export function getUnoDeeplinkUrl({
  fromToken,
  toToken,
  amount,
  referrerAppId,
  referrerDeeplinkPath,
}: {
  fromToken?: string
  toToken?: string
  amount?: string
  referrerAppId?: string
  referrerDeeplinkPath?: string
}) {
  let path = `?tab=swap`
  if (fromToken) {
    path += `&fromToken=${fromToken}`
    if (amount) {
      path += `&amount=${amount}`
    }
  }
  if (toToken) {
    path += `&toToken=${toToken}`
  }
  if (referrerAppId) {
    path += `&referrerAppId=${referrerAppId}`
  }
  if (referrerDeeplinkPath) {
    path += `&referrerDeeplinkPath=${encodeURIComponent(referrerDeeplinkPath)}`
  }
  const encodedPath = encodeURIComponent(path)
  return `https://worldcoin.org/mini-app?app_id=${UNO_APP_ID}&path=${encodedPath}`
}

/**
 * Preços fixos para os tokens (até termos uma API real)
 */
const TOKEN_PRICES = {
  WLD: 2.35,
  TPF: 0.0125,
  USDC: 1.0,
  WETH: 3500.0,
}

/**
 * Obtém o preço de um token pelo símbolo
 */
export function getTokenPrice(symbol: string): number {
  return TOKEN_PRICES[symbol as keyof typeof TOKEN_PRICES] || 0
}

/**
 * Gera dados históricos de preço simulados com base no preço atual
 */
export function generatePriceHistory(
  symbol: string,
  timeframe: string,
  volatility = 0.05,
): { time: string; price: number }[] {
  console.log(`[UNO] Gerando histórico de preços simulado para ${symbol}, timeframe: ${timeframe}`)

  // Obter o preço atual do token
  const currentPrice = getTokenPrice(symbol)

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

/**
 * Obtém o endereço do token pelo símbolo
 */
export function getTokenAddress(symbol: string): string {
  return TOKEN_ADDRESSES[symbol as keyof typeof TOKEN_ADDRESSES] || ""
}

/**
 * Gera um link para swap de tokens no UNO
 */
export function generateSwapLink(fromSymbol: string, toSymbol: string, amount: string): string {
  const fromToken = getTokenAddress(fromSymbol)
  const toToken = getTokenAddress(toSymbol)

  // Converter o valor para unidades base (assumindo 6 decimais para USDC, 18 para outros)
  const decimals = fromSymbol === "USDC" ? 6 : 18
  const baseAmount = (Number(amount) * 10 ** decimals).toString()

  return getUnoDeeplinkUrl({
    fromToken,
    toToken,
    amount: baseAmount,
    referrerAppId: OUR_APP_ID,
  })
}
