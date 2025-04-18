import { NextResponse } from "next/server"
import { createPublicClient, http, parseAbi } from "viem"
import { optimism } from "viem/chains"
import { worldChain } from "@/lib/chains"

// ABI mínimo para consultar o saldo de um token ERC20
const tokenAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    console.log(`[Primary API] Fetching balance for address: ${address} on World Chain`)

    // Criar um cliente público para interagir com a World Chain
    const client = createPublicClient({
      chain: worldChain,
      transport: http(),
    })

    // Endereço do contrato TPF
    const tokenAddress = "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45"

    console.log(`[Primary API] Using token contract: ${tokenAddress}`)

    // Buscar os decimais do token primeiro
    let decimals
    try {
      decimals = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: tokenAbi,
        functionName: "decimals",
      })
      console.log(`[Primary API] Token decimals: ${decimals}`)
    } catch (error) {
      console.error("[Primary API] Error fetching token decimals:", error)
      // Assumir 18 decimais como padrão para tokens ERC20
      decimals = 18
      console.log(`[Primary API] Using default decimals: ${decimals}`)
    }

    // Buscar o saldo do token
    let balance
    try {
      balance = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: tokenAbi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      })
      console.log(`[Primary API] Raw balance: ${balance.toString()}`)
    } catch (error) {
      console.error("[Primary API] Error fetching token balance:", error)
      throw new Error("Failed to fetch token balance from World Chain")
    }

    // Converter o saldo para um formato legível
    const formattedBalance = Number(balance) / 10 ** Number(decimals)
    console.log(`[Primary API] Formatted balance: ${formattedBalance}`)

    return NextResponse.json({
      balance: formattedBalance,
      rawBalance: balance.toString(),
      decimals,
      source: "world-chain",
    })
  } catch (error) {
    console.error("[Primary API] Error in token balance API:", error)

    // Tentar com Optimism como fallback
    try {
      console.log(`[Primary API] Trying Optimism fallback for address: ${address}`)

      // Criar um cliente público para interagir com Optimism
      const optimismClient = createPublicClient({
        chain: optimism,
        transport: http("https://mainnet.optimism.io"),
      })

      // Endereço do contrato TPF
      const tokenAddress = "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45"

      // Buscar os decimais do token
      const decimals = await optimismClient
        .readContract({
          address: tokenAddress as `0x${string}`,
          abi: tokenAbi,
          functionName: "decimals",
        })
        .catch(() => 18) // Fallback para 18 decimais

      // Buscar o saldo do token
      const balance = await optimismClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: tokenAbi,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      })

      // Converter o saldo para um formato legível
      const formattedBalance = Number(balance) / 10 ** Number(decimals)

      return NextResponse.json({
        balance: formattedBalance,
        rawBalance: balance.toString(),
        decimals,
        source: "optimism",
      })
    } catch (optimismError) {
      console.error("[Primary API] Optimism fallback also failed:", optimismError)

      // Se ambos falharem, retornar um valor simulado
      return NextResponse.json({
        error: "Failed to fetch token balance from both World Chain and Optimism",
        balance: 1000,
        rawBalance: "1000000000000000000000",
        decimals: 18,
        simulated: true,
        source: "simulated",
      })
    }
  }
}
