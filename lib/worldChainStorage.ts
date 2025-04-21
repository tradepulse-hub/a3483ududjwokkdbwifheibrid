import type { UserProfile, Post, Comment } from "@/types/square"
import { sortPostsByDate, sortPostsByPopularity, filterPostsByCrypto } from "@/lib/squareService"
import { MiniKit } from "@worldcoin/minikit-js"

// Endereço do contrato de armazenamento na World Chain
const STORAGE_CONTRACT_ADDRESS = "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45" // Substitua pelo endereço real do contrato

// ABI simplificado do contrato de armazenamento
const STORAGE_CONTRACT_ABI = [
  // Funções para perfis
  {
    inputs: [{ name: "profileData", type: "string" }],
    name: "saveProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "address", type: "address" }],
    name: "getProfile",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllProfiles",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },

  // Funções para posts
  {
    inputs: [{ name: "postData", type: "string" }],
    name: "createPost",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPosts",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "postId", type: "string" },
      { name: "userAddress", type: "address" },
    ],
    name: "likePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "postId", type: "string" },
      { name: "userAddress", type: "address" },
    ],
    name: "unlikePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "postId", type: "string" }],
    name: "deletePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "postId", type: "string" },
      { name: "commentData", type: "string" },
    ],
    name: "addComment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Funções para relacionamentos
  {
    inputs: [
      { name: "followerAddress", type: "address" },
      { name: "targetAddress", type: "address" },
    ],
    name: "followUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "followerAddress", type: "address" },
      { name: "targetAddress", type: "address" },
    ],
    name: "unfollowUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Funções para banimento
  {
    inputs: [
      { name: "userAddress", type: "address" },
      { name: "adminAddress", type: "address" },
      { name: "durationMs", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    name: "banUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "userAddress", type: "address" }],
    name: "unbanUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// Cache em memória para operações rápidas
let profilesCache: UserProfile[] | null = null
let postsCache: Post[] | null = null

// Função para gerar ID único
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Função para obter uma instância do contrato
async function getContract() {
  try {
    // Verificar se o MiniKit está instalado
    if (!MiniKit.isInstalled()) {
      throw new Error("MiniKit não está instalado")
    }

    // Usar o MiniKit para interagir com o contrato
    return {
      contract: STORAGE_CONTRACT_ADDRESS,
      abi: STORAGE_CONTRACT_ABI,
    }
  } catch (error) {
    console.error("Erro ao obter contrato:", error)
    throw error
  }
}

// Função para ler dados do contrato
async function readContract(functionName: string, args: any[] = []) {
  try {
    const contractInfo = await getContract()

    // Usar o MiniKit para ler dados do contrato
    const { finalPayload } = await MiniKit.commandsAsync.readContract({
      contract: contractInfo.contract,
      abi: contractInfo.abi,
      functionName,
      args,
    })

    if (finalPayload.status === "error") {
      throw new Error(finalPayload.message || "Erro ao ler dados do contrato")
    }

    return finalPayload.result
  } catch (error) {
    console.error(`Erro ao ler função ${functionName} do contrato:`, error)
    throw error
  }
}

// Função para escrever dados no contrato
async function writeContract(functionName: string, args: any[] = []) {
  try {
    const contractInfo = await getContract()

    // Usar o MiniKit para escrever dados no contrato
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
      throw new Error(finalPayload.message || "Erro ao escrever dados no contrato")
    }

    return finalPayload.transaction_id
  } catch (error) {
    console.error(`Erro ao escrever função ${functionName} no contrato:`, error)
    throw error
  }
}

// Funções para perfis de usuário
export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    console.log(`Salvando perfil para endereço: ${profile.address}`)

    // Garantir que arrays vazios sejam representados corretamente
    const safeProfile = {
      ...profile,
      followers: profile.followers || [],
      following: profile.following || [],
    }

    // Converter o perfil para JSON
    const profileJson = JSON.stringify(safeProfile)

    // Salvar o perfil no contrato
    await writeContract("saveProfile", [profileJson])

    // Atualizar cache local
    if (profilesCache) {
      const existingIndex = profilesCache.findIndex((p) => p.address === profile.address)
      if (existingIndex >= 0) {
        profilesCache[existingIndex] = safeProfile
      } else {
        profilesCache.push(safeProfile)
      }
    }

    console.log("Perfil salvo com sucesso")
  } catch (error) {
    console.error("Erro ao salvar perfil:", error)
    throw error
  }
}

