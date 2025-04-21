import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client"

// Criar cliente Apollo para o Uniswap Subgraph
export const uniswapClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  }),
  cache: new InMemoryCache(),
})

// Endereço do token TPF no Uniswap (substitua pelo endereço real do seu token)
export const TPF_ADDRESS = "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45".toLowerCase()

// Endereço do token WLD no Uniswap (substitua pelo endereço real)
export const WLD_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003".toLowerCase()

// Consulta para obter o preço do token em ETH
const TOKEN_PRICE_QUERY = gql`
  query tokenPrice($tokenAddress: String!) {
    token(id: $tokenAddress) {
      derivedETH
      totalLiquidity
      symbol
      name
    }
  }
`

// Consulta para obter o preço do ETH em USD
const ETH_PRICE_QUERY = gql`
  query ethPrice {
    bundle(id: "1") {
      ethPrice
    }
  }
`

// Consulta para obter dados históricos de preço
const TOKEN_PRICE_HISTORY_QUERY = gql`
  query tokenPriceHistory($tokenAddress: String!, $skip: Int!) {
    tokenDayDatas(
      first: 100
      skip: $skip
      orderBy: date
      orderDirection: desc
      where: { token: $tokenAddress }
    ) {
      date
      priceUSD
      totalLiquidityUSD
      dailyVolumeUSD
    }
  }
`

// Função para obter o preço atual do token
export async function getTokenPrice(tokenAddress: string): Promise<{
  priceUSD: number
  priceETH: number
  totalLiquidity: string
  ethPrice: number
  symbol: string
  name: string
}> {
  console.log(`[Uniswap] Fetching price for token: ${tokenAddress}`)

  // Obter preço do ETH em USD
  console.log("[Uniswap] Fetching ETH price...")
  const ethResult = await uniswapClient.query({
    query: ETH_PRICE_QUERY,
  })

  if (!ethResult.data || !ethResult.data.bundle) {
    throw new Error("Failed to fetch ETH price from Uniswap")
  }

  const ethPrice = ethResult.data.bundle.ethPrice
  console.log(`[Uniswap] ETH price: ${ethPrice}`)

  // Obter preço do token em ETH
  console.log(`[Uniswap] Fetching token data for ${tokenAddress}...`)
  const tokenResult = await uniswapClient.query({
    query: TOKEN_PRICE_QUERY,
    variables: { tokenAddress },
  })

  console.log("[Uniswap] Token data response:", JSON.stringify(tokenResult.data, null, 2))

  if (!tokenResult.data || !tokenResult.data.token) {
    throw new Error(`No data found for token ${tokenAddress} on Uniswap`)
  }

  const tokenData = tokenResult.data.token
  const priceETH = Number.parseFloat(tokenData.derivedETH || "0")
  const priceUSD = priceETH * Number.parseFloat(ethPrice)

  console.log(`[Uniswap] Token price: ${priceUSD} USD (${priceETH} ETH)`)

  return {
    priceUSD,
    priceETH,
    totalLiquidity: tokenData.totalLiquidity || "0",
    ethPrice: Number.parseFloat(ethPrice),
    symbol: tokenData.symbol,
    name: tokenData.name,
  }
}

// Função para obter histórico de preços
export async function getTokenPriceHistory(
  tokenAddress: string,
  timeframe: string,
): Promise<{ time: string; price: number }[]> {
  console.log(`[Uniswap] Fetching price history for token: ${tokenAddress}, timeframe: ${timeframe}`)

  // Determinar quantos dias buscar com base no timeframe
  let daysToFetch = 30 // padrão para 1 mês

  switch (timeframe) {
    case "1h":
    case "4h":
    case "8h":
    case "24h":
      daysToFetch = 7 // 1 semana para timeframes curtos
      break
    case "1m":
    case "5m":
    case "15m":
      daysToFetch = 1 // 1 dia para timeframes muito curtos
      break
    default:
      daysToFetch = 30 // 1 mês para outros casos
  }

  // Buscar dados históricos
  console.log(`[Uniswap] Querying historical data for ${daysToFetch} days...`)
  const result = await uniswapClient.query({
    query: TOKEN_PRICE_HISTORY_QUERY,
    variables: {
      tokenAddress,
      skip: 0,
    },
  })

  console.log("[Uniswap] History data response:", JSON.stringify(result.data, null, 2))

  if (!result.data || !result.data.tokenDayDatas || result.data.tokenDayDatas.length === 0) {
    throw new Error(`No historical data found for token ${tokenAddress} on Uniswap`)
  }

  const historyData = result.data.tokenDayDatas

  // Processar dados históricos
  console.log(`[Uniswap] Processing ${historyData.length} historical data points`)
  const processedData = historyData
    .slice(0, daysToFetch)
    .reverse()
    .map((item: any) => {
      const date = new Date(item.date * 1000)
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
        price: Number.parseFloat(item.priceUSD || "0"),
      }
    })

  return processedData
}

// Função para verificar se um token está listado no Uniswap
export async function isTokenListedOnUniswap(tokenAddress: string): Promise<boolean> {
  try {
    console.log(`[Uniswap] Checking if token ${tokenAddress} is listed on Uniswap`)
    const result = await uniswapClient.query({
      query: TOKEN_PRICE_QUERY,
      variables: { tokenAddress },
    })

    return !!(result.data && result.data.token)
  } catch (error) {
    console.error(`[Uniswap] Error checking token listing:`, error)
    return false
  }
}

// Função para obter preços de tokens de uma API alternativa (CoinGecko)
export async function getTokenPriceFromCoinGecko(tokenId: string): Promise<number | null> {
  try {
    console.log(`[CoinGecko] Fetching price for token: ${tokenId}`)
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`)

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    if (data && data[tokenId] && data[tokenId].usd) {
      console.log(`[CoinGecko] Price for ${tokenId}: $${data[tokenId].usd}`)
      return data[tokenId].usd
    }

    return null
  } catch (error) {
    console.error(`[CoinGecko] Error fetching token price:`, error)
    return null
  }
}

// Função para obter preço do WLD de uma fonte confiável
export async function getWLDPrice(): Promise<number | null> {
  try {
    // Tentar obter o preço do WLD do CoinGecko
    const wldPrice = await getTokenPriceFromCoinGecko("worldcoin")
    if (wldPrice) return wldPrice

    // Se falhar, tentar outra API
    const response = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT")

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const data = await response.json()
    if (data && data.price) {
      return Number.parseFloat(data.price)
    }

    return null
  } catch (error) {
    console.error("Error fetching WLD price:", error)
    return null
  }
}

// Função para obter preço do TPF de uma fonte confiável
export async function getTPFPrice(): Promise<number | null> {
  // Como TPF é um token personalizado, podemos tentar obter seu preço de várias fontes
  try {
    // Tentar obter o preço do Uniswap primeiro
    const tpfData = await getTokenPrice(TPF_ADDRESS)
    if (tpfData && tpfData.priceUSD > 0) {
      return tpfData.priceUSD
    }

    // Se não encontrar no Uniswap, tentar outras fontes
    // Aqui você pode adicionar chamadas para outras APIs que possam ter o preço do TPF

    return null
  } catch (error) {
    console.error("Error fetching TPF price:", error)
    return null
  }
}
