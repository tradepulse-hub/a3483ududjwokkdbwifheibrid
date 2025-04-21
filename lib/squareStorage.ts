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
  console.log("Initializing Firebase real-time listeners")

  try {
    // Listener para perfis
    if (!profilesListener) {
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
        },
      )
    }

    // Listener para posts
    if (!postsListener) {
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
        },
      )
    }

    // Listener para usuários banidos
    if (!bannedUsersListener) {
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
        },
      )
    }

    console.log("All listeners initialized successfully")
  } catch (error) {
    console.error("Error initializing listeners:", error)
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
      off(profilesRef, "value", profilesListener)
      profilesListener = null
    }

    if (postsListener) {
      console.log("Removing posts listener")
      const postsRef = ref(database, POSTS_REF)
      off(postsRef, "value", postsListener)
      postsListener = null
    }

    if (bannedUsersListener) {
      console.log("Removing banned users listener")
      const bannedUsersRef = ref(database, BANNED_USERS_REF)
      off(bannedUsersRef, "value", bannedUsersListener)
      bannedUsersListener = null
    }

    console.log("All listeners removed successfully")
  } catch (error) {
    console.error("Error removing listeners:", error)
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

  await saveProfile(newProfile)
  console.log("Default profile created successfully")
  return newProfile
}

export async function getOrCreateProfile(address: string): Promise<UserProfile> {
  console.log(`Getting or creating profile for address: ${address}`)

  const profile = await getProfile(address)
  if (profile) {
    console.log("Existing profile found")
    return profile
  }

  console.log("No profile found, creating default profile")
  return await createDefaultProfile(address)
}

// Funções para posts
export async function createPost(post: Omit<Post, "id" | "createdAt" | "likes" | "comments">): Promise<void> {
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
    const userProfile = await getProfile(post.authorAddress)
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
        postCount: userProfile.postCount + 1,
      }
      await saveProfile(updatedProfile)
    }
    console.log("Post created successfully")
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

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
    return []
  }
}

export async function likePost(postId: string, userAddress: string): Promise<void> {
  try {
    console.log(`Liking post ${postId} by user ${userAddress}`)
    const postRef = ref(database, `${POSTS_REF}/${postId}/likes`)
    await push(postRef, userAddress)

    // Atualizar cache local
    if (postsCache) {
      const postIndex = postsCache.findIndex((p) => p.id === postId)
      if (postIndex >= 0) {
        const post = postsCache[postIndex]
        if (!post.likes.includes(userAddress)) {
          post.likes.push(userAddress)
        }
      }
    }
    console.log("Post liked successfully")
  } catch (error) {
    console.error("Error liking post:", error)
    throw error
  }
}

