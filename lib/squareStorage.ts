// Serviço para armazenar dados do Square no localStorage
import type { UserProfile, Post, BannedUser } from "@/types/square"
import { generateId } from "./squareService"

// Chaves para localStorage
const PROFILES_KEY = "square_profiles"
const POSTS_KEY = "square_posts"
const BANNED_USERS_KEY = "square_banned_users"

// Funções para perfis de usuário
export function saveProfile(profile: UserProfile): void {
  const profiles = getProfiles()
  const existingIndex = profiles.findIndex((p) => p.address === profile.address)

  if (existingIndex >= 0) {
    profiles[existingIndex] = profile
  } else {
    profiles.push(profile)
  }

  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function getProfiles(): UserProfile[] {
  const profilesJson = localStorage.getItem(PROFILES_KEY)
  return profilesJson ? JSON.parse(profilesJson) : []
}

export function getProfile(address: string): UserProfile | null {
  const profiles = getProfiles()
  return profiles.find((p) => p.address.toLowerCase() === address.toLowerCase()) || null
}

export function createDefaultProfile(address: string): UserProfile {
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

  saveProfile(newProfile)
  return newProfile
}

export function getOrCreateProfile(address: string): UserProfile {
  const profile = getProfile(address)
  if (profile) return profile
  return createDefaultProfile(address)
}

export function followUser(followerAddress: string, followedAddress: string): void {
  const followerProfile = getOrCreateProfile(followerAddress)
  const followedProfile = getOrCreateProfile(followedAddress)

  if (!followerProfile.following.includes(followedAddress)) {
    followerProfile.following.push(followedAddress)
    saveProfile(followerProfile)
  }

  if (!followedProfile.followers.includes(followerAddress)) {
    followedProfile.followers.push(followerAddress)
    saveProfile(followedProfile)
  }
}

export function unfollowUser(followerAddress: string, followedAddress: string): void {
  const followerProfile = getProfile(followerAddress)
  const followedProfile = getProfile(followedAddress)

  if (followerProfile) {
    followerProfile.following = followerProfile.following.filter((addr) => addr !== followedAddress)
    saveProfile(followerProfile)
  }

  if (followedProfile) {
    followedProfile.followers = followedProfile.followers.filter((addr) => addr !== followerAddress)
    saveProfile(followedProfile)
  }
}

// Funções para posts
export function savePosts(posts: Post[]): void {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}

export function getPosts(): Post[] {
  const postsJson = localStorage.getItem(POSTS_KEY)
  return postsJson ? JSON.parse(postsJson) : []
}

export function getPost(id: string): Post | null {
  const posts = getPosts()
  return posts.find((p) => p.id === id) || null
}

export function createPost(post: Omit<Post, "id" | "createdAt" | "likes" | "comments">): Post {
  const posts = getPosts()
  const newPost: Post = {
    ...post,
    id: generateId(),
    createdAt: Date.now(),
    likes: [],
    comments: [],
  }

  posts.push(newPost)
  savePosts(posts)

  // Atualizar contagem de posts do autor
  const profile = getOrCreateProfile(post.authorAddress)
  profile.postCount += 1
  saveProfile(profile)

  return newPost
}

export function updatePost(post: Post): void {
  const posts = getPosts()
  const index = posts.findIndex((p) => p.id === post.id)

  if (index >= 0) {
    posts[index] = post
    savePosts(posts)
  }
}

export function deletePost(postId: string): void {
  const posts = getPosts()
  const post = posts.find((p) => p.id === postId)

  if (post) {
    // Atualizar contagem de posts do autor
    const profile = getProfile(post.authorAddress)
    if (profile) {
      profile.postCount = Math.max(0, profile.postCount - 1)
      saveProfile(profile)
    }

    // Remover o post
    const updatedPosts = posts.filter((p) => p.id !== postId)
    savePosts(updatedPosts)
  }
}

export function likePost(postId: string, userAddress: string): void {
  const posts = getPosts()
  const post = posts.find((p) => p.id === postId)

  if (post) {
    if (!post.likes.includes(userAddress)) {
      post.likes.push(userAddress)
      updatePost(post)
    }
  }
}

export function unlikePost(postId: string, userAddress: string): void {
  const posts = getPosts()
  const post = posts.find((p) => p.id === postId)

  if (post) {
    post.likes = post.likes.filter((addr) => addr !== userAddress)
    updatePost(post)
  }
}

export function addComment(postId: string, comment: Omit<Comment, "id" | "createdAt" | "likes">): void {
  const posts = getPosts()
  const post = posts.find((p) => p.id === postId)

  if (post) {
    post.comments.push({
      ...comment,
      id: generateId(),
      createdAt: Date.now(),
      likes: [],
    })

    updatePost(post)
  }
}

// Funções para usuários banidos
export function saveBannedUsers(bannedUsers: BannedUser[]): void {
  localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(bannedUsers))
}

export function getBannedUsers(): BannedUser[] {
  const bannedUsersJson = localStorage.getItem(BANNED_USERS_KEY)
  return bannedUsersJson ? JSON.parse(bannedUsersJson) : []
}

export function banUser(userAddress: string, adminAddress: string, duration: number, reason: string): void {
  const bannedUsers = getBannedUsers()
  const profile = getOrCreateProfile(userAddress)

  // Calcular quando o banimento termina
  const until = Date.now() + duration

  // Atualizar o perfil do usuário
  profile.banned = {
    until,
    reason,
  }
  saveProfile(profile)

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

  saveBannedUsers(bannedUsers)
}

export function unbanUser(userAddress: string): void {
  const bannedUsers = getBannedUsers()
  const profile = getProfile(userAddress)

  if (profile) {
    // Remover o banimento do perfil
    delete profile.banned
    saveProfile(profile)
  }

  // Remover da lista de usuários banidos
  const updatedBannedUsers = bannedUsers.filter((b) => b.address !== userAddress)
  saveBannedUsers(updatedBannedUsers)
}
