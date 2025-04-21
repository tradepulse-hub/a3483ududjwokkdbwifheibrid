/**
 * Serviço para interagir com a API GeckoTerminal
 * Documentação: https://api.geckoterminal.com/api/v2
 */

// Endereços dos tokens
export const TPF_ADDRESS = "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45".toLowerCase()
export const WLD_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003".toLowerCase()

// Rede World Chain
export const WORLD_CHAIN_NETWORK = "worldchain"

// Base URL da API
const API_BASE_URL = "https://api.geckoterminal.com/api/v2"

// Headers padrão
const DEFAULT_HEADERS = {
  Accept: "application/json;version=20230302",
}

/**
 * Obtém o preço de um token específico na rede World Chain
 * @param tokenAddress Endereço do token
 * @returns Preço do token em USD
 */
export async function getTokenPrice(tokenAddress: string): Promise<number | null> {
  try {
    console.log(`[GeckoTerminal] Buscando preço para o token: ${tokenAddress}`)

    // Primeiro, tentamos buscar o preço diretamente pelo endereço do token
    const url = `${API_BASE_URL}/simple/networks/${WORLD_CHAIN_NETWORK}/token_price/${tokenAddress}`

    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
    })

    if (!response.ok) {
      console.log(`[GeckoTerminal] Erro ao buscar preço do token: ${response.status}`)

      // Se não encontrarmos na World Chain, tentamos buscar em outras redes
      return await getTokenPriceFromAlternativeSources(tokenAddress)
    }

    const data = await response.json()
    console.log(`[GeckoTerminal] Resposta da API:`, data)

    if (data && data.data && data.data.length > 0 && data.data[0].attributes && data.data[0].attributes.token_prices) {
      const prices = data.data[0].attributes.token_prices
      const price = prices[tokenAddress.toLowerCase()]

      if (price) {
        console.log(`[GeckoTerminal] Preço encontrado: $${price}`)
        return Number.parseFloat(price)
      }
    }

    // Se não encontrarmos o preço, tentamos fontes alternativas
    return await getTokenPriceFromAlternativeSources(tokenAddress)
  } catch (error) {
    console.error(`[GeckoTerminal] Erro ao buscar preço do token:`, error)
    return await getTokenPriceFromAlternativeSources(tokenAddress)
  }
}

/**
 * Busca o preço de um token em fontes alternativas
 * @param tokenAddress Endereço do token
 * @returns Preço do token em USD
 */
async function getTokenPriceFromAlternativeSources(tokenAddress: string): Promise<number | null> {
  // Determinar qual token estamos buscando
  const isTPF = tokenAddress.toLowerCase() === TPF_ADDRESS
  const isWLD = tokenAddress.toLowerCase() === WLD_ADDRESS

  if (isWLD) {
    return await getWLDPriceFromCoinGecko()
  }

  if (isTPF) {
    return await getTPFPriceFromCoinGecko()
  }

  return null
}

/**
 * Busca o preço do WLD no CoinGecko
 * @returns Preço do WLD em USD
 */
