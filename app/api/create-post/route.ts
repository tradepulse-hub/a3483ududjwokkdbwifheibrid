import { NextResponse } from "next/server"
import { database } from "@/lib/firebaseConfig"
import { ref, set } from "firebase/database"

// Função para gerar ID único
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { authorAddress, content, images, cryptoTags, trend } = data

    // Validar dados
    if (!authorAddress || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Gerar ID único para o post
    const postId = generateId()

    // Criar objeto do post
    const newPost = {
      id: postId,
      authorAddress,
      content,
      images: images || [],
      cryptoTags: cryptoTags || [],
      trend: trend || null,
      createdAt: Date.now(),
      likes: [],
      comments: [],
    }

    // Salvar o post no Firebase
    const postRef = ref(database, `square_posts/${postId}`)
    await set(postRef, newPost)

    // Atualizar contagem de posts do usuário (opcional)
    try {
      const profileRef = ref(database, `square_profiles/${authorAddress}`)
      const profileSnapshot = await fetch(`/api/get-profile?address=${authorAddress}`)
      const profileData = await profileSnapshot.json()

      if (profileData.success && profileData.profile) {
        const updatedProfile = {
          ...profileData.profile,
          postCount: (profileData.profile.postCount || 0) + 1,
        }

        await fetch("/api/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProfile),
        })
      }
    } catch (profileError) {
      console.error("Error updating profile post count:", profileError)
      // Continuar mesmo se falhar ao atualizar o perfil
    }

    return NextResponse.json({
      success: true,
      postId,
      message: "Post created successfully",
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
