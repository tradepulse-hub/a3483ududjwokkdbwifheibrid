import type { UserProfile, Post, Comment } from "@/types/square"
import { sortPostsByDate, sortPostsByPopularity, filterPostsByCrypto } from "@/lib/squareService"
import { database } from "./firebaseConfig"
import { ref, set, get, remove } from "firebase/database"

// Chaves para o localStorage
const POSTS_KEY = "fisquare_posts"
const PROFILES_KEY = "fisquare_profiles"
const LAST_SYNC_KEY = "fisquare_last_sync"

// Referências para os nós do Firebase
const PROFILES_REF = "square_profiles"
const POSTS_REF = "square_posts"

// Cache local para melhorar a performance
let profilesCache: UserProfile[] | null = null
let postsCache: Post[] | null = null

// Função para gerar ID único
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Funções para sincronização
export async function syncWithFirebase(forceSync = false) {
  try {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY)
    const now = Date.now()

    // Sincronizar apenas se a última sincronização foi há mais de 30 segundos ou se forçado
    if (!forceSync && lastSync && now - Number.parseInt(lastSync) < 30000) {
      console.log("Skipping sync, last sync was recent")
      return
    }

    console.log("Syncing with Firebase...")

    // Buscar posts do Firebase
    const postsRef = ref(database, POSTS_REF)
    const postsSnapshot = await get(postsRef)
    const firebasePosts = postsSnapshot.val() || {}

    // Buscar perfis do Firebase
    const profilesRef = ref(database, PROFILES_REF)
    const profilesSnapshot = await get(profilesRef)
    const firebaseProfiles = profilesSnapshot.val() || {}

    // Mesclar com dados locais
    const localPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || "[]")
    const localProfiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]")

    // Converter objetos do Firebase para arrays
    const firebasePostsArray = Object.values(firebasePosts) as Post[]
    const firebaseProfilesArray = Object.values(firebaseProfiles) as UserProfile[]

    // Mesclar posts (preferindo posts locais mais recentes)
    const mergedPosts: Post[] = [...localPosts]

    // Adicionar posts do Firebase que não existem localmente
    firebasePostsArray.forEach((firebasePost) => {
      const localPostIndex = mergedPosts.findIndex((p) => p.id === firebasePost.id)

      if (localPostIndex === -1) {
        // Post não existe localmente, adicionar
        mergedPosts.push(firebasePost)
      }
    })

    // Mesclar perfis (preferindo perfis locais mais recentes)
    const mergedProfiles: UserProfile[] = [...localProfiles]

    // Adicionar perfis do Firebase que não existem localmente
    firebaseProfilesArray.forEach((firebaseProfile) => {
      const localProfileIndex = mergedProfiles.findIndex((p) => p.address === firebaseProfile.address)

      if (localProfileIndex === -1) {
        // Perfil não existe localmente, adicionar
        mergedProfiles.push(firebaseProfile)
      }
    })

    // Atualizar localStorage
    localStorage.setItem(POSTS_KEY, JSON.stringify(mergedPosts))
    localStorage.setItem(PROFILES_KEY, JSON.stringify(mergedProfiles))
    localStorage.setItem(LAST_SYNC_KEY, now.toString())

    // Atualizar cache
    postsCache = mergedPosts
    profilesCache = mergedProfiles

    console.log(`Sync complete. ${mergedPosts.length} posts, ${mergedProfiles.length} profiles`)

    return {
      posts: mergedPosts,
      profiles: mergedProfiles,
    }
  } catch (error) {
    console.error("Error syncing with Firebase:", error)
    // Em caso de erro, continuar usando os dados locais
    return {
      posts: JSON.parse(localStorage.getItem(POSTS_KEY) || "[]"),
      profiles: JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]"),
    }
  }
}

