/**
 * Service to interact with the DexScreener API
 */

const API_BASE_URL = "https://api.dexscreener.com/tokens/v1"

export interface DexScreenerPair {
  chainId: string
  dexId: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceUsd: string
}

interface DexScreenerResponse {
  pairs: DexScreenerPair[]
}

/**
 * Fetches token prices from DexScreener
 * @param chainId The chain ID of the token
 * @param tokenAddresses Comma-separated list of token addresses
 * @returns An array of DexScreenerPair objects
 */
export async function getTokenPrices(chainId: string, tokenAddresses: string): Promise<DexScreenerPair[]> {
  try {
    console.log(`[DexScreener] Fetching prices for tokens ${tokenAddresses} on chain ${chainId}`)

    const apiUrl = `${API_BASE_URL}/${chainId}/${tokenAddresses}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: DexScreenerResponse = await response.json()
    console.log(`[DexScreener] Response data:`, data)

    return data.pairs || []
  } catch (error) {
    console.error("[DexScreener] Error fetching token prices:", error)
    return []
  }
}
