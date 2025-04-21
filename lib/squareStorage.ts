// Serviço para armazenar dados do Square no Firebase
import type { UserProfile, Post, BannedUser, Comment } from "@/types/square"
import { generateId } from "./squareService"
import { database } from "./firebaseConfig"
import { ref, set, get, push, remove, onValue, off } from "firebase/database"

// Referências para os nós do Firebase
const PROFILES_REF = "square_profiles"
const POSTS_REF = "square_posts"
const BANNED_USERS_REF = "square_banned_users"

// Cache local para melhorar a performance
let profilesCache: UserProfile[] | null = null
let postsCache: Post[] | null = null
let bannedUsersCache: BannedUser[] | null = null

// Listeners para atualizações em tempo real
let profilesListener: any = null
let postsListener: any = null
let bannedUsersListener: any = null

// Inicializar listeners para atualizações em tempo real
export function initializeRealTimeListeners(onPostsUpdate?: () => void) {
  // Listener para perfis
  if (!profilesListener) {
    const profilesRef = ref(database, PROFILES_REF)
    profilesListener = onValue(profilesRef, (snapshot) => {
      const data = snapshot.val()
      profilesCache = data ? Object.values(data) : []
    })
  }

  // Listener para posts
  if (!postsListener) {
    const postsRef = ref(database, POSTS_REF)
    postsListener = onValue(postsRef, (snapshot) => {
      const data = snapshot.val()
      postsCache = data ? Object.values(data) : []
      if (onPostsUpdate) onPostsUpdate()
    })
  }

  // Listener para usuários banidos
  if (!bannedUsersListener) {
    const bannedUsersRef = ref(database, BANNED_USERS_REF)
    bannedUsersListener = onValue(bannedUsersRef, (snapshot) => {
      const data = snapshot.val()
      bannedUsersCache = data ? Object.values(data) : []
    })
  }
}

// Remover listeners quando não forem mais necessários
export function removeRealTimeListeners() {
  if (profilesListener) {
    const profilesRef = ref(database, PROFILES_REF)
    off(profilesRef, "value", profilesListener)
    profilesListener = null
  }

  if (postsListener) {
    const postsRef = ref(database, POSTS_REF)
    off(postsRef, "value", postsListener)
    postsListener = null
  }

  if (bannedUsersListener) {
    const bannedUsersRef = ref(database, BANNED_USERS_REF)
    off(bannedUsersRef, "value", bannedUsersListener)
    bannedUsersListener = null
  }
}

// Funções para perfis de usuário
export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    const profileRef = ref(database, `${PROFILES_REF}/${profile.address}`)
    await set(profileRef, profile)

    // Atualizar cache local
    if (profilesCache) {
      const existingIndex = profilesCache.findIndex((p) => p.address === profile.address)
      if (existingIndex >= 0) {
        profilesCache[existingIndex] = profile
      } else {
        profilesCache.push(profile)
      }
    }
  } catch (error) {
    console.error("Error saving profile:", error)
    throw error
  }
}

export async function getProfiles(): Promise<UserProfile[]> {
  // Usar cache se disponível
  if (profilesCache !== null) {
    return profilesCache
  }

  try {
    const profilesRef = ref(database, PROFILES_REF)
    const snapshot = await get(profilesRef)
    const data = snapshot.val()

    // Atualizar cache
    profilesCache = data ? Object.values(data) : []
    return profilesCache
  } catch (error) {
    console.error("Error getting profiles:", error)
    return []
  }
}

export async function getProfile(address: string): Promise<UserProfile | null> {
  // Verificar no cache primeiro
  if (profilesCache) {
    const cachedProfile = profilesCache.find((p) => p.address.toLowerCase() === address.toLowerCase())
    if (cachedProfile) return cachedProfile
  }

  try {
    const profileRef = ref(database, `${PROFILES_REF}/${address}`)
    const snapshot = await get(profileRef)
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error("Error getting profile:", error)
    return null
  }
}

