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
  const tokenSymbol = searchParams.get("token") || "WLD"

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  // Configuração dos tokens
  const tokens = {
    WLD: {
      address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      chain: worldChain,
      rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
      chainName: "World Chain",
    },
    TPF: {
      address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
      chain: worldChain,
      rpcUrl: "https://worldchain-mainnet.g.alchemy.com/public",
      chainName: "World Chain",
    },
  }

  // Verificar se o token solicitado é suportado
  if (!tokens[tokenSymbol as keyof typeof tokens]) {
    return NextResponse.json({ error: `Token ${tokenSymbol} not supported` }, { status: 400 })
  }

  const tokenConfig = tokens[tokenSymbol as keyof typeof tokens]

  try {
    console.log(
      `[Real Balance API] Fetching ${tokenSymbol} balance for address: ${address} on ${tokenConfig.chainName}`,
    )

    // Criar um cliente público para interagir com a blockchain
    const client = createPublicClient({
      chain: tokenConfig.chain,
      transport: http(tokenConfig.rpcUrl),
    })

    console.log(`[Real Balance API] Using token contract: ${tokenConfig.address}`)

    // Buscar os decimais do token primeiro
    let decimals
    try {
      decimals = await client.readContract({
        address: tokenConfig.address as `0x${string}`,
        abi: tokenAbi,
        functionName: "decimals",
      })
      console.log(`[Real Balance API] Token decimals: ${decimals}`)
    } catch (error) {
      console.error(`[Real Balance API] Error fetching token decimals:`, error)
      // Assumir 18 decimais como padrão para tokens ERC20
      decimals = 18
      console.log(`[Real Balance API] Using default decimals: ${decimals}`)
    }

    // Buscar o saldo do token
    const balance = await client.readContract({
      address: tokenConfig.address as `0x${string}`,
      abi: tokenAbi,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    })
    console.log(`[Real Balance API] Raw balance: ${balance.toString()}`)

    // Converter o saldo para um formato legível
    const formattedBalance = Number(balance) / 10 ** Number(decimals)
    console.log(`[Real Balance API] Formatted balance: ${formattedBalance}`)

    return NextResponse.json({
      balance: formattedBalance,
      rawBalance: balance.toString(),
      decimals,
      source: tokenConfig.chainName,
      token: tokenSymbol,
      contract: tokenConfig.address,
    })
  } catch (error) {
    console.error(`[Real Balance API] Error fetching ${tokenSymbol} balance:`, error)

    // Retornar erro em vez de um valor simulado
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : `Failed to fetch ${tokenSymbol} balance`,
        token: tokenSymbol,
        contract: tokenConfig.address,
      },
      { status: 500 },
    )
  }
}