// Função para enviar dados para o Firebase em segundo plano
export async function pushToFirebase(type: "post" | "profile", data: Post | UserProfile) {
  try {
    if (type === "post") {
      const post = data as Post
      const postRef = ref(database, `${POSTS_REF}/${post.id}`)
      await set(postRef, post)
      console.log(`Post ${post.id} pushed to Firebase`)
    } else {
      const profile = data as UserProfile
      const profileRef = ref(database, `${PROFILES_REF}/${profile.address}`)
      await set(profileRef, profile)
      console.log(`Profile ${profile.address} pushed to Firebase`)
    }
  } catch (error) {
    console.error(`Error pushing ${type} to Firebase:`, error)
    // Continuar mesmo se falhar ao enviar para o Firebase
  }
}

// Funções para posts
export function getPosts(): Post[] {
  try {
    // Usar cache se disponível
    if (postsCache !== null) {
      return postsCache
    }

    const postsJson = localStorage.getItem(POSTS_KEY)
    const posts = postsJson ? JSON.parse(postsJson) : []

    // Atualizar cache
    postsCache = posts

    return posts
  } catch (error) {
    console.error("Error getting posts from localStorage:", error)
    return []
  }
}

export function getRecentPosts(): Post[] {
  const posts = getPosts()
  return sortPostsByDate(posts)
}

export function getPopularPosts(): Post[] {
  const posts = getPosts()
  return sortPostsByPopularity(posts)
}

export function getMarketPosts(crypto: string): Post[] {
  const posts = getPosts()
  return crypto === "ALL" ? posts : filterPostsByCrypto(posts, crypto)
}

export async function createPost(post: Omit<Post, "id" | "likes" | "comments">): Promise<string> {
  try {
    const posts = getPosts()

    // Gerar ID único para o post
    const postId = generateId()

    // Criar objeto do post
    const newPost: Post = {
      id: postId,
      authorAddress: post.authorAddress,
      content: post.content,
      images: post.images || [],
      cryptoTags: post.cryptoTags || [],
      trend: post.trend || null,
      createdAt: Date.now(),
      likes: [],
      comments: [],
    }

    // Adicionar o post à lista local
    posts.unshift(newPost)
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))

    // Atualizar cache
    postsCache = posts

    // Atualizar contagem de posts do usuário
    const profile = getProfile(post.authorAddress)
    if (profile) {
      profile.postCount = (profile.postCount || 0) + 1
      saveProfile(profile)
    }

    // Enviar para o Firebase em segundo plano
    pushToFirebase("post", newPost)

    return postId
  } catch (error) {
    console.error("Error creating post:", error)
    throw new Error("Failed to create post")
  }
}

export function deletePost(postId: string): void {
  try {
    let posts = getPosts()

    // Encontrar o post para obter o autor
    const post = posts.find((p) => p.id === postId)
    if (!post) return

    // Remover o post localmente
    posts = posts.filter((p) => p.id !== postId)
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))

    // Atualizar cache
    postsCache = posts

    // Atualizar contagem de posts do usuário
    const profile = getProfile(post.authorAddress)
    if (profile) {
      profile.postCount = Math.max((profile.postCount || 0) - 1, 0)
      saveProfile(profile)
    }

    // Remover do Firebase em segundo plano
    try {
      const postRef = ref(database, `${POSTS_REF}/${postId}`)
      remove(postRef)
    } catch (firebaseError) {
      console.error("Error removing post from Firebase:", firebaseError)
    }
  } catch (error) {
    console.error("Error deleting post:", error)
    throw new Error("Failed to delete post")
  }
}

export function likePost(postId: string, userAddress: string): void {
  try {
    const posts = getPosts()
    const postIndex = posts.findIndex((p) => p.id === postId)

    if (postIndex === -1) return

    // Verificar se o usuário já curtiu o post
    if (!posts[postIndex].likes.includes(userAddress)) {
      posts[postIndex].likes.push(userAddress)
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts))

      // Atualizar cache
      postsCache = posts

      // Atualizar no Firebase em segundo plano
      try {
        const postRef = ref(database, `${POSTS_REF}/${postId}/likes`)
        set(postRef, posts[postIndex].likes)
      } catch (firebaseError) {
        console.error("Error updating likes in Firebase:", firebaseError)
      }
    }
  } catch (error) {
    console.error("Error liking post:", error)
    throw new Error("Failed to like post")
  }
}

