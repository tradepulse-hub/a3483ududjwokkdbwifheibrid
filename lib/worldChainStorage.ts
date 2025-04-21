import { MiniKit } from "@worldcoin/minikit-js"
import type { UserProfile, Post, Comment } from "@/types/square"

// Contract address and ABI
// Replace with the actual deployed contract address
const STORAGE_CONTRACT_ADDRESS = "0xb2271682333dE3f851c7522427E487a565dA6b16"

// ABI from the provided contract
const STORAGE_CONTRACT_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "admin", type: "address" },
      { indexed: true, internalType: "address", name: "addedBy", type: "address" },
    ],
    name: "AdminAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "admin", type: "address" },
      { indexed: true, internalType: "address", name: "removedBy", type: "address" },
    ],
    name: "AdminRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "string", name: "postId", type: "string" },
      { indexed: true, internalType: "string", name: "commentId", type: "string" },
    ],
    name: "CommentAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "string", name: "postId", type: "string" },
      { indexed: true, internalType: "address", name: "author", type: "address" },
    ],
    name: "PostCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "string", name: "postId", type: "string" },
      { indexed: true, internalType: "address", name: "deletedBy", type: "address" },
    ],
    name: "PostDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "string", name: "postId", type: "string" }],
    name: "PostEdited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "string", name: "postId", type: "string" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "PostLiked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "string", name: "postId", type: "string" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "PostUnliked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "userAddress", type: "address" }],
    name: "ProfileUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "admin", type: "address" },
      { indexed: false, internalType: "uint256", name: "duration", type: "uint256" },
      { indexed: false, internalType: "string", name: "reason", type: "string" },
    ],
    name: "UserBanned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "follower", type: "address" },
      { indexed: true, internalType: "address", name: "target", type: "address" },
    ],
    name: "UserFollowed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "admin", type: "address" },
    ],
    name: "UserUnbanned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "follower", type: "address" },
      { indexed: true, internalType: "address", name: "target", type: "address" },
    ],
    name: "UserUnfollowed",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "newAdmin", type: "address" }],
    name: "addAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "postId", type: "string" },
      { internalType: "string", name: "commentId", type: "string" },
      { internalType: "string", name: "commentData", type: "string" },
    ],
    name: "addComment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "userAddress", type: "address" },
      { internalType: "uint256", name: "durationSeconds", type: "uint256" },
      { internalType: "string", name: "reason", type: "string" },
    ],
    name: "banUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "checkAdminStatus",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "postId", type: "string" },
      { internalType: "string", name: "postData", type: "string" },
      { internalType: "string[]", name: "tags", type: "string[]" },
    ],
    name: "createPost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "profileData", type: "string" }],
    name: "createProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "postId", type: "string" }],
    name: "deletePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "postId", type: "string" },
      { internalType: "string", name: "postData", type: "string" },
    ],
    name: "editPost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "targetAddress", type: "address" }],
    name: "followUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPosts",
    outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getFollowers",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getFollowing",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "postId", type: "string" }],
    name: "getPost",
    outputs: [
      { internalType: "string", name: "data", type: "string" },
      { internalType: "address", name: "author", type: "address" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "uint256", name: "likeCount", type: "uint256" },
      { internalType: "uint256", name: "editCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "postId", type: "string" }],
    name: "getPostLikes",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddress", type: "address" }],
    name: "getProfile",
    outputs: [
      { internalType: "string", name: "data", type: "string" },
      { internalType: "bool", name: "isBanned", type: "bool" },
      { internalType: "bool", name: "isVerified", type: "bool" },
      { internalType: "bool", name: "userHasAdminRole", type: "bool" },
      { internalType: "uint256", name: "reputationScore", type: "uint256" },
      { internalType: "uint256", name: "lastActive", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "postId", type: "string" }],
    name: "likePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "admin", type: "address" }],
    name: "removeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddress", type: "address" }],
    name: "unbanUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "targetAddress", type: "address" }],
    name: "unfollowUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "postId", type: "string" }],
    name: "unlikePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "profileData", type: "string" }],
    name: "updateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddress", type: "address" }],
    name: "verifyUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// Function to generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Helper function to get contract instance