export async function getProfiles(): Promise<UserProfile[]> {
  console.log("Obtendo todos os perfis")

  // Usar cache se disponível
  if (profilesCache !== null) {
    console.log(`Retornando ${profilesCache.length} perfis do cache`)
    return profilesCache
  }

  try {
    console.log("Buscando perfis do contrato")

    // Ler todos os perfis do contrato
    const profilesJson = await readContract("getAllProfiles")

    // Converter a string JSON para um array de perfis
    const profiles = JSON.parse(profilesJson) as UserProfile[]

    // Atualizar cache
    profilesCache = profiles

    console.log(`Buscados ${profiles.length} perfis`)
    return profiles
  } catch (error) {
    console.error("Erro ao obter perfis:", error)
    // Retornar array vazio em caso de erro para evitar quebras
    return []
  }
}

export async function getProfile(address: string): Promise<UserProfile | null> {
  console.log(`Obtendo perfil para endereço: ${address}`)

  // Verificar no cache primeiro
  if (profilesCache) {
    const cachedProfile = profilesCache.find((p) => p.address.toLowerCase() === address.toLowerCase())
    if (cachedProfile) {
      console.log("Perfil encontrado no cache")
      return cachedProfile
    }
  }

  try {
    console.log("Buscando perfil do contrato")

    // Ler o perfil do contrato
    const profileJson = await readContract("getProfile", [address])

    // Se não houver perfil, retornar null
    if (!profileJson) {
      console.log("Perfil não encontrado")
      return null
    }

    // Converter a string JSON para um objeto de perfil
    const profile = JSON.parse(profileJson) as UserProfile

    // Atualizar cache se o perfil for encontrado
    if (profile && profilesCache) {
      const existingIndex = profilesCache.findIndex((p) => p.address === address)
      if (existingIndex >= 0) {
        profilesCache[existingIndex] = profile
      } else {
        profilesCache.push(profile)
      }
    }

    console.log("Perfil encontrado:", profile)
    return profile
  } catch (error) {
    console.error("Erro ao obter perfil:", error)
    return null
  }
}

export async function createDefaultProfile(address: string): Promise<UserProfile> {
  console.log(`Criando perfil padrão para endereço: ${address}`)

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
    console.log("Perfil padrão criado com sucesso")
    return newProfile
  } catch (error) {
    console.error("Erro ao criar perfil padrão:", error)
    // Retornar o perfil mesmo se falhar ao salvar
    return newProfile
  }
}