export function unlikePost(postId: string, userAddress: string): void {
  try {
    const posts = getPosts()
    const postIndex = posts.findIndex((p) => p.id === postId)

    if (postIndex === -1) return

    // Remover o like do usuário
    posts[postIndex].likes = posts[postIndex].likes.filter((addr) => addr !== userAddress)
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))

    // Atualizar cache
    postsCache = posts

    // Atualizar no Firebase em segundo plano
    try {
      const postRef = ref(database, `${POSTS_REF}/${postId}/likes`)
      set(postRef, posts[postIndex].likes)
    } catch (firebaseError) {
      console.error("Error updating likes in Firebase:", firebaseError)
    }
  } catch (error) {
    console.error("Error unliking post:", error)
    throw new Error("Failed to unlike post")
  }
}

export function addComment(postId: string, comment: Omit<Comment, "id" | "createdAt" | "likes">): void {
  try {
    const posts = getPosts()
    const postIndex = posts.findIndex((p) => p.id === postId)

    if (postIndex === -1) return

    // Criar o novo comentário
    const commentId = generateId()
    const newComment: Comment = {
      id: commentId,
      authorAddress: comment.authorAddress,
      content: comment.content,
      createdAt: Date.now(),
      likes: [],
    }

    // Adicionar o comentário ao post
    posts[postIndex].comments.push(newComment)
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts))

    // Atualizar cache
    postsCache = posts

    // Atualizar no Firebase em segundo plano
    try {
      const postRef = ref(database, `${POSTS_REF}/${postId}/comments`)
      set(postRef, posts[postIndex].comments)
    } catch (firebaseError) {
      console.error("Error updating comments in Firebase:", firebaseError)
    }
  } catch (error) {
    console.error("Error adding comment:", error)
    throw new Error("Failed to add comment")
  }
}

// Funções para perfis de usuário
export function getProfiles(): UserProfile[] {
  try {
    // Usar cache se disponível
    if (profilesCache !== null) {
      return profilesCache
    }

    const profilesJson = localStorage.getItem(PROFILES_KEY)
    const profiles = profilesJson ? JSON.parse(profilesJson) : []

    // Atualizar cache
    profilesCache = profiles

    return profiles
  } catch (error) {
    console.error("Error getting profiles from localStorage:", error)
    return []
  }
}

export function getProfile(address: string): UserProfile | null {
  try {
    const profiles = getProfiles()
    return profiles.find((p) => p.address.toLowerCase() === address.toLowerCase()) || null
  } catch (error) {
    console.error("Error getting profile:", error)
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    const profiles = getProfiles()
    const index = profiles.findIndex((p) => p.address.toLowerCase() === profile.address.toLowerCase())

    if (index !== -1) {
      profiles[index] = profile
    } else {
      profiles.push(profile)
    }

    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))

    // Atualizar cache
    profilesCache = profiles

    // Enviar para o Firebase em segundo plano
    pushToFirebase("profile", profile)
  } catch (error) {
    console.error("Error saving profile:", error)
    throw new Error("Failed to save profile")
  }
}

export function getOrCreateProfile(address: string): UserProfile {
  try {
    let profile = getProfile(address)

    if (!profile) {
      profile = {
        address,
        nickname: null,
        profilePicture: null,
        isAdmin: address.toLowerCase() === "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677".toLowerCase(),
        createdAt: Date.now(),
        followers: [],
        following: [],
        postCount: 0,
      }
      saveProfile(profile)
    }

    return profile
  } catch (error) {
    console.error("Error in getOrCreateProfile:", error)

    // Em caso de erro, criar um perfil padrão em memória
    return {
      address,
      nickname: null,
      profilePicture: null,
      isAdmin: address.toLowerCase() === "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677".toLowerCase(),
      createdAt: Date.now(),
      followers: [],
      following: [],
      postCount: 0,
    }
  }
}

