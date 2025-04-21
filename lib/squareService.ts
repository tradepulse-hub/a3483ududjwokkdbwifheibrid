// Serviço para gerenciar dados do Square
import type { UserProfile, Post } from "@/types/square"

// Endereço do admin
export const ADMIN_ADDRESS = "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677"

// Função para verificar se um usuário é admin
export function isAdmin(address: string): boolean {
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()
}

// Função para verificar se um usuário está banido
export function isUserBanned(profile: UserProfile | null): boolean {
  if (!profile || !profile.banned) return false
  return profile.banned.until > Date.now()
}

// Função para calcular quanto tempo falta para o fim do banimento
export function getBanTimeRemaining(profile: UserProfile): string {
  if (!profile.banned) return ""

  const remainingMs = profile.banned.until - Date.now()
  if (remainingMs <= 0) return "0"

  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Função para formatar data
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString()
}

// Função para extrair hashtags de texto
export function extractHashtags(text: string): string[] {
  const regex = /#(\w+)/g
  const matches = text.match(regex)
  return matches ? matches.map((tag) => tag.substring(1).toUpperCase()) : []
}

// Lista de criptomoedas suportadas
export const SUPPORTED_CRYPTOS = ["BTC", "ETH", "WLD", "TPF", "USDT", "USDC", "BNB", "XRP", "SOL", "ADA", "DOGE"]

// Função para verificar se uma criptomoeda é suportada
export function isCryptoSupported(crypto: string): boolean {
  return SUPPORTED_CRYPTOS.includes(crypto.toUpperCase())
}

// Função para gerar um ID único
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Função para truncar endereço
export function truncateAddress(address: string): string {
  if (!address) return ""
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Função para obter nome de exibição (nickname ou endereço truncado)
export function getDisplayName(profile: UserProfile | null): string {
  if (!profile) return ""
  return profile.nickname || truncateAddress(profile.address)
}

// Função para obter imagem de perfil padrão
export function getDefaultProfilePicture(address: string): string {
  // Gera uma cor baseada no endereço
  const hash = address
    .toLowerCase()
    .split("")
    .reduce((a, b) => {
      return a + b.charCodeAt(0)
    }, 0)

  const hue = hash % 360

  // Retorna um SVG com a primeira letra do endereço
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='hsl(${hue}, 70%, 60%)' /%3E%3Ctext x='50' y='50' font-size='50' text-anchor='middle' dominant-baseline='middle' fill='white'%3E${address.substring(0, 1).toUpperCase()}%3C/text%3E%3C/svg%3E`
}

// Função para ordenar posts por data (mais recentes primeiro)
export function sortPostsByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.createdAt - a.createdAt)
}

// Função para ordenar posts por popularidade (mais curtidos primeiro)
export function sortPostsByPopularity(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.likes.length - a.likes.length)
}

// Função para filtrar posts por criptomoeda
export function filterPostsByCrypto(posts: Post[], crypto: string): Post[] {
  return posts.filter((post) => post.cryptoTags.includes(crypto.toUpperCase()))
}