async function getWLDPriceFromCoinGecko(): Promise<number | null> {
  try {
    console.log(`[CoinGecko] Buscando preço do WLD`)

    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=worldcoin&vs_currencies=usd")

    if (!response.ok) {
      console.log(`[CoinGecko] Erro ao buscar preço do WLD: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data && data.worldcoin && data.worldcoin.usd) {
      const price = data.worldcoin.usd
      console.log(`[CoinGecko] Preço do WLD: $${price}`)
      return price
    }

    return null
  } catch (error) {
    console.error(`[CoinGecko] Erro ao buscar preço do WLD:`, error)
    return null
  }
}

/**
 * Busca o preço do TPF no CoinGecko
 * @returns Preço do TPF em USD
 */
async function getTPFPriceFromCoinGecko(): Promise<number | null> {
  try {
    console.log(`[CoinGecko] Buscando preço do TPF`)

    // Como o TPF pode não estar listado no CoinGecko, tentamos buscar por um ID específico
    // ou por um endpoint personalizado se disponível

    // Exemplo: se o TPF tiver um ID no CoinGecko
    const tpfId = "tradepulse" // Substitua pelo ID correto se existir

    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tpfId}&vs_currencies=usd`)

    if (!response.ok) {
      console.log(`[CoinGecko] Erro ao buscar preço do TPF: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data && data[tpfId] && data[tpfId].usd) {
      const price = data[tpfId].usd
      console.log(`[CoinGecko] Preço do TPF: $${price}`)
      return price
    }

    return null
  } catch (error) {
    console.error(`[CoinGecko] Erro ao buscar preço do TPF:`, error)
    return null
  }
}

/**
 * Busca dados históricos de preço para um token
 * @param tokenAddress Endereço do token
 * @param timeframe Período de tempo (1m, 5m, 15m, 1h, 4h, 8h, 24h)
 * @returns Array de dados históricos de preço
 */
export async function getTokenPriceHistory(
  tokenAddress: string,
  timeframe: string,
): Promise<{ time: string; price: number }[]> {
  try {
    console.log(`[GeckoTerminal] Buscando histórico de preços para o token: ${tokenAddress}, timeframe: ${timeframe}`)

    // Determinar qual token estamos buscando
    const isTPF = tokenAddress.toLowerCase() === TPF_ADDRESS
    const isWLD = tokenAddress.toLowerCase() === WLD_ADDRESS

    // Para o WLD, podemos tentar buscar dados do CoinGecko
    if (isWLD) {
      const wldHistory = await getWLDPriceHistoryFromCoinGecko(timeframe)
      if (wldHistory && wldHistory.length > 0) {
        return wldHistory
      }
    }

    // Para o TPF, podemos tentar buscar dados de uma fonte específica
    if (isTPF) {
      const tpfHistory = await getTPFPriceHistoryFromCoinGecko(timeframe)
      if (tpfHistory && tpfHistory.length > 0) {
        return tpfHistory
      }
    }

    // Se não conseguirmos dados históricos, retornamos um array vazio
    console.log(`[GeckoTerminal] Não foi possível obter histórico de preços para o token: ${tokenAddress}`)
    return []
  } catch (error) {
    console.error(`[GeckoTerminal] Erro ao buscar histórico de preços:`, error)
    return []
  }
}

/**
 * Busca histórico de preços do WLD no CoinGecko
 * @param timeframe Período de tempo
 * @returns Array de dados históricos de preço
 */
async function getWLDPriceHistoryFromCoinGecko(timeframe: string): Promise<{ time: string; price: number }[]> {
  try {
    console.log(`[CoinGecko] Buscando histórico de preços do WLD, timeframe: ${timeframe}`)

    // Converter o timeframe para dias (para a API do CoinGecko)
    let days = 1
    switch (timeframe) {
      case "1m":
      case "5m":
      case "15m":
        days = 1
        break
      case "1h":
      case "4h":
      case "8h":
        days = 7
        break
      case "24h":
        days = 30
        break
      default:
        days = 30
    }

    // Buscar dados de mercado do WLD
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/worldcoin/market_chart?vs_currency=usd&days=${days}`,
    )

    if (!response.ok) {
      console.log(`[CoinGecko] Erro ao buscar histórico do WLD: ${response.status}`)
      return []
    }

    const data = await response.json()

    if (data && data.prices && data.prices.length > 0) {
      // Processar os dados para o formato esperado
      return data.prices.map((item: [number, number]) => {
        const date = new Date(item[0])
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

        return {
          time: timeString,
          price: item[1],
        }
      })
    }

    return []
  } catch (error) {
    console.error(`[CoinGecko] Erro ao buscar histórico do WLD:`, error)
    return []
  }
}

/**
 * Busca histórico de preços do TPF no CoinGecko
 * @param timeframe Período de tempo
 * @returns Array de dados históricos de preço
 */
async function getTPFPriceHistoryFromCoinGecko(timeframe: string): Promise<{ time: string; price: number }[]> {
  try {
    console.log(`[CoinGecko] Buscando histórico de preços do TPF, timeframe: ${timeframe}`)

    // Como o TPF pode não estar listado no CoinGecko, esta função pode precisar ser adaptada
    // para buscar dados de uma fonte específica

    // Exemplo: se o TPF tiver um ID no CoinGecko
    const tpfId = "tradepulse" // Substitua pelo ID correto se existir

    // Converter o timeframe para dias (para a API do CoinGecko)
    let days = 1
    switch (timeframe) {
      case "1m":
      case "5m":
      case "15m":
        days = 1
        break
      case "1h":
      case "4h":
      case "8h":
        days = 7
        break
      case "24h":
        days = 30
        break
      default:
        days = 30
    }

    // Buscar dados de mercado do TPF
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${tpfId}/market_chart?vs_currency=usd&days=${days}`,
    )

    if (!response.ok) {
      console.log(`[CoinGecko] Erro ao buscar histórico do TPF: ${response.status}`)
      return []
    }

    const data = await response.json()

    if (data && data.prices && data.prices.length > 0) {
      // Processar os dados para o formato esperado
      return data.prices.map((item: [number, number]) => {
        const date = new Date(item[0])
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

        return {
          time: timeString,
          price: item[1],
        }
      })
    }

    return []
  } catch (error) {
    console.error(`[CoinGecko] Erro ao buscar histórico do TPF:`, error)
    return []
  }
}

/**
 * Verifica se um token está listado em alguma exchange
 * @param tokenAddress Endereço do token
 * @returns true se o token estiver listado, false caso contrário
 */
export async function isTokenListed(tokenAddress: string): Promise<boolean> {
  try {
    // Primeiro, tentamos buscar o preço do token
    const price = await getTokenPrice(tokenAddress)

    // Se conseguirmos um preço, o token está listado
    return price !== null
  } catch (error) {
    console.error(`[GeckoTerminal] Erro ao verificar se o token está listado:`, error)
    return false
  }
}

/**
 * Obtém o preço atual do ETH em USD
 * @returns Preço do ETH em USD
 */
export async function getETHPrice(): Promise<number> {
  try {
    console.log(`[CoinGecko] Buscando preço do ETH`)

    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")

    if (!response.ok) {
      console.log(`[CoinGecko] Erro ao buscar preço do ETH: ${response.status}`)
      return 1800 // Valor padrão
    }

    const data = await response.json()

    if (data && data.ethereum && data.ethereum.usd) {
      const price = data.ethereum.usd
      console.log(`[CoinGecko] Preço do ETH: $${price}`)
      return price
    }

    return 1800 // Valor padrão
  } catch (error) {
    console.error(`[CoinGecko] Erro ao buscar preço do ETH:`, error)
    return 1800 // Valor padrão
  }
}
