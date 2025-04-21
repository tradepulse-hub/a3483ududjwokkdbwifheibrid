import { MiniKit } from "@worldcoin/minikit-js"
import type { UserProfile, Post, Comment } from "@/types/square"

// Contract address and ABI
const STORAGE_CONTRACT_ADDRESS = "0xb2271682333dE3f851c7522427E487a565dA6b16" // Replace with the actual contract address
const STORAGE_CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "addedBy",
        type: "address",
      },
    ],
    name: "AdminAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "removedBy",
        type: "address",
      },
    ],
    name: "AdminRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "postId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "string",
        name: "commentId",
        type: "string",
      },
    ],
    name: "CommentAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "postId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "author",
        type: "address",
      },
    ],
    name: "PostCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "postId",
        type: "string",
      },
    ],
    name: "PostEdited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "postId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "PostLiked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "postId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "PostUnliked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "ProfileUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "duration",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "UserBanned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "follower",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "UserFollowed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "UserUnbanned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "follower",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "UserUnfollowed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "addAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "postId",
        type: "string",
      },
      {
        internalType: "string",
        name: "commentId",
        type: "string",
      },
      {
        internalType: "string",
        name: "commentData",
        type: "string",
      },
    ],
    name: "addComment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "durationSeconds",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "banUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "postId",
        type: "string",
      },
      {
        internalType: "string",
        name: "postData",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "tags",
        type: "string[]",
      },
    ],
    name: "createPost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "profileData",
        type: "string",
      },
    ],
    name: "createProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "postId",
        type: "string",
      },
    ],
    name: "deletePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "postId",
        type: "string",
      },
      {
        internalType: "string",
        name: "postData",
        type: "string",
      },
    ],
    name: "editPost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "targetAddress",
        type: "address",
      },
    ],
    name: "followUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPosts",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getFollowers",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getFollowing",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "postId",
        type: "string",
      },
    ],
    name: "getPost",
    outputs: [
      {
        internalType: "string",
        name: "data",
        type: "string",
      },
      {
        internalType: "address",
        name: "author",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "likeCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "editCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "postId",
        type: "string",
      },
    ],
    name: "getPostLikes",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "getProfile",
    outputs: [
      {
        internalType: "string",
        name: "data",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isBanned",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "userHasAdminRole",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "reputationScore",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastActive",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "postId",
        type: "string",
      },
    ],
    name: "likePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "removeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "unbanUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "targetAddress",
        type: "address",
      },
    ],
    name: "unfollowUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "postId",
        type: "string",
      },
    ],
    name: "unlikePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "profileData",
        type: "string",
      },
    ],
    name: "updateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
    ],
    name: "verifyUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// Helper function to get contract instance
async function getContract() {
  try {
    if (!MiniKit.isInstalled()) {
      throw new Error("MiniKit is not installed")
    }

    // Use the correct type for the ABI
    return {
      contract: STORAGE_CONTRACT_ADDRESS,
      abi: STORAGE_CONTRACT_ABI,
    }
  } catch (error) {
    console.error("Error getting contract:", error)
    throw error
  }
}

// Helper function to read data from the contract
async function readContract(functionName: string, args: any[] = []) {
  try {
    const contractInfo = await getContract()

    // Use the correct type for the ABI
    const { finalPayload } = await MiniKit.commandsAsync.readContract({
      contract: contractInfo.contract,
      abi: contractInfo.abi,
      functionName,
      args,
    })

    if (finalPayload.status === "error") {
      throw new Error(finalPayload.message || "Error reading from contract")
    }

    return finalPayload.result
  } catch (error) {
    console.error(`Error reading function ${functionName} from contract:`, error)
    throw error
  }
}

// Helper function to write data to the contract
async function writeContract(functionName: string, args: any[] = []) {
  try {
    const contractInfo = await getContract()

    // Use the correct type for the ABI
    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: contractInfo.contract,
          abi: contractInfo.abi,
          functionName,
          args,
        },
      ],
    })

    if (finalPayload.status === "error") {
      throw new Error(finalPayload.message || "Error writing to contract")
    }

    return finalPayload.transaction_id
  } catch (error) {
    console.error(`Error writing function ${functionName} to contract:`, error)
    throw error
  }
}

