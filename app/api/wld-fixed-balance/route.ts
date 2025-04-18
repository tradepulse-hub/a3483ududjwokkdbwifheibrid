import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Valor fixo para o saldo de WLD
  const fixedBalance = 12.75

  console.log(`[WLD FIXED API] Returning fixed WLD balance: ${fixedBalance}`)

  return NextResponse.json({
    balance: fixedBalance,
    rawBalance: (fixedBalance * 10 ** 18).toString(),
    decimals: 18,
    source: "fixed_value",
  })
}
