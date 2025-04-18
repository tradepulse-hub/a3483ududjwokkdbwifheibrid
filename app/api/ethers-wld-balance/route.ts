import { NextResponse } from "next/server"
import { ethers } from "ethers"

// ABI mínimo para o token WLD
const wldAbi = [
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
    console.log(`[Ethers WLD API] Fetching WLD balance for address: ${address}`)

    // Endereço do contrato WLD na rede Worldchain
    const wldTokenAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003"

    // Usar o RPC público da Worldchain
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

    // Criar uma instância do contrato
    const wldContract = new ethers.Contract(wldTokenAddress, wldAbi, provider)

    console.log(`[Ethers WLD API] Verificando se o contrato WLD existe na Worldchain...`)

    // Verificar se o contrato existe tentando obter o símbolo
    try {
      const symbol = await wldContract.symbol()
      console.log(`[Ethers WLD API] Símbolo do contrato: ${symbol}`)
    } catch (error) {
      console.error("[Ethers WLD API] Erro ao verificar o símbolo do contrato:", error)
      return NextResponse.json(
        {
          error: "Contrato WLD não encontrado ou inválido na Worldchain",
          details: error instanceof Error ? error.message : "Erro desconhecido",
        },
        { status: 500 },
      )
    }

    // Buscar os decimais do token
    let decimals
    try {
      decimals = await wldContract.decimals()
      console.log(`[Ethers WLD API] Decimais do WLD: ${decimals}`)
    } catch (error) {
      console.error("[Ethers WLD API] Erro ao buscar decimais:", error)
      decimals = 18 // Valor padrão para tokens ERC-20
    }

    // Buscar o saldo do token
    let balance
    try {
      balance = await wldContract.balanceOf(address)
      console.log(`[Ethers WLD API] Saldo bruto de WLD: ${balance.toString()}`)

      // Converter o saldo para um formato legível
      const formattedBalance = Number(ethers.formatUnits(balance, decimals))
      console.log(`[Ethers WLD API] Saldo formatado de WLD: ${formattedBalance}`)

      return NextResponse.json({
        balance: formattedBalance,
        rawBalance: balance.toString(),
        decimals: Number(decimals),
        source: "worldchain-ethers",
      })
    } catch (error) {
      console.error("[Ethers WLD API] Erro ao buscar saldo:", error)

      // Verificar se o erro é devido ao contrato não ter a função balanceOf
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

      if (errorMessage.includes("function balanceOf") || errorMessage.includes("no data")) {
        return NextResponse.json(
          {
            error: "O contrato WLD não possui a função balanceOf ou o endereço está incorreto",
            details: errorMessage,
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          error: "Falha ao buscar saldo de WLD",
          details: errorMessage,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[Ethers WLD API] Erro geral:", error)

    return NextResponse.json(
      {
        error: "Erro ao processar solicitação de saldo WLD",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
