import { NextResponse } from "next/server"
import { database } from "@/lib/firebaseConfig"
import { ref, set } from "firebase/database"

export async function POST(request: Request) {
  try {
    const profile = await request.json()

    if (!profile || !profile.address) {
      return NextResponse.json({ success: false, error: "Invalid profile data" }, { status: 400 })
    }

    // Garantir que arrays vazios sejam representados corretamente
    const safeProfile = {
      ...profile,
      followers: profile.followers || [],
      following: profile.following || [],
    }

    const profileRef = ref(database, `square_profiles/${profile.address}`)
    await set(profileRef, safeProfile)

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
