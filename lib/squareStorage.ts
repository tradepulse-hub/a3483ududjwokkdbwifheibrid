// Serviço para armazenar dados do Square no Firebase
import type { UserProfile, Post, BannedUser, Comment } from "@/types/square"
import { generateId } from "./squareService"
import { database } from "./firebaseConfig"
import { ref, set, get, remove, onValue, off } from "firebase/database"

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

// Flag para controlar se os listeners já foram inicializados
let listenersInitialized = false

// Inicializar listeners para atualizações em tempo real
export function initializeRealTimeListeners(onPostsUpdate?: () => void) {
  // Evitar inicialização duplicada
  if (listenersInitialized) {
    console.log("Listeners already initialized, skipping")
    return
  }

  console.log("Initializing Firebase real-time listeners")

  try {
    // Remover listeners existentes para evitar duplicação
    removeRealTimeListeners()

    // Listener para perfis
    console.log("Setting up profiles listener")
    const profilesRef = ref(database, PROFILES_REF)
    profilesListener = onValue(
      profilesRef,
      (snapshot) => {
        console.log("Profiles updated")
        const data = snapshot.val()
        profilesCache = data ? Object.values(data) : []
      },
      (error) => {
        console.error("Error in profiles listener:", error)
        // Não deixar o erro interromper a execução
        profilesCache = profilesCache || []
      },
    )

    // Listener para posts
    console.log("Setting up posts listener")
    const postsRef = ref(database, POSTS_REF)
    postsListener = onValue(
      postsRef,
      (snapshot) => {
        console.log("Posts updated")
        const data = snapshot.val()
        postsCache = data ? Object.values(data) : []
        if (onPostsUpdate) {
          console.log("Calling posts update callback")
          onPostsUpdate()
        }
      },
      (error) => {
        console.error("Error in posts listener:", error)
        // Não deixar o erro interromper a execução
        postsCache = postsCache || []
      },
    )

    // Listener para usuários banidos
    console.log("Setting up banned users listener")
    const bannedUsersRef = ref(database, BANNED_USERS_REF)
    bannedUsersListener = onValue(
      bannedUsersRef,
      (snapshot) => {
        console.log("Banned users updated")
        const data = snapshot.val()
        bannedUsersCache = data ? Object.values(data) : []
      },
      (error) => {
        console.error("Error in banned users listener:", error)
        // Não deixar o erro interromper a execução
        bannedUsersCache = bannedUsersCache || []
      },
    )

    listenersInitialized = true
    console.log("All listeners initialized successfully")
  } catch (error) {
    console.error("Error initializing listeners:", error)
    // Inicializar caches vazios para evitar erros
    profilesCache = profilesCache || []
    postsCache = postsCache || []
    bannedUsersCache = bannedUsersCache || []
    throw error
  }
}

// Remover listeners quando não forem mais necessários
export function removeRealTimeListeners() {
  console.log("Removing Firebase real-time listeners")

  try {
    if (profilesListener) {
      console.log("Removing profiles listener")
      const profilesRef = ref(database, PROFILES_REF)
      off(profilesRef)
      profilesListener = null
    }

    if (postsListener) {
      console.log("Removing posts listener")
      const postsRef = ref(database, POSTS_REF)
      off(postsRef)
      postsListener = null
    }

    if (bannedUsersListener) {
      console.log("Removing banned users listener")
      const bannedUsersRef = ref(database, BANNED_USERS_REF)
      off(bannedUsersRef)
      bannedUsersListener = null
    }

    listenersInitialized = false
    console.log("All listeners removed successfully")
  } catch (error) {
    console.error("Error removing listeners:", error)
    // Limpar referências de listeners mesmo em caso de erro
    profilesListener = null
    postsListener = null
    bannedUsersListener = null
  }
}

// Funções para perfis de usuário
export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    console.log(`Saving profile for address: ${profile.address}`)
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
    console.log("Profile saved successfully")
  } catch (error) {
    console.error("Error saving profile:", error)
    throw error
  }
}

