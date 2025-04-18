import { NextResponse } from "next/server"
import { ethers } from "ethers"

export async function GET() {
  // Endereço do contrato WLD na rede Worldchain
  const wldTokenAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003"

  // ABI mínimo para verificar o contrato
  const minAbi = [
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
  ]

  try {
    console.log(`[Verify WLD] Verificando contrato WLD em ${wldTokenAddress} na Worldchain`)

    // Criar provider para Worldchain
    const provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

    // Verificar se o endereço é um contrato
    const code = await provider.getCode(wldTokenAddress)

    if (code === "0x") {
      return NextResponse.json({
        valid: false,
        error: "O endereço não é um contrato na Worldchain",
        address: wldTokenAddress,
        network: "Worldchain",
      })
    }

    // Criar instância do contrato
    const contract = new ethers.Contract(wldTokenAddress, minAbi, provider)

    // Tentar obter informações básicas do token
    const [symbol, name, decimals, totalSupply] = await Promise.all([
      contract.symbol().catch(() => "Desconhecido"),
      contract.name().catch(() => "Desconhecido"),
      contract.decimals().catch(() => "Desconhecido"),
      contract.totalSupply().catch(() => "Desconhecido"),
    ])

    // Verificar se o contrato parece ser um token ERC-20
    const isERC20 = symbol !== "Desconhecido" && decimals !== "Desconhecido"

    return NextResponse.json({
      valid: isERC20,
      address: wldTokenAddress,
      network: "Worldchain",
      symbol,
      name,
      decimals: decimals !== "Desconhecido" ? Number(decimals) : "Desconhecido",
      totalSupply: totalSupply !== "Desconhecido" ? totalSupply.toString() : "Desconhecido",
      isERC20,
    })
  } catch (error) {
    console.error("[Verify WLD] Erro ao verificar contrato:", error)

    return NextResponse.json({
      valid: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      address: wldTokenAddress,
      network: "Worldchain",
    })
  }
}
