/**
 * Formata o APP_ID para garantir que ele tenha o prefixo "app_"
 */
export function formatAppId(appId: string): string {
  if (!appId) return ""

  // Se já começa com "app_", retorna como está
  if (appId.startsWith("app_")) {
    return appId
  }

  // Caso contrário, adiciona o prefixo "app_"
  return `app_${appId}`
}