export async function getProfiles(): Promise<UserProfile[]> {
  console.log("Getting all profiles")

  // Usar cache se disponível
  if (profilesCache !== null) {
    console.log(`Returning ${profilesCache.length} profiles from cache`)
    return profilesCache
  }

  try {
    console.log("Fetching profiles from Firebase")
    const profilesRef = ref(database, PROFILES_REF)
    const snapshot = await get(profilesRef)
    const data = snapshot.val()

    // Atualizar cache
    profilesCache = data ? Object.values(data) : []
    console.log(`Fetched ${profilesCache.length} profiles`)
    return profilesCache
  } catch (error) {
    console.error("Error getting profiles:", error)
    // Retornar array vazio em caso de erro para evitar quebras
    return []
  }
}

export async function getProfile(address: string): Promise<UserProfile | null> {
  console.log(`Getting profile for address: ${address}`)

  // Verificar no cache primeiro
  if (profilesCache) {
    const cachedProfile = profilesCache.find((p) => p.address.toLowerCase() === address.toLowerCase())
    if (cachedProfile) {
      console.log("Profile found in cache")
      return cachedProfile
    }
  }

  try {
    console.log("Fetching profile from Firebase")
    const profileRef = ref(database, `${PROFILES_REF}/${address}`)
    const snapshot = await get(profileRef)
    const profile = snapshot.exists() ? snapshot.val() : null
    console.log("Profile fetch result:", profile ? "Found" : "Not found")
    return profile
  } catch (error) {
    console.error("Error getting profile:", error)
    return null
  }
}

export async function createDefaultProfile(address: string): Promise<UserProfile> {
  console.log(`Creating default profile for address: ${address}`)

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

  try {
    await saveProfile(newProfile)
    console.log("Default profile created successfully")
    return newProfile
  } catch (error) {
    console.error("Error creating default profile:", error)
    // Retornar o perfil mesmo se falhar ao salvar
    return newProfile
  }
}

