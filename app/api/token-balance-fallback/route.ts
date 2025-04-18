import { NextResponse } from "next/server"
import { createPublicClient, http, parseAbi } from "viem"
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
    console.log(`[Fallback API] Fetching balance for address: ${address} on World Chain`)

    // Criar um cliente público para interagir com a World Chain
    const client = createPublicClient({
      chain: worldChain,
      transport: http(),
    })

    // Endereço do contrato TPF
    const tokenAddress = "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45"

    console.log(`[Fallback API] Using token contract: ${tokenAddress}`)

    // Buscar os decimais do token primeiro
    let decimals
    try {
      decimals = await client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: tokenAbi,
        functionName: "decimals",
      })
      console.log(`[Fallback API] Token decimals: ${decimals}`)
    } catch (error) {
      console.error("[Fallback API] Error fetching token decimals:", error)
      // Assumir 18 decimais como padrão para tokens ERC20
      decimals = 18
      console.log(`[Fallback API] Using default decimals: ${decimals}`)
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
      console.log(`[Fallback API] Raw balance: ${balance.toString()}`)
    } catch (error) {
      console.error("[Fallback API] Error fetching token balance:", error)
      throw new Error("Failed to fetch token balance from World Chain")
    }

    // Converter o saldo para um formato legível
    const formattedBalance = Number(balance) / 10 ** Number(decimals)
    console.log(`[Fallback API] Formatted balance: ${formattedBalance}`)

    return NextResponse.json({
      balance: formattedBalance,
      rawBalance: balance.toString(),
      decimals,
      source: "world-chain",
    })
  } catch (error) {
    console.error("[Fallback API] Error in token balance API:", error)

    // Se falhar, retornar um valor simulado
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      balance: 1000,
      rawBalance: "1000000000000000000000",
      decimals: 18,
      simulated: true,
      source: "simulated",
    })
  }
}
