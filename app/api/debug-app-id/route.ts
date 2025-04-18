import { NextResponse } from "next/server"
import { formatAppId } from "@/lib/env"

export async function GET() {
  try {
    const appId = process.env.APP_ID || ""
    const formattedAppId = formatAppId(appId)

    // Verificar se o APP_ID está formatado corretamente
    const isValidFormat = formattedAppId.startsWith("app_")

    // Tentar fazer uma chamada para a API do Developer Portal para verificar se o APP_ID é válido
    let isValidAppId = false
    let apiResponse = null

    try {
      const response = await fetch(`https://developer.worldcoin.org/api/v2/minikit/app?app_id=${formattedAppId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
      })

      apiResponse = await response.json()
      isValidAppId = response.ok
    } catch (error) {
      console.error("Erro ao verificar APP_ID:", error)
    }

    return NextResponse.json({
      originalAppId: appId,
      formattedAppId: formattedAppId,
      isValidFormat,
      isValidAppId,
      apiResponse,
      devPortalApiKey: process.env.DEV_PORTAL_API_KEY ? "Presente (não exibido por segurança)" : "Ausente",
    })
  } catch (error) {
    console.error("Erro ao processar a requisição:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar a requisição",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
