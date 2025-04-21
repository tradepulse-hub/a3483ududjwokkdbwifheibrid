// Tipos para o Square

export interface UserProfile {
  address: string
  nickname: string | null
  profilePicture: string | null
  isAdmin: boolean
  createdAt: number // timestamp
  followers: string[] // array de endereços
  following: string[] // array de endereços
  postCount: number
  banned?: {
    until: number // timestamp
    reason: string
  }
}

export interface Post {
  id: string
  authorAddress: string
  content: string
  images?: string[]
  cryptoTags: string[] // ex: ["BTC", "ETH"]
  trend?: "up" | "down" // tendência
  createdAt: number // timestamp
  likes: string[] // array de endereços
  comments: Comment[]
}

export interface Comment {
  id: string
  authorAddress: string
  content: string
  createdAt: number // timestamp
  likes: string[] // array de endereços
}

export interface BannedUser {
  address: string
  until: number // timestamp
  reason: string
  bannedBy: string // endereço do admin
  bannedAt: number // timestamp
}

export type SquareTab = "recent" | "popular" | "market"