export async function createDefaultProfile(address: string): Promise<UserProfile> {
  const newProfile: UserProfile = {
    address,
    nickname: null,
    profilePicture: null,
    isAdmin: address.toLowerCase() === "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677".toLowerCase(),
    createdAt: Date.now(),
    followers: [],
    following: [],
    postCount: 0,
  }

  await saveProfile(newProfile)
  return newProfile
}

export async function getOrCreateProfile(address: string): Promise<UserProfile> {
  const profile = await getProfile(address)
  if (profile) return profile
  return await createDefaultProfile(address)
}

export async function followUser(followerAddress: string, followedAddress: string): Promise<void> {
  const followerProfile = await getOrCreateProfile(followerAddress)
  const followedProfile = await getOrCreateProfile(followedAddress)

  if (!followerProfile.following.includes(followedAddress)) {
    followerProfile.following.push(followedAddress)
    await saveProfile(followerProfile)
  }

  if (!followedProfile.followers.includes(followerAddress)) {
    followedProfile.followers.push(followerAddress)
    await saveProfile(followedProfile)
  }
}

export async function unfollowUser(followerAddress: string, followedAddress: string): Promise<void> {
  const followerProfile = await getProfile(followerAddress)
  const followedProfile = await getProfile(followedAddress)

  if (followerProfile) {
    followerProfile.following = followerProfile.following.filter((addr) => addr !== followedAddress)
    await saveProfile(followerProfile)
  }

  if (followedProfile) {
    followedProfile.followers = followedProfile.followers.filter((addr) => addr !== followerAddress)
    await saveProfile(followedProfile)
  }
}

// Funções para posts
export async function savePosts(posts: Post[]): Promise<void> {
  try {
    const postsRef = ref(database, POSTS_REF)

    // Converter array para objeto com IDs como chaves
    const postsObject = posts.reduce(
      (obj, post) => {
        obj[post.id] = post
        return obj
      },
      {} as Record<string, Post>,
    )

    await set(postsRef, postsObject)

    // Atualizar cache
    postsCache = posts
  } catch (error) {
    console.error("Error saving posts:", error)
    throw error
  }
}

export async function getPosts(): Promise<Post[]> {
  // Usar cache se disponível
  if (postsCache !== null) {
    return postsCache
  }

  try {
    const postsRef = ref(database, POSTS_REF)
    const snapshot = await get(postsRef)
    const data = snapshot.val()

    // Atualizar cache
    postsCache = data ? Object.values(data) : []
    return postsCache
  } catch (error) {
    console.error("Error getting posts:", error)
    return []
  }
}

export async function getPost(id: string): Promise<Post | null> {
  // Verificar no cache primeiro
  if (postsCache) {
    const cachedPost = postsCache.find((p) => p.id === id)
    if (cachedPost) return cachedPost
  }

  try {
    const postRef = ref(database, `${POSTS_REF}/${id}`)
    const snapshot = await get(postRef)
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error("Error getting post:", error)
    return null
  }
}

