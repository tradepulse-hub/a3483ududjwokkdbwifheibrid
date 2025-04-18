"use client"

import { useEffect, useState } from "react"

type DebugInfo = {
  originalAppId: string
  formattedAppId: string
  isValidFormat: boolean
  isValidAppId: boolean
  apiResponse: any
  devPortalApiKey: string
}

export default function AppIdDebugger() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        const response = await fetch("/api/debug-app-id")
        if (!response.ok) {
          throw new Error(`Erro ao buscar informações de debug: ${response.status}`)
        }
        const data = await response.json()
        setDebugInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchDebugInfo()
  }, [])

  if (loading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-white">Carregando informações de debug...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900 rounded-lg">
        <p className="text-white">Erro: {error}</p>
      </div>
    )
  }

  if (!debugInfo) {
    return (
      <div className="p-4 bg-red-900 rounded-lg">
        <p className="text-white">Nenhuma informação de debug disponível</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">Informações de Debug do APP_ID</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">APP_ID Original:</h3>
          <p className="font-mono bg-gray-700 p-2 rounded">{debugInfo.originalAppId || "Não definido"}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">APP_ID Formatado:</h3>
          <p className="font-mono bg-gray-700 p-2 rounded">{debugInfo.formattedAppId || "Não definido"}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Formato Válido:</h3>
          <p className={`font-mono p-2 rounded ${debugInfo.isValidFormat ? "bg-green-700" : "bg-red-700"}`}>
            {debugInfo.isValidFormat ? "Sim" : "Não"}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">APP_ID Válido na API:</h3>
          <p className={`font-mono p-2 rounded ${debugInfo.isValidAppId ? "bg-green-700" : "bg-red-700"}`}>
            {debugInfo.isValidAppId ? "Sim" : "Não"}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">DEV_PORTAL_API_KEY:</h3>
          <p
            className={`font-mono p-2 rounded ${debugInfo.devPortalApiKey.includes("Presente") ? "bg-green-700" : "bg-red-700"}`}
          >
            {debugInfo.devPortalApiKey}
          </p>
        </div>

        {debugInfo.apiResponse && (
          <div>
            <h3 className="text-lg font-semibold">Resposta da API:</h3>
            <pre className="font-mono bg-gray-700 p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(debugInfo.apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {!debugInfo.isValidAppId && (
        <div className="mt-6 p-4 bg-yellow-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Solução de Problemas:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Verifique se o APP_ID está correto no arquivo .env</li>
            <li>Certifique-se de que o aplicativo existe no Developer Portal</li>
            <li>Verifique se você tem permissões para acessar este aplicativo</li>
            <li>Certifique-se de que o APP_ID começa com "app_"</li>
          </ul>
        </div>
      )}
    </div>
  )
}