export async function unlikePost(postId: string, userAddress: string): Promise<void> {
  try {
    console.log(`Unliking post ${postId} by user ${userAddress}`)
    const postRef = ref(database, `${POSTS_REF}/${postId}/likes`)

    // Buscar todas as curtidas para encontrar a curtida do usuário
    const snapshot = await get(postRef)
    const likes = snapshot.val()

    if (likes) {
      // Encontrar a chave da curtida do usuário
      const likeKey = Object.keys(likes).find((key) => likes[key] === userAddress)

      if (likeKey) {
        // Remover a curtida específica
        const userLikeRef = ref(database, `${POSTS_REF}/${postId}/likes/${likeKey}`)
        await remove(userLikeRef)

        // Atualizar cache local
        if (postsCache) {
          const postIndex = postsCache.findIndex((p) => p.id === postId)
          if (postIndex >= 0) {
            const post = postsCache[postIndex]
            post.likes = post.likes.filter((addr) => addr !== userAddress)
          }
        }
        console.log("Post unliked successfully")
        return
      }
    }
    console.log("User had not liked this post")
  } catch (error) {
    console.error("Error unliking post:", error)
    throw error
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    console.log(`Deleting post with ID: ${postId}`)
    const postRef = ref(database, `${POSTS_REF}/${postId}`)

    // Obter informações do post antes de deletar
    const postSnapshot = await get(postRef)
    const post = postSnapshot.val()

    await remove(postRef)

    // Atualizar cache local
    if (postsCache) {
      postsCache = postsCache.filter((p) => p.id !== postId)
    }

    // Atualizar contagem de posts do usuário
    if (post && post.authorAddress) {
      const userProfile = await getProfile(post.authorAddress)
      if (userProfile) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          postCount: Math.max(0, userProfile.postCount - 1),
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

export async function addComment(postId: string, comment: { authorAddress: string; content: string }): Promise<void> {
  try {
    console.log(`Adding comment to post ${postId} by user ${comment.authorAddress}`)
    const commentId = generateId()
    const newComment: Comment = {
      id: commentId,
      authorAddress: comment.authorAddress,
      content: comment.content,
      createdAt: Date.now(),
      likes: [],
    }

    const commentsRef = ref(database, `${POSTS_REF}/${postId}/comments`)
    await push(commentsRef, newComment)

    // Atualizar cache local
    if (postsCache) {
      const postIndex = postsCache.findIndex((p) => p.id === postId)
      if (postIndex >= 0) {
        const post = postsCache[postIndex]
        post.comments.push(newComment)
      }
    }
    console.log("Comment added successfully")
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

// Funções para seguir/deixar de seguir usuários
export async function followUser(followerAddress: string, followedAddress: string): Promise<void> {
  try {
    console.log(`User ${followerAddress} following user ${followedAddress}`)

    // Adicionar followedAddress à lista de following de followerAddress
    const followerRef = ref(database, `${PROFILES_REF}/${followerAddress}/following`)
    await push(followerRef, followedAddress)

    // Adicionar followerAddress à lista de followers de followedAddress
    const followedRef = ref(database, `${PROFILES_REF}/${followedAddress}/followers`)
    await push(followedRef, followerAddress)

    // Atualizar cache local
    if (profilesCache) {
      const followerProfile = profilesCache.find((p) => p.address === followerAddress)
      const followedProfile = profilesCache.find((p) => p.address === followedAddress)

      if (followerProfile && !followerProfile.following.includes(followedAddress)) {
        followerProfile.following.push(followedAddress)
      }

      if (followedProfile && !followedProfile.followers.includes(followerAddress)) {
        followedProfile.followers.push(followerAddress)
      }
    }
    console.log("Followed user successfully")
  } catch (error) {
    console.error("Error following user:", error)
    throw error
  }
}

export async function unfollowUser(followerAddress: string, followedAddress: string): Promise<void> {
  try {
    console.log(`User ${followerAddress} unfollowing user ${followedAddress}`)

    // Remover followedAddress da lista de following de followerAddress
    const followerRef = ref(database, `${PROFILES_REF}/${followerAddress}/following`)

    // Buscar todas as entradas para encontrar a entrada de followedAddress
    const followerSnapshot = await get(followerRef)
    const followingList = followerSnapshot.val()

    if (followingList) {
      // Encontrar a chave da entrada de followedAddress
      const followingKey = Object.keys(followingList).find((key) => followingList[key] === followedAddress)

      if (followingKey) {
        // Remover a entrada específica
        const userFollowingRef = ref(database, `${PROFILES_REF}/${followerAddress}/following/${followingKey}`)
        await remove(userFollowingRef)
      }
    }

    // Remover followerAddress da lista de followers de followedAddress
    const followedRef = ref(database, `${PROFILES_REF}/${followedAddress}/followers`)

    // Buscar todas as entradas para encontrar a entrada de followerAddress
    const followedSnapshot = await get(followedRef)
    const followersList = followedSnapshot.val()

    if (followersList) {
      // Encontrar a chave da entrada de followerAddress
      const followerKey = Object.keys(followersList).find((key) => followersList[key] === followerAddress)

      if (followerKey) {
        // Remover a entrada específica
        const userFollowerRef = ref(database, `${PROFILES_REF}/${followedAddress}/followers/${followerKey}`)
        await remove(userFollowerRef)
      }
    }

    // Atualizar cache local
    if (profilesCache) {
      const followerProfile = profilesCache.find((p) => p.address === followerAddress)
      const followedProfile = profilesCache.find((p) => p.address === followedAddress)

      if (followerProfile) {
        followerProfile.following = followerProfile.following.filter((addr) => addr !== followedAddress)
      }

      if (followedProfile) {
        followedProfile.followers = followedProfile.followers.filter((addr) => addr !== followerAddress)
      }
    }
    console.log("Unfollowed user successfully")
  } catch (error) {
    console.error("Error unfollowing user:", error)
    throw error
  }
}

// Funções para banir/desbanir usuários
export async function banUser(userAddress: string, bannedBy: string, duration: number, reason: string): Promise<void> {
  try {
    console.log(`Banning user ${userAddress} by ${bannedBy}`)
    const banUntil = Date.now() + duration // duration em milissegundos
    const bannedUser: BannedUser = {
      address: userAddress,
      until: banUntil,
      reason: reason,
      bannedBy: bannedBy,
      bannedAt: Date.now(),
    }

    const bannedUserRef = ref(database, `${BANNED_USERS_REF}/${userAddress}`)
    await set(bannedUserRef, bannedUser)

    // Atualizar cache local
    if (bannedUsersCache) {
      bannedUsersCache.push(bannedUser)
    }

    // Atualizar perfil do usuário (se existir)
    const userProfile = await getProfile(userAddress)
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
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
    const userProfile = await getProfile(userAddress)
    if (userProfile) {
      const updatedProfile: UserProfile = {
        ...userProfile,
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