async function getContract() {
  try {
    if (!MiniKit.isInstalled()) {
      throw new Error("MiniKit is not installed")
    }

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

// Function to fetch a specific profile
export async function getProfile(address: string): Promise<UserProfile | null> {
  try {
    console.log(`Getting profile for address: ${address}`)

    // Call the getProfile function on the contract
    const [data, isBanned, isVerified, userHasAdminRole, reputationScore, lastActive] = await readContract(
      "getProfile",
      [address],
    )

    // If no profile data, return null
    if (!data || data === "") {
      return null
    }

    // Parse the profile data
    let profileData
    try {
      profileData = JSON.parse(data)
    } catch (e) {
      console.error("Error parsing profile data:", e)
      return null
    }

    // Return the profile
    return {
      address,
      nickname: profileData.nickname || address.substring(0, 6) + "...",
      profilePicture: profileData.profilePicture || null,
      isAdmin: userHasAdminRole,
      createdAt: profileData.createdAt || Number(lastActive) * 1000,
      followers: [], // We'll fetch these separately if needed
      following: [], // We'll fetch these separately if needed
      postCount: profileData.postCount || 0,
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

    const newProfile = {
      nickname: address.substring(0, 6) + "...",
      profilePicture: null,
      isAdmin: false,
      createdAt: Date.now(),
      followers: [],
      following: [],
      postCount: 0,
    }

    // Convert the profile to JSON
    const profileJson = JSON.stringify(newProfile)

    // Call the createProfile function on the contract
    await writeContract("createProfile", [profileJson])

    return {
      address,
      ...newProfile,
    }
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

    // Prepare the profile data for the contract
    const profileData = {
      nickname: profile.nickname,
      profilePicture: profile.profilePicture,
      createdAt: profile.createdAt,
      postCount: profile.postCount,
    }

    // Convert the profile to JSON
    const profileJson = JSON.stringify(profileData)

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
    console.log("Retrieved post IDs:", postIds)

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      console.log("No posts found")
      return []
    }

    // Fetch each post individually with better error handling
    const postsPromises = postIds.map(async (postId: string) => {
      try {
        console.log(`Fetching post with ID: ${postId}`)
        const post = await getPost(postId)
        return post
      } catch (e) {
        console.error(`Error fetching post ${postId}:`, e)
        return null
      }
    })

    // Use Promise.allSettled to handle errors gracefully
    const postsResults = await Promise.allSettled(postsPromises)

    // Filter out rejected promises and null posts
    const posts = postsResults
      .filter(
        (result): result is PromiseFulfilledResult<Post | null> =>
          result.status === "fulfilled" && result.value !== null,
      )
      .map((result) => result.value) as Post[]

    console.log(`Successfully retrieved ${posts.length} posts`)
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

    // Call the getPost function on the contract
    const [data, author, timestamp, likeCount, editCount] = await readContract("getPost", [postId])

    // Parse the post data
    let postData
    try {
      postData = JSON.parse(data)
    } catch (e) {
      console.error(`Error parsing post data for ${postId}:`, e)
      return null
    }

    // Get the likes for this post
    const likes = (await readContract("getPostLikes", [postId])) || []

    // Return the post
    return {
      id: postId,
      authorAddress: author,
      content: postData.content || "",
      images: postData.images || [],
      cryptoTags: postData.cryptoTags || [],
      trend: postData.trend || null,
      createdAt: Number(timestamp) * 1000, // Convert to milliseconds
      likes: likes,
      comments: [], // We'll fetch comments separately if needed
    }
  } catch (error) {
    console.error("Error getting post:", error)
    return null
  }
}

// Adicione esta nova função para verificar se um post existe
export async function checkPostExists(postId: string): Promise<boolean> {
  try {
    console.log(`Checking if post ${postId} exists`)

    // Try to get the post
    const [data, author, timestamp, likeCount, editCount] = await readContract("getPost", [postId])

    // If we get here without an error, the post exists
    return true
  } catch (error) {
    console.log(`Post ${postId} does not exist or could not be retrieved`)
    return false
  }
}

// Function to create a post
export async function createPost(post: Omit<Post, "id" | "likes" | "comments">): Promise<string> {
  try {
    console.log(`Creating post for author: ${post.authorAddress}`)

    // Generate a unique ID for the post
    const postId = generateId()
    console.log(`Generated post ID: ${postId}`)

    // Prepare the post data for the contract
    const postData = {
      content: post.content,
      images: post.images || [],
      cryptoTags: post.cryptoTags || [],
      trend: post.trend || null,
      timestamp: Math.floor(Date.now() / 1000), // Add timestamp in seconds
    }

    console.log("Post data:", postData)

    // Convert the post to JSON
    const postJson = JSON.stringify(postData)

    // Call the createPost function on the contract
    const txId = await writeContract("createPost", [postId, postJson, post.cryptoTags || []])
    console.log(`Post created with transaction ID: ${txId}`)

    // Wait a moment to ensure blockchain propagation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return postId
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

// Function to like a post
export async function likePost(postId: string): Promise<void> {
  try {
    console.log(`Liking post ${postId}`)

    // Call the likePost function on the contract
    await writeContract("likePost", [postId])
  } catch (error) {
    console.error("Error liking post:", error)
    throw error
  }
}

// Function to unlike a post
export async function unlikePost(postId: string): Promise<void> {
  try {
    console.log(`Unliking post ${postId}`)

    // Call the unlikePost function on the contract
    await writeContract("unlikePost", [postId])
  } catch (error) {
    console.error("Error unliking post:", error)
    throw error
  }
}

// Function to add a comment to a post
export async function addComment(
  postId: string,
  comment: Omit<Comment, "id" | "createdAt" | "likes">,
): Promise<string> {
  try {
    console.log(`Adding comment to post ${postId}`)

    // Generate a unique ID for the comment
    const commentId = generateId()

    // Prepare the comment data for the contract
    const commentData = {
      content: comment.content,
      authorAddress: comment.authorAddress,
    }

    // Convert the comment to JSON
    const commentJson = JSON.stringify(commentData)

    // Call the addComment function on the contract
    await writeContract("addComment", [postId, commentId, commentJson])

    return commentId
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

// Function to follow a user
export async function followUser(targetAddress: string): Promise<void> {
  try {
    console.log(`Following user ${targetAddress}`)

    // Call the followUser function on the contract
    await writeContract("followUser", [targetAddress])
  } catch (error) {
    console.error("Error following user:", error)
    throw error
  }
}

// Function to unfollow a user
export async function unfollowUser(targetAddress: string): Promise<void> {
  try {
    console.log(`Unfollowing user ${targetAddress}`)

    // Call the unfollowUser function on the contract
    await writeContract("unfollowUser", [targetAddress])
  } catch (error) {
    console.error("Error unfollowing user:", error)
    throw error
  }
}

// Function to get followers of a user
export async function getFollowers(address: string): Promise<string[]> {
  try {
    console.log(`Getting followers for ${address}`)

    // Call the getFollowers function on the contract
    const followers = await readContract("getFollowers", [address])
    return followers || []
  } catch (error) {
    console.error("Error getting followers:", error)
    return []
  }
}

// Function to get users that a user is following
export async function getFollowing(address: string): Promise<string[]> {
  try {
    console.log(`Getting following for ${address}`)

    // Call the getFollowing function on the contract
    const following = await readContract("getFollowing", [address])
    return following || []
  } catch (error) {
    console.error("Error getting following:", error)
    return []
  }
}

// Function to get all profiles
export async function getProfiles(): Promise<UserProfile[]> {
  try {
    console.log("Getting all profiles")

    // Unfortunately, the contract doesn't have a direct way to get all profiles
    // We would need to track all addresses that have created profiles
    // For now, we'll return an empty array
    // In a production environment, you would need to track profile creation events
    // or modify the contract to store and return all profile addresses

    return []
  } catch (error) {
    console.error("Error getting profiles:", error)
    return []
  }
}

// Function to get recent posts
export async function getRecentPosts(): Promise<Post[]> {
  try {
    const posts = await getPosts()

    // Sort by creation time, newest first
    return posts.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error("Error getting recent posts:", error)
    return []
  }
}

// Function to get popular posts
export async function getPopularPosts(): Promise<Post[]> {
  try {
    const posts = await getPosts()

    // Sort by number of likes, most likes first
    return posts.sort((a, b) => b.likes.length - a.likes.length)
  } catch (error) {
    console.error("Error getting popular posts:", error)
    return []
  }
}

// Function to get posts with a specific crypto tag
export async function getMarketPosts(crypto: string): Promise<Post[]> {
  try {
    const posts = await getPosts()

    // Filter posts by crypto tag
    return posts.filter(
      (post) => post.cryptoTags && post.cryptoTags.some((tag) => tag.toLowerCase() === crypto.toLowerCase()),
    )
  } catch (error) {
    console.error(`Error getting market posts for ${crypto}:`, error)
    return []
  }
}

// Function to check if the contract is accessible
export async function checkContractStatus(): Promise<boolean> {
  try {
    // Try to call a simple view function on the contract
    await readContract("owner")
    return true
  } catch (error) {
    console.error("Contract is not accessible:", error)
    return false
  }
}

// Function to refresh the cache
export async function refreshCache(): Promise<void> {
  // This is a placeholder. In a real implementation, you might clear local caches
  console.log("Cache refreshed")
}

// Function to initialize example data (for testing)
export async function initializeExampleData(): Promise<void> {
  // This is a placeholder. In a real implementation, you might add some test data
  console.log("Example data initialized")
}