export async function getOrCreateProfile(address: string): Promise<UserProfile> {
  console.log(`Obtendo ou criando perfil para endereço: ${address}`)

  try {
    const profile = await getProfile(address)
    if (profile) {
      console.log("Perfil existente encontrado")
      return profile
    }

    console.log("Perfil não encontrado, criando perfil padrão")
    return await createDefaultProfile(address)
  } catch (error) {
    console.error("Erro em getOrCreateProfile:", error)
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
  console.log("Obtendo todos os posts")

  // Usar cache se disponível
  if (postsCache !== null) {
    console.log(`Retornando ${postsCache.length} posts do cache`)
    return postsCache
  }

  try {
    console.log("Buscando posts do contrato")

    // Ler todos os posts do contrato
    const postsJson = await readContract("getAllPosts")

    // Converter a string JSON para um array de posts
    const posts = JSON.parse(postsJson) as Post[]

    // Atualizar cache
    postsCache = posts

    console.log(`Buscados ${posts.length} posts`)
    return posts
  } catch (error) {
    console.error("Erro ao obter posts:", error)
    // Retornar array vazio em caso de erro
    return []
  }
}

export function getRecentPosts(): Post[] {
  const posts = postsCache || []
  return sortPostsByDate(posts)
}

export function getPopularPosts(): Post[] {
  const posts = postsCache || []
  return sortPostsByPopularity(posts)
}

export function getMarketPosts(crypto: string): Post[] {
  const posts = postsCache || []
  return crypto === "ALL" ? posts : filterPostsByCrypto(posts, crypto)
}

export async function createPost(post: Omit<Post, "id" | "likes" | "comments">): Promise<string> {
  try {
    console.log(`Criando post para autor: ${post.authorAddress}`)

    // Gerar ID único para o post
    const postId = generateId()
    console.log(`ID de post gerado: ${postId}`)

    // Criar objeto do post com valores padrão para evitar erros
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

    // Converter o post para JSON
    const postJson = JSON.stringify(newPost)

    // Salvar o post no contrato
    await writeContract("createPost", [postJson])

    // Atualizar cache local
    if (postsCache) {
      postsCache.unshift(newPost) // Adicionar no início para mostrar posts mais recentes primeiro
    }

    // Atualizar contagem de posts do usuário
    try {
      const profile = await getProfile(post.authorAddress)
      if (profile) {
        const updatedProfile: UserProfile = {
          ...profile,
          postCount: (profile.postCount || 0) + 1,
        }
        await saveProfile(updatedProfile)
        console.log(`Contagem de posts atualizada para usuário: ${post.authorAddress}`)
      }
    } catch (profileError) {
      console.error("Erro ao atualizar contagem de posts do perfil:", profileError)
      // Continuar mesmo se falhar ao atualizar o perfil
    }

    console.log("Post criado com sucesso")
    return postId
  } catch (error) {
    console.error("Erro ao criar post:", error)
    throw new Error(`Falha ao criar post: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
  }
}

export async function likePost(postId: string, userAddress: string): Promise<void> {
  try {
    console.log(`Curtindo post ${postId} pelo usuário ${userAddress}`)

    // Chamar a função do contrato para curtir o post
    await writeContract("likePost", [postId, userAddress])

    // Atualizar cache local
    if (postsCache) {
      const postIndex = postsCache.findIndex((p) => p.id === postId)
      if (postIndex >= 0) {
        // Verificar se o usuário já curtiu o post
        if (!postsCache[postIndex].likes.includes(userAddress)) {
          postsCache[postIndex].likes.push(userAddress)
        }
      }
    }

    console.log("Curtida adicionada com sucesso")
  } catch (error) {
    console.error("Erro ao curtir post:", error)
    throw error
  }
}

export async function unlikePost(postId: string, userAddress: string): Promise<void> {
  try {
    console.log(`Descurtindo post ${postId} pelo usuário ${userAddress}`)

    // Chamar a função do contrato para descurtir o post
    await writeContract("unlikePost", [postId, userAddress])

    // Atualizar cache local
    if (postsCache) {
      const postIndex = postsCache.findIndex((p) => p.id === postId)
      if (postIndex >= 0) {
        postsCache[postIndex].likes = postsCache[postIndex].likes.filter((addr) => addr !== userAddress)
      }
    }

    console.log("Curtida removida com sucesso")
  } catch (error) {
    console.error("Erro ao descurtir post:", error)
    throw error
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    console.log(`Excluindo post ${postId}`)

    // Obter o post antes de excluí-lo para atualizar a contagem de posts do autor
    let authorAddress = ""
    if (postsCache) {
      const post = postsCache.find((p) => p.id === postId)
      if (post) {
        authorAddress = post.authorAddress
      }
    }

    // Chamar a função do contrato para excluir o post
    await writeContract("deletePost", [postId])

    // Atualizar cache local
    if (postsCache) {
      postsCache = postsCache.filter((p) => p.id !== postId)
    }

    // Atualizar contagem de posts do usuário
    if (authorAddress) {
      try {
        const profile = await getProfile(authorAddress)
        if (profile) {
          const updatedProfile: UserProfile = {
            ...profile,
            postCount: profile.postCount > 0 ? profile.postCount - 1 : 0,
          }
          await saveProfile(updatedProfile)
        }
      } catch (profileError) {
        console.error("Erro ao atualizar contagem de posts do perfil:", profileError)
        // Continuar mesmo se falhar ao atualizar o perfil
      }
    }

    console.log("Post excluído com sucesso")
  } catch (error) {
    console.error("Erro ao excluir post:", error)
    throw error
  }
}

export async function addComment(postId: string, comment: Omit<Comment, "id" | "createdAt" | "likes">): Promise<void> {
  try {
    console.log(`Adicionando comentário ao post ${postId}`)

    // Criar o novo comentário
    const commentId = generateId()
    const newComment: Comment = {
      id: commentId,
      authorAddress: comment.authorAddress,
      content: comment.content,
      createdAt: Date.now(),
      likes: [],
    }

    // Converter o comentário para JSON
    const commentJson = JSON.stringify(newComment)

    // Chamar a função do contrato para adicionar o comentário
    await writeContract("addComment", [postId, commentJson])

    // Atualizar cache local
    if (postsCache) {
      const postIndex = postsCache.findIndex((p) => p.id === postId)
      if (postIndex >= 0) {
        postsCache[postIndex].comments.push(newComment)
      }
    }

    console.log("Comentário adicionado com sucesso")
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error)
    throw error
  }
}

// Funções para seguir/deixar de seguir usuários
export async function followUser(followerAddress: string, targetAddress: string): Promise<void> {
  try {
    console.log(`Usuário ${followerAddress} seguindo ${targetAddress}`)

    // Chamar a função do contrato para seguir o usuário
    await writeContract("followUser", [followerAddress, targetAddress])

    // Atualizar cache local
    if (profilesCache) {
      // Atualizar o perfil do seguidor
      const followerIndex = profilesCache.findIndex((p) => p.address === followerAddress)
      if (followerIndex >= 0) {
        if (!profilesCache[followerIndex].following.includes(targetAddress)) {
          profilesCache[followerIndex].following.push(targetAddress)
        }
      }

      // Atualizar o perfil do alvo
      const targetIndex = profilesCache.findIndex((p) => p.address === targetAddress)
      if (targetIndex >= 0) {
        if (!profilesCache[targetIndex].followers.includes(followerAddress)) {
          profilesCache[targetIndex].followers.push(followerAddress)
        }
      }
    }

    console.log("Relação de seguir criada com sucesso")
  } catch (error) {
    console.error("Erro ao seguir usuário:", error)
    throw error
  }
}

export async function unfollowUser(followerAddress: string, targetAddress: string): Promise<void> {
  try {
    console.log(`Usuário ${followerAddress} deixando de seguir ${targetAddress}`)

    // Chamar a função do contrato para deixar de seguir o usuário
    await writeContract("unfollowUser", [followerAddress, targetAddress])

    // Atualizar cache local
    if (profilesCache) {
      // Atualizar o perfil do seguidor
      const followerIndex = profilesCache.findIndex((p) => p.address === followerAddress)
      if (followerIndex >= 0) {
        profilesCache[followerIndex].following = profilesCache[followerIndex].following.filter(
          (addr) => addr !== targetAddress,
        )
      }

      // Atualizar o perfil do alvo
      const targetIndex = profilesCache.findIndex((p) => p.address === targetAddress)
      if (targetIndex >= 0) {
        profilesCache[targetIndex].followers = profilesCache[targetIndex].followers.filter(
          (addr) => addr !== followerAddress,
        )
      }
    }

    console.log("Relação de seguir removida com sucesso")
  } catch (error) {
    console.error("Erro ao deixar de seguir usuário:", error)
    throw error
  }
}

// Funções para banir/desbanir usuários
export async function banUser(
  userAddress: string,
  adminAddress: string,
  durationMs: number,
  reason: string,
): Promise<void> {
  try {
    console.log(`Banindo usuário ${userAddress} pelo admin ${adminAddress}`)

    // Chamar a função do contrato para banir o usuário
    await writeContract("banUser", [userAddress, adminAddress, durationMs, reason])

    // Atualizar cache local
    if (profilesCache) {
      const userIndex = profilesCache.findIndex((p) => p.address === userAddress)
      if (userIndex >= 0) {
        profilesCache[userIndex].banned = {
          until: Date.now() + durationMs,
          reason,
        }
      }
    }

    console.log("Usuário banido com sucesso")
  } catch (error) {
    console.error("Erro ao banir usuário:", error)
    throw error
  }
}

export async function unbanUser(userAddress: string): Promise<void> {
  try {
    console.log(`Desbanindo usuário ${userAddress}`)

    // Chamar a função do contrato para desbanir o usuário
    await writeContract("unbanUser", [userAddress])

    // Atualizar cache local
    if (profilesCache) {
      const userIndex = profilesCache.findIndex((p) => p.address === userAddress)
      if (userIndex >= 0) {
        profilesCache[userIndex].banned = undefined
      }
    }

    console.log("Usuário desbanido com sucesso")
  } catch (error) {
    console.error("Erro ao desbanir usuário:", error)
    throw error
  }
}

// Função para inicializar dados de exemplo (útil para testes)
export async function initializeExampleData(): Promise<void> {
  // Verificar se já existem dados
  const existingPosts = await getPosts()
  const existingProfiles = await getProfiles()

  if (existingPosts.length > 0 || existingProfiles.length > 0) {
    console.log("Dados de exemplo já existem, pulando inicialização")
    return
  }

  console.log("Inicializando dados de exemplo")

  // Criar alguns perfis de exemplo
  const profiles: UserProfile[] = [
    {
      address: "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677",
      nickname: "Admin",
      profilePicture: null,
      isAdmin: true,
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 dias atrás
      followers: [],
      following: [],
      postCount: 2,
    },
    {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      nickname: "Alice",
      profilePicture: null,
      isAdmin: false,
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 dias atrás
      followers: [],
      following: [],
      postCount: 1,
    },
  ]

  // Criar alguns posts de exemplo
  const posts: Post[] = [
    {
      id: "example1",
      authorAddress: "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677",
      content: "Bem-vindo ao FiSquare! Este é um espaço para discutir criptomoedas e finanças. #TPF #WLD",
      images: [],
      cryptoTags: ["TPF", "WLD"],
      trend: "up",
      createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 dias atrás
      likes: [],
      comments: [],
    },
    {
      id: "example2",
      authorAddress: "0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677",
      content: "O mercado de #TPF está em alta hoje! Quais são suas previsões?",
      images: [],
      cryptoTags: ["TPF"],
      trend: "up",
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 dias atrás
      likes: ["0x1234567890abcdef1234567890abcdef12345678"],
      comments: [
        {
          id: "comment1",
          authorAddress: "0x1234567890abcdef1234567890abcdef12345678",
          content: "Acho que vai continuar subindo!",
          createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 dias atrás
          likes: [],
        },
      ],
    },
    {
      id: "example3",
      authorAddress: "0x1234567890abcdef1234567890abcdef12345678",
      content: "Alguém aqui está participando da loteria de #TPF? Parece interessante!",
      images: [],
      cryptoTags: ["TPF"],
      trend: null,
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 dia atrás
      likes: ["0xf04a78df4cc3017c0c23f37528d7b6cbbeea6677"],
      comments: [],
    },
  ]

  // Salvar dados de exemplo no contrato
  try {
    // Salvar perfis
    for (const profile of profiles) {
      await saveProfile(profile)
    }

    // Salvar posts
    for (const post of posts) {
      const postJson = JSON.stringify(post)
      await writeContract("createPost", [postJson])
    }

    console.log("Dados de exemplo inicializados com sucesso")
  } catch (error) {
    console.error("Erro ao inicializar dados de exemplo:", error)
    throw error
  }
}

// Função para atualizar o cache de posts e perfis
export async function refreshCache(): Promise<void> {
  try {
    console.log("Atualizando cache...")

    // Limpar cache atual
    postsCache = null
    profilesCache = null

    // Buscar dados atualizados
    await getPosts()
    await getProfiles()

    console.log("Cache atualizado com sucesso")
  } catch (error) {
    console.error("Erro ao atualizar cache:", error)
    throw error
  }
}