export async function createPost(post: Omit<Post, "id" | "createdAt" | "likes" | "comments">): Promise<Post> {
  try {
    const postsRef = ref(database, POSTS_REF)
    const newPostRef = push(postsRef)
    const postId = newPostRef.key || generateId()

    const newPost: Post = {
      ...post,
      id: postId,
      createdAt: Date.now(),
      likes: [],
      comments: [],
    }

    await set(newPostRef, newPost)

    // Atualizar contagem de posts do autor
    const profile = await getOrCreateProfile(post.authorAddress)
    profile.postCount += 1
    await saveProfile(profile)

    // Atualizar cache
    if (postsCache) {
      postsCache.push(newPost)
    }

    return newPost
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

export async function updatePost(post: Post): Promise<void> {
  try {
    const postRef = ref(database, `${POSTS_REF}/${post.id}`)
    await set(postRef, post)

    // Atualizar cache
    if (postsCache) {
      const index = postsCache.findIndex((p) => p.id === post.id)
      if (index >= 0) {
        postsCache[index] = post
      }
    }
  } catch (error) {
    console.error("Error updating post:", error)
    throw error
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    // Obter o post antes de excluí-lo
    const post = await getPost(postId)

    if (post) {
      // Atualizar contagem de posts do autor
      const profile = await getProfile(post.authorAddress)
      if (profile) {
        profile.postCount = Math.max(0, profile.postCount - 1)
        await saveProfile(profile)
      }

      // Remover o post
      const postRef = ref(database, `${POSTS_REF}/${postId}`)
      await remove(postRef)

      // Atualizar cache
      if (postsCache) {
        postsCache = postsCache.filter((p) => p.id !== postId)
      }
    }
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }
}

export async function likePost(postId: string, userAddress: string): Promise<void> {
  try {
    const post = await getPost(postId)

    if (post && !post.likes.includes(userAddress)) {
      post.likes.push(userAddress)
      await updatePost(post)
    }
  } catch (error) {
    console.error("Error liking post:", error)
    throw error
  }
}

export async function unlikePost(postId: string, userAddress: string): Promise<void> {
  try {
    const post = await getPost(postId)

    if (post) {
      post.likes = post.likes.filter((addr) => addr !== userAddress)
      await updatePost(post)
    }
  } catch (error) {
    console.error("Error unliking post:", error)
    throw error
  }
}

export async function addComment(postId: string, comment: Omit<Comment, "id" | "createdAt" | "likes">): Promise<void> {
  try {
    const post = await getPost(postId)

    if (post) {
      const newComment = {
        ...comment,
        id: generateId(),
        createdAt: Date.now(),
        likes: [],
      }

      post.comments.push(newComment)
      await updatePost(post)
    }
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

// Funções para usuários banidos
export async function saveBannedUsers(bannedUsers: BannedUser[]): Promise<void> {
  try {
    const bannedUsersRef = ref(database, BANNED_USERS_REF)

    // Converter array para objeto com endereços como chaves
    const bannedUsersObject = bannedUsers.reduce(
      (obj, user) => {
        obj[user.address] = user
        return obj
      },
      {} as Record<string, BannedUser>,
    )

    await set(bannedUsersRef, bannedUsersObject)

    // Atualizar cache
    bannedUsersCache = bannedUsers
  } catch (error) {
    console.error("Error saving banned users:", error)
    throw error
  }
}

export async function getBannedUsers(): Promise<BannedUser[]> {
  // Usar cache se disponível
  if (bannedUsersCache !== null) {
    return bannedUsersCache
  }

  try {
    const bannedUsersRef = ref(database, BANNED_USERS_REF)
    const snapshot = await get(bannedUsersRef)
    const data = snapshot.val()

    // Atualizar cache
    bannedUsersCache = data ? Object.values(data) : []
    return bannedUsersCache
  } catch (error) {
    console.error("Error getting banned users:", error)
    return []
  }
}

export async function banUser(
  userAddress: string,
  adminAddress: string,
  duration: number,
  reason: string,
): Promise<void> {
  try {
    const bannedUsers = await getBannedUsers()
    const profile = await getOrCreateProfile(userAddress)

    // Calcular quando o banimento termina
    const until = Date.now() + duration

    // Atualizar o perfil do usuário
    profile.banned = {
      until,
      reason,
    }
    await saveProfile(profile)

    // Adicionar à lista de usuários banidos
    const existingBanIndex = bannedUsers.findIndex((b) => b.address === userAddress)
    const bannedUser: BannedUser = {
      address: userAddress,
      until,
      reason,
      bannedBy: adminAddress,
      bannedAt: Date.now(),
    }

    if (existingBanIndex >= 0) {
      bannedUsers[existingBanIndex] = bannedUser
    } else {
      bannedUsers.push(bannedUser)
    }

    await saveBannedUsers(bannedUsers)
  } catch (error) {
    console.error("Error banning user:", error)
    throw error
  }
}

export async function unbanUser(userAddress: string): Promise<void> {
  try {
    const bannedUsers = await getBannedUsers()
    const profile = await getProfile(userAddress)

    if (profile) {
      // Remover o banimento do perfil
      delete profile.banned
      await saveProfile(profile)
    }

    // Remover da lista de usuários banidos
    const updatedBannedUsers = bannedUsers.filter((b) => b.address !== userAddress)
    await saveBannedUsers(updatedBannedUsers)
  } catch (error) {
    console.error("Error unbanning user:", error)
    throw error
  }
}