export async function getOrCreateProfile(address: string): Promise<UserProfile> {
  console.log(`Getting or creating profile for address: ${address}`)

  try {
    const profile = await getProfile(address)
    if (profile) {
      console.log("Existing profile found")
      return profile
    }

    console.log("No profile found, creating default profile")
    return await createDefaultProfile(address)
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

// Funções para posts
export async function getPosts(): Promise<Post[]> {
  console.log("Getting all posts")

  // Usar cache se disponível
  if (postsCache !== null) {
    console.log(`Returning ${postsCache.length} posts from cache`)
    return postsCache
  }

  try {
    console.log("Fetching posts from Firebase")
    const postsRef = ref(database, POSTS_REF)
    const snapshot = await get(postsRef)
    const data = snapshot.val()

    // Atualizar cache
    postsCache = data ? Object.values(data) : []
    console.log(`Fetched ${postsCache.length} posts`)
    return postsCache
  } catch (error) {
    console.error("Error getting posts:", error)
    // Retornar array vazio em caso de erro
    return []
  }
}

export async function createPost(post: Omit<Post, "id" | "likes" | "comments">): Promise<void> {
  try {
    console.log(`Creating post for author: ${post.authorAddress}`)
    const postId = generateId()
    const newPost: Post = {
      id: postId,
      authorAddress: post.authorAddress,
      content: post.content,
      images: post.images,
      cryptoTags: post.cryptoTags,
      trend: post.trend,
      createdAt: Date.now(),
      likes: [],
      comments: [],
    }

    const postRef = ref(database, `${POSTS_REF}/${postId}`)
    await set(postRef, newPost)

    // Atualizar cache local
    if (postsCache) {
      postsCache.push(newPost)
    }

    // Atualizar contagem de posts do usuário
    const profile = await getProfile(post.authorAddress)
    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        postCount: profile.postCount + 1,
      }
      await saveProfile(updatedProfile)
    }

    console.log("Post created successfully")
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

export async function likePost(postId: string, userAddress: string): Promise<void> {
  try {
    console.log(`Liking post ${postId} by user ${userAddress}`)

    // Verificar se o post existe
    const postRef = ref(database, `${POSTS_REF}/${postId}`)
    const snapshot = await get(postRef)

    if (!snapshot.exists()) {
      throw new Error("Post not found")
    }

    const post = snapshot.val() as Post

    // Verificar se o usuário já curtiu o post
    if (post.likes && post.likes.includes(userAddress)) {
      console.log("User already liked this post")
      return
    }

    // Adicionar o like
    const likesRef = ref(database, `${POSTS_REF}/${postId}/likes`)
    const newLikes = [...(post.likes || []), userAddress]
    await set(likesRef, newLikes)

    // Atualizar cache local
    if (postsCache) {
      const postIndex = postsCache.findIndex((p) => p.id === postId)
      if (postIndex >= 0) {
        postsCache[postIndex].likes = newLikes
      }
    }

    console.log("Like added successfully")
  } catch (error) {
    console.error("Error liking post:", error)
    throw error
  }
}

export async function unlikePost(postId: string, userAddress: string): Promise<void> {
  try {
    console.log(`Unliking post ${postId} by user ${userAddress}`)

    // Verificar se o post existe
    const postRef = ref(database, `${POSTS_REF}/${postId}`)
    const snapshot = await get(postRef)

    if (!snapshot.exists()) {
      throw new Error("Post not found")
    }

    const post = snapshot.val() as Post

    // Verificar se o usuário curtiu o post
    if (!post.likes || !post.likes.includes(userAddress)) {
      console.log("User has not liked this post")
      return
    }

    // Remover o like
    const likesRef = ref(database, `${POSTS_REF}/${postId}/likes`)
    const newLikes = post.likes.filter((addr) => addr !== userAddress)
    await set(likesRef, newLikes)

    // Atualizar cache local
    if (postsCache) {
      const postIndex = postsCache.findIndex((p) => p.id === postId)
      if (postIndex >= 0) {
        postsCache[postIndex].likes = newLikes
      }
    }

    console.log("Like removed successfully")
  } catch (error) {
    console.error("Error unliking post:", error)
    throw error
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    console.log(`Deleting post ${postId}`)

    // Verificar se o post existe
    const postRef = ref(database, `${POSTS_REF}/${postId}`)
    const snapshot = await get(postRef)

    if (!snapshot.exists()) {
      throw new Error("Post not found")
    }

    const post = snapshot.val() as Post

    // Remover o post
    await remove(postRef)

    // Atualizar cache local
    if (postsCache) {
      postsCache = postsCache.filter((p) => p.id !== postId)
    }

    // Atualizar contagem de posts do usuário
    if (post) {
      const profile = await getProfile(post.authorAddress)
      if (profile) {
        const updatedProfile: UserProfile = {
          ...profile,
          postCount: profile.postCount > 0 ? profile.postCount - 1 : 0,
        }
        await saveProfile(updatedProfile)
      }
    }

    console.log("Post deleted successfully")
  } catch (error) {
    console.error("Error deleting post:", error)
    throw error
  }
}

export async function addComment(postId: string, comment: Omit<Comment, "id" | "createdAt" | "likes">): Promise<void> {
  try {
    console.log(`Adding comment to post ${postId}`)

    // Verificar se o post existe
    const postRef = ref(database, `${POSTS_REF}/${postId}`)
    const snapshot = await get(postRef)

    if (!snapshot.exists()) {
      throw new Error("Post not found")
    }

    const post = snapshot.val() as Post

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
    const commentsRef = ref(database, `${POSTS_REF}/${postId}/comments`)
    const newComments = [...(post.comments || []), newComment]
    await set(commentsRef, newComments)

    // Atualizar cache local
    if (postsCache) {
      const postIndex = postsCache.findIndex((p) => p.id === postId)
      if (postIndex >= 0) {
        postsCache[postIndex].comments = newComments
      }
    }

    console.log("Comment added successfully")
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

// Funções para seguir/deixar de seguir usuários
export async function followUser(userAddress: string, profileAddress: string): Promise<void> {
  try {
    console.log(`Following user ${profileAddress} by user ${userAddress}`)

    // Verificar se o usuário já está seguindo o perfil
    const userProfile = await getProfile(userAddress)
    const targetProfile = await getProfile(profileAddress)

    if (!userProfile || !targetProfile) {
      throw new Error("User or target profile not found")
    }

    if (userProfile.following && userProfile.following.includes(profileAddress)) {
      console.log("User already follows this profile")
      return
    }

    // Adicionar o profileAddress à lista de following do usuário
    const userFollowing = [...(userProfile.following || []), profileAddress]
    await saveProfile({
      ...userProfile,
      following: userFollowing,
    })

    // Adicionar o userAddress à lista de followers do profile
    const profileFollowers = [...(targetProfile.followers || []), userAddress]
    await saveProfile({
      ...targetProfile,
      followers: profileFollowers,
    })

    console.log("Follow relationship created successfully")
  } catch (error) {
    console.error("Error following user:", error)
    throw error
  }
}

export async function unfollowUser(userAddress: string, profileAddress: string): Promise<void> {
  try {
    console.log(`Unfollowing user ${profileAddress} by user ${userAddress}`)

    // Verificar se o usuário está seguindo o perfil
    const userProfile = await getProfile(userAddress)
    const targetProfile = await getProfile(profileAddress)

    if (!userProfile || !targetProfile) {
      throw new Error("User or target profile not found")
    }

    if (!userProfile.following || !userProfile.following.includes(profileAddress)) {
      console.log("User does not follow this profile")
      return
    }

    // Remover o profileAddress da lista de following do usuário
    const userFollowing = (userProfile.following || []).filter((addr) => addr !== profileAddress)
    await saveProfile({
      ...userProfile,
      following: userFollowing,
    })

    // Remover o userAddress da lista de followers do profile
    const profileFollowers = (targetProfile.followers || []).filter((addr) => addr !== userAddress)
    await saveProfile({
      ...targetProfile,
      followers: profileFollowers,
    })

    console.log("Follow relationship removed successfully")
  } catch (error) {
    console.error("Error unfollowing user:", error)
    throw error
  }
}

// Funções para banir/desbanir usuários
export async function banUser(
  userAddress: string,
  adminAddress: string,
  duration: number,
  reason: string,
): Promise<void> {
  try {
    console.log(`Banning user ${userAddress} by admin ${adminAddress}`)

    const banUntil = Date.now() + duration
    const bannedUser: BannedUser = {
      address: userAddress,
      until: banUntil,
      reason: reason,
      bannedBy: adminAddress,
      bannedAt: Date.now(),
    }

    const bannedUserRef = ref(database, `${BANNED_USERS_REF}/${userAddress}`)
    await set(bannedUserRef, bannedUser)

    // Atualizar cache local
    if (bannedUsersCache) {
      const existingIndex = bannedUsersCache.findIndex((u) => u.address === userAddress)
      if (existingIndex >= 0) {
        bannedUsersCache[existingIndex] = bannedUser
      } else {
        bannedUsersCache.push(bannedUser)
      }
    }

    // Atualizar perfil do usuário (se existir)
    const profile = await getProfile(userAddress)
    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        banned: {
          until: banUntil,
          reason: reason,
        },
      }
      await saveProfile(updatedProfile)
    }

    console.log("User banned successfully")
  } catch (error) {
    console.error("Error banning user:", error)
    throw error
  }
}

export async function unbanUser(userAddress: string): Promise<void> {
  try {
    console.log(`Unbanning user ${userAddress}`)

    const bannedUserRef = ref(database, `${BANNED_USERS_REF}/${userAddress}`)
    await remove(bannedUserRef)

    // Atualizar cache local
    if (bannedUsersCache) {
      bannedUsersCache = bannedUsersCache.filter((user) => user.address !== userAddress)
    }

    // Atualizar perfil do usuário (se existir)
    const profile = await getProfile(userAddress)
    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        banned: undefined,
      }
      await saveProfile(updatedProfile)
    }

    console.log("User unbanned successfully")
  } catch (error) {
    console.error("Error unbanning user:", error)
    throw error
  }
}