// Funções para seguir/deixar de seguir usuários
export function followUser(followerAddress: string, targetAddress: string): void {
  try {
    const followerProfile = getOrCreateProfile(followerAddress)
    const targetProfile = getOrCreateProfile(targetAddress)

    // Atualizar lista de following do seguidor
    if (!followerProfile.following.includes(targetAddress)) {
      followerProfile.following.push(targetAddress)
    }

    // Atualizar lista de followers do alvo
    if (!targetProfile.followers.includes(followerAddress)) {
      targetProfile.followers.push(followerAddress)
    }

    // Salvar as alterações
    saveProfile(followerProfile)
    saveProfile(targetProfile)
  } catch (error) {
    console.error("Error following user:", error)
    throw new Error("Failed to follow user")
  }
}

export function unfollowUser(followerAddress: string, targetAddress: string): void {
  try {
    const followerProfile = getProfile(followerAddress)
    const targetProfile = getProfile(targetAddress)

    if (!followerProfile || !targetProfile) return

    // Atualizar lista de following do seguidor
    followerProfile.following = followerProfile.following.filter((addr) => addr !== targetAddress)

    // Atualizar lista de followers do alvo
    targetProfile.followers = targetProfile.followers.filter((addr) => addr !== followerAddress)

    // Salvar as alterações
    saveProfile(followerProfile)
    saveProfile(targetProfile)
  } catch (error) {
    console.error("Error unfollowing user:", error)
    throw new Error("Failed to unfollow user")
  }
}

// Funções para banir/desbanir usuários
export function banUser(userAddress: string, adminAddress: string, durationMs: number, reason: string): void {
  try {
    const banUntil = Date.now() + durationMs

    // Atualizar perfil do usuário
    const profile = getProfile(userAddress)
    if (profile) {
      profile.banned = {
        until: banUntil,
        reason,
      }
      saveProfile(profile)
    }
  } catch (error) {
    console.error("Error banning user:", error)
    throw new Error("Failed to ban user")
  }
}

export function unbanUser(userAddress: string): void {
  try {
    // Atualizar perfil do usuário
    const profile = getProfile(userAddress)
    if (profile) {
      profile.banned = undefined
      saveProfile(profile)
    }
  } catch (error) {
    console.error("Error unbanning user:", error)
    throw new Error("Failed to unban user")
  }
}

// Função para inicializar dados de exemplo (útil para testes)
export function initializeExampleData(): void {
  // Verificar se já existem dados
  if (getPosts().length > 0 || getProfiles().length > 0) {
    return
  }

  // Criar alguns perfis de exemplo
  const profiles: UserProfile[] = [
    {
      address: "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677",
      nickname: "Admin",
      profilePicture: null,
      isAdmin: true,
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 dias atrás
      followers: [],
      following: [],
      postCount: 2,
    },
    {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      nickname: "Alice",
      profilePicture: null,
      isAdmin: false,
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 dias atrás
      followers: [],
      following: [],
      postCount: 1,
    },
  ]

  // Criar alguns posts de exemplo
  const posts: Post[] = [
    {
      id: "example1",
      authorAddress: "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677",
      content: "Bem-vindo ao FiSquare! Este é um espaço para discutir criptomoedas e finanças. #TPF #WLD",
      images: [],
      cryptoTags: ["TPF", "WLD"],
      trend: "up",
      createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 dias atrás
      likes: [],
      comments: [],
    },
    {
      id: "example2",
      authorAddress: "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677",
      content: "O mercado de #TPF está em alta hoje! Quais são suas previsões?",
      images: [],
      cryptoTags: ["TPF"],
      trend: "up",
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 dias atrás
      likes: ["0x1234567890abcdef1234567890abcdef12345678"],
      comments: [
        {
          id: "comment1",
          authorAddress: "0x1234567890abcdef1234567890abcdef12345678",
          content: "Acho que vai continuar subindo!",
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 dias atrás
          likes: [],
        },
      ],
    },
    {
      id: "example3",
      authorAddress: "0x1234567890abcdef1234567890abcdef12345678",
      content: "Alguém aqui está participando da loteria de #TPF? Parece interessante!",
      images: [],
      cryptoTags: ["TPF"],
      trend: null,
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 dia atrás
      likes: ["0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677"],
      comments: [],
    },
  ]

  // Salvar dados de exemplo
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))

  // Enviar para o Firebase em segundo plano
  profiles.forEach((profile) => pushToFirebase("profile", profile))
  posts.forEach((post) => pushToFirebase("post", post))
}