// Function to generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Function to fetch all profiles
export async function getProfiles(): Promise<UserProfile[]> {
  try {
    console.log("Getting all profiles from contract")
    const profileAddresses = await readContract("getAllProfiles")
    console.log("Profile addresses:", profileAddresses)

    // Fetch each profile individually
    const profiles = await Promise.all(
      profileAddresses.map(async (address: string) => {
        const profile = await getProfile(address)
        return profile
      }),
    )

    console.log("Profiles:", profiles)
    return profiles
  } catch (error) {
    console.error("Error getting profiles:", error)
    return []
  }
}

// Function to fetch a specific profile
export async function getProfile(address: string): Promise<UserProfile | null> {
  try {
    console.log(`Getting profile for address: ${address}`)
    const [data, isBanned, isVerified, userHasAdminRole, reputationScore, lastActive] = await readContract(
      "getProfile",
      [address],
    )

    // Parse the profile data
    const profileData = JSON.parse(data)

    // Return the profile
    return {
      address,
      nickname: profileData.nickname,
      profilePicture: profileData.profilePicture,
      isAdmin: userHasAdminRole,
      createdAt: profileData.createdAt,
      followers: profileData.followers,
      following: profileData.following,
      postCount: profileData.postCount,
    }
  } catch (error) {
    console.error("Error getting profile:", error)
    return null
  }
}

// Function to create a default profile
export async function createDefaultProfile(address: string): Promise<UserProfile> {
  try {
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

    // Convert the profile to JSON
    const profileJson = JSON.stringify(newProfile)

    // Call the createProfile function on the contract
    await writeContract("createProfile", [profileJson])

    return newProfile
  } catch (error) {
    console.error("Error creating default profile:", error)
    throw error
  }
}

// Function to get or create a profile
export async function getOrCreateProfile(address: string): Promise<UserProfile> {
  try {
    const profile = await getProfile(address)
    if (profile) {
      return profile
    } else {
      return await createDefaultProfile(address)
    }
  } catch (error) {
    console.error("Error in getOrCreateProfile:", error)
    throw error
  }
}

// Function to save a profile
export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    console.log(`Saving profile for address: ${profile.address}`)

    // Convert the profile to JSON
    const profileJson = JSON.stringify(profile)

    // Call the updateProfile function on the contract
    await writeContract("updateProfile", [profileJson])
  } catch (error) {
    console.error("Error saving profile:", error)
    throw error
  }
}

// Function to get all posts
export async function getPosts(): Promise<Post[]> {
  try {
    console.log("Getting all posts from contract")

    // Call the getAllPosts function on the contract
    const postIds = await readContract("getAllPosts")

    // Fetch each post individually
    const posts = await Promise.all(
      postIds.map(async (postId: string) => {
        const post = await getPost(postId)
        return post
      }),
    )

    return posts
  } catch (error) {
    console.error("Error getting posts:", error)
    return []
  }
}

// Function to get a specific post
export async function getPost(postId: string): Promise<Post | null> {
  try {
    console.log(`Getting post for postId: ${postId}`)
    const [data, author, timestamp, likeCount, editCount] = await readContract("getPost", [postId])

    // Parse the post data
    const postData = JSON.parse(data)

    // Return the post
    return {
      id: postId,
      authorAddress: author,
      content: postData.content,
      images: postData.images,
      cryptoTags: postData.cryptoTags,
      trend: postData.trend,
      createdAt: timestamp,
      likes: [], // You may need to fetch likes separately
      comments: [], // You may need to fetch comments separately
    }
  } catch (error) {
    console.error("Error getting post:", error)
    return null
  }
}

