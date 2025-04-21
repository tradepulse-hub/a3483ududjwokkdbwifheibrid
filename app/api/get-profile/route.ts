import { NextResponse } from "next/server"
import { database } from "@/lib/firebaseConfig"
import { ref, get } from "firebase/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    }

    const profileRef = ref(database, `square_profiles/${address}`)
    const snapshot = await get(profileRef)
    const profile = snapshot.exists() ? snapshot.val() : null

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error("Error getting profile:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
