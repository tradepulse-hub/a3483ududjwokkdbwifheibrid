import type { UserProfile } from "@/types/square"

// This is a placeholder implementation.  A real implementation would
// interact with a blockchain or other persistent storage.

const profiles: UserProfile[] = []

export async function getProfiles(): Promise<UserProfile[]> {
  return profiles
}

export async function getOrCreateProfile(address: string): Promise<UserProfile> {
  let profile = profiles.find((p) => p.address === address)
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
    profiles.push(profile)
  }
  return profile
}

export async function initializeExampleData(): Promise<void> {
  // This function would populate the storage with initial data.
  // In this placeholder, it does nothing.
}

export async function refreshCache(): Promise<void> {
  // This function would refresh the local cache with data from the
  // persistent storage. In this placeholder, it does nothing.
}