// Function to create a post
export async function createPost(post: Omit<Post, "id" | "likes" | "comments">): Promise<string> {
  try {
    console.log(`Creating post for author: ${post.authorAddress}`)

    // Generate a unique ID for the post
    const postId = generateId()

    // Create the new post
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

    // Convert the post to JSON
    const postJson = JSON.stringify(newPost)

    // Call the createPost function on the contract
    await writeContract("createPost", [postId, postJson, newPost.cryptoTags])

    return postId
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

// Function to like a post
export async function likePost(postId: string, userAddress: string): Promise<void> {
  try {
    console.log(`Liking post ${postId} by user ${userAddress}`)

    // Call the likePost function on the contract
    await writeContract("likePost", [postId, userAddress])
  } catch (error) {
    console.error("Error liking post:", error)
    throw error
  }
}

// Function to unlike a post
export async function unlikePost(postId: string, userAddress: string): Promise<void> {
  try {
    console.log(`Unliking post ${postId} by user ${userAddress}`)

    // Call the unlikePost function on the contract
    await writeContract("unlikePost", [postId, userAddress])
  } catch (error) {
    console.error("Error unliking post:", error)
    throw error
  }
}

// Function to add a comment to a post
export async function addComment(postId: string, comment: Omit<Comment, "id" | "createdAt" | "likes">): Promise<void> {
  try {
    console.log(`Adding comment to post ${postId}`)

    // Generate a unique ID for the comment
    const commentId = generateId()

    // Create the new comment
    const newComment: Comment = {
      id: commentId,
      authorAddress: comment.authorAddress,
      content: comment.content,
      createdAt: Date.now(),
      likes: [],
    }

    // Convert the comment to JSON
    const commentJson = JSON.stringify(newComment)

    // Call the addComment function on the contract
    await writeContract("addComment", [postId, commentId, commentJson])
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

// Function to follow a user
export async function followUser(followerAddress: string, targetAddress: string): Promise<void> {
  try {
    console.log(`Following user ${targetAddress} by ${followerAddress}`)

    // Call the followUser function on the contract
    await writeContract("followUser", [followerAddress, targetAddress])
  } catch (error) {
    console.error("Error following user:", error)
    throw error
  }
}

// Function to unfollow a user
export async function unfollowUser(followerAddress: string, targetAddress: string): Promise<void> {
  try {
    console.log(`Unfollowing user ${targetAddress} by ${followerAddress}`)

    // Call the unfollowUser function on the contract
    await writeContract("unfollowUser", [followerAddress, targetAddress])
  } catch (error) {
    console.error("Error unfollowing user:", error)
    throw error
  }
}

// Function to ban a user
export async function banUser(
  userAddress: string,
  adminAddress: string,
  durationMs: number,
  reason: string,
): Promise<void> {
  try {
    console.log(`Banning user ${userAddress} by ${adminAddress}`)

    // Call the banUser function on the contract
    await writeContract("banUser", [userAddress, adminAddress, durationMs, reason])
  } catch (error) {
    console.error("Error banning user:", error)
    throw error
  }
}

// Function to unban a user
export async function unbanUser(userAddress: string): Promise<void> {
  try {
    console.log(`Unbanning user ${userAddress}`)

    // Call the unbanUser function on the contract
    await writeContract("unbanUser", [userAddress])
  } catch (error) {
    console.error("Error unbanning user:", error)
    throw error
  }
}

// Placeholder functions for sorting and filtering posts
export function getRecentPosts(): Post[] {
  // Implement logic to fetch and sort posts from the contract
  return []
}

export function getPopularPosts(): Post[] {
  // Implement logic to fetch and sort posts from the contract
  return []
}

export function getMarketPosts(crypto: string): Post[] {
  // Implement logic to fetch and filter posts from the contract
  return []
}

export async function initializeExampleData(): Promise<void> {
  // This function would populate the storage with initial data.
  // In this placeholder, it does nothing.
}

export async function refreshCache(): Promise<void> {
  // This function would refresh the local cache with data from the
  // persistent storage. In this placeholder, it does nothing.
}
