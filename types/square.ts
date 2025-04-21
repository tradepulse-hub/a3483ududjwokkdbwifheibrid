// Definição do tipo UserProfile
export interface UserProfile {
  address: string
  nickname: string | null
  profilePicture: string | null
  isAdmin: boolean
  createdAt: number
  followers: string[]
  following: string[]
  postCount: number
}

// Definição do tipo Comment
export interface Comment {
  id: string
  authorAddress: string
  content: string
  createdAt: number
  likes: string[]
}

// Definição do tipo Post
export interface Post {
  id: string
  authorAddress: string
  content: string
  images?: string[]
  cryptoTags?: string[]
  trend?: "up" | "down" | null
  createdAt: number
  likes: string[]
  comments: Comment[]
}
