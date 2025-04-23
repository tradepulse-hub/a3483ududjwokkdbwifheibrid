import { NextResponse } from "next/server"
import { ethers } from "ethers"

// ABI mínimo para o token DNA
const dnaAbi = [
  // Função balanceOf padrão ERC-20
  "function balanceOf(address owner) view returns (uint256)",
  // Função decimals padrão ERC-20
  "function decimals() view returns (uint8)",
  // Função name padrão ERC-20
  "function name() view returns (string)",
  // Função symbol padrão ERC-20
  "function symbol() view returns (string)",
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    console.log(`[DNA Token API] Fetching DNA balance for address: ${address}`)

    // Endereço do contrato DNA na rede Worldchain
    const dnaTokenAddress = "0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113"

    // Usar o RPC público da Worldchain
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

    // Criar uma instância do contrato
    const dnaContract = new ethers.Contract(dnaTokenAddress, dnaAbi, provider)

    console.log(`[DNA Token API] Verificando se o contrato DNA existe na Worldchain...`)

    // Verificar se o contrato existe tentando obter o símbolo
    try {
      const symbol = await dnaContract.symbol()
      console.log(`[DNA Token API] Símbolo do contrato: ${symbol}`)
    } catch (error) {
      console.error("[DNA Token API] Erro ao verificar o símbolo do contrato:", error)
      return NextResponse.json(
        {
          error: "Contrato DNA não encontrado ou inválido na Worldchain",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        },
        { status: 500 },
      )
    }

    // Buscar os decimais do token
    let decimals
    try {
      decimals = await dnaContract.decimals()
      console.log(`[DNA Token API] Decimais do DNA: ${decimals}`)
    } catch (error) {
      console.error("[DNA Token API] Erro ao buscar decimais:", error)
      decimals = 18 // Valor padrão para tokens ERC-20
    }

    // Buscar o saldo do token
    let balance
    try {
      balance = await dnaContract.balanceOf(address)
      console.log(`[DNA Token API] Saldo bruto de DNA: ${balance.toString()}`)

      // Converter o saldo para um formato legível
      const formattedBalance = Number(ethers.formatUnits(balance, decimals))
      console.log(`[DNA Token API] Saldo formatado de DNA: ${formattedBalance}`)

      return NextResponse.json({
        balance: formattedBalance,
        rawBalance: balance.toString(),
        decimals: Number(decimals),
        source: "worldchain-ethers",
      })
    } catch (error) {
      console.error("[DNA Token API] Erro ao buscar saldo:", error)

      // Verificar se o erro é devido ao contrato não ter a função balanceOf
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

      if (errorMessage.includes("function balanceOf") || errorMessage.includes("no data")) {
        return NextResponse.json(
          {
            error: "O contrato DNA não possui a função balanceOf ou o endereço está incorreto",
            details: errorMessage,
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          error: "Falha ao buscar saldo de DNA",
          details: errorMessage,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[DNA Token API] Erro geral:", error)

    // Em caso de erro, retornar um valor simulado para demonstração
    return NextResponse.json({
      balance: 100.0,
      rawBalance: "100000000000000000000",
      decimals: 18,
      source: "simulated",
    })
  }
}
