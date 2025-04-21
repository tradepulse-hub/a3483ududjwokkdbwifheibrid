import type { Post, UserProfile } from "@/types/square"

// Lista de criptomoedas suportadas
export const SUPPORTED_CRYPTOS = [
  "BTC",
  "ETH",
  "BNB",
  "XRP",
  "ADA",
  "SOL",
  "DOT",
  "DOGE",
  "AVAX",
  "MATIC",
  "LINK",
  "UNI",
  "ATOM",
  "LTC",
  "ALGO",
  "XLM",
  "NEAR",
  "FTM",
  "HBAR",
  "ONE",
]

// Função para ordenar posts por data
export function sortPostsByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.createdAt - a.createdAt)
}

// Função para ordenar posts por popularidade (número de likes)
export function sortPostsByPopularity(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
}

// Função para filtrar posts por criptomoeda
export function filterPostsByCrypto(posts: Post[], crypto: string): Post[] {
  return posts.filter((post) => post.cryptoTags?.includes(crypto))
}

// Função para verificar se um usuário está banido
export function isUserBanned(profile: UserProfile | null): boolean {
  return false
}

// Função para obter o tempo restante de banimento
export function getBanTimeRemaining(profile: UserProfile | null): number {
  return 0
}

// Função para formatar data
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

// Função para verificar se um usuário é administrador
export function isAdmin(profile: UserProfile | null): boolean {
  return false
}

// Função para obter o nome de exibição de um usuário
export function getDisplayName(profile: UserProfile | null): string {
  if (!profile) return "Unknown User"
  return profile.nickname || `${profile.address.substring(0, 6)}...${profile.address.substring(38)}`
}

// Função para obter a imagem de perfil padrão
export function getDefaultProfilePicture(address: string): string {
  return `https://avatar.vercel.sh/${address}`
}

// Função para extrair hashtags de um texto
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g
  const matches = text.match(hashtagRegex)
  if (!matches) return []
  return matches.map((match) => match.substring(1))
}

// Função para verificar se uma criptomoeda é suportada
export function isCryptoSupported(crypto: string): boolean {
  return SUPPORTED_CRYPTOS.includes(crypto.toUpperCase())
}
