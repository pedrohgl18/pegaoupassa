import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Detectar se está rodando no app nativo
const isNative = Capacitor.isNativePlatform()

console.log('=== SUPABASE CLIENT INIT ===')
console.log('isNative:', isNative)
console.log('supabaseUrl:', supabaseUrl)

// Cliente sem tipagem genérica para evitar erros de never
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: !isNative, // Desabilitar no nativo pois usamos deep links
    flowType: isNative ? 'implicit' : 'pkce', // Usar implicit no nativo para evitar problemas com PKCE
    storage: {
      // Usar localStorage com fallback - garantir que funciona no WebView
      getItem: (key: string) => {
        try {
          const value = localStorage.getItem(key)
          console.log(`[Storage] getItem(${key}):`, value ? 'exists' : 'null')
          return value
        } catch (e) {
          console.error('[Storage] getItem error:', e)
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value)
          console.log(`[Storage] setItem(${key}): saved`)
        } catch (e) {
          console.error('[Storage] setItem error:', e)
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
          console.log(`[Storage] removeItem(${key}): removed`)
        } catch (e) {
          console.error('[Storage] removeItem error:', e)
        }
      },
    },
  },
})

// ============================================
// AUTH HELPERS
// ============================================

export const auth = {
  // Login com Google
  signInWithGoogle: async () => {
    // No app nativo, usar custom scheme para redirect
    // IMPORTANTE: A URL deve terminar com / ou /callback para funcionar corretamente
    const redirectUrl = isNative
      ? 'com.pegaoupassa.app://callback/'
      : window.location.origin + '/auth/callback'

    console.log('=== SIGN IN WITH GOOGLE ===')
    console.log('isNative:', isNative)
    console.log('redirectUrl:', redirectUrl)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
        skipBrowserRedirect: isNative, // No nativo, abrimos manualmente
      },
    })

    console.log('signInWithOAuth resultado:')
    console.log('- url:', data?.url)
    console.log('- error:', error)

    // No app nativo, abrir o browser manualmente
    if (isNative && data?.url) {
      console.log('Abrindo browser com URL:', data.url)
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({
        url: data.url,
        presentationStyle: 'popover', // Melhor UX no Android
      })
    }

    return { data, error }
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Pegar sessão atual
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  },

  // Pegar usuário atual
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  },

  // Listener para mudanças de auth
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// ============================================
// PROFILES
// ============================================

export const profiles = {
  // Buscar perfil por ID
  getById: async (id: string) => {
    console.log('profiles.getById - ID:', id)

    try {
      const startTime = Date.now()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      console.log('profiles.getById - Tempo:', Date.now() - startTime, 'ms')
      console.log('profiles.getById - Data:', data ? 'found' : 'null')
      console.log('profiles.getById - Error:', error)
      return { data, error }
    } catch (err) {
      console.error('profiles.getById - EXCEÇÃO:', err)
      return { data: null, error: err as any }
    }
  },

  // Buscar perfil completo com fotos e interesses
  getByIdWithRelations: async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, photos(*), user_interests(interest:interests(*))')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Criar perfil inicial (apenas com email, para onboarding progressivo)
  createInitial: async (id: string, email: string) => {
    console.log('profiles.createInitial - ID:', id, 'Email:', email)

    try {
      const startTime = Date.now()
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id,
          email,
          onboarding_step: 0,
          onboarding_completed: false,
          is_active: false,
        })
        .select()
        .single()

      console.log('profiles.createInitial - Tempo:', Date.now() - startTime, 'ms')
      console.log('profiles.createInitial - Data:', data ? 'created' : 'null')
      console.log('profiles.createInitial - Error:', error)
      return { data, error }
    } catch (err) {
      console.error('profiles.createInitial - EXCEÇÃO:', err)
      return { data: null, error: err as any }
    }
  },

  // Criar ou atualizar perfil inicial (usa UPSERT para evitar erros de duplicata)
  upsertInitial: async (id: string, email: string) => {
    console.log('profiles.upsertInitial - ID:', id, 'Email:', email)

    try {
      const startTime = Date.now()
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id,
          email,
          onboarding_step: 0,
          onboarding_completed: false,
          is_active: false,
        }, {
          onConflict: 'id',
          ignoreDuplicates: false, // Retorna o registro existente
        })
        .select()
        .single()

      console.log('profiles.upsertInitial - Tempo:', Date.now() - startTime, 'ms')
      console.log('profiles.upsertInitial - Data:', data)
      console.log('profiles.upsertInitial - Error:', error)
      return { data, error }
    } catch (err) {
      console.error('profiles.upsertInitial - EXCEÇÃO:', err)
      return { data: null, error: err as any }
    }
  },

  // Criar perfil completo (método legado, mantido por compatibilidade)
  create: async (profile: {
    id: string
    email: string
    name: string
    bio?: string
    birth_date: string
    gender: 'male' | 'female' | 'other'
    looking_for: 'male' | 'female' | 'both'
  }) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...profile,
        onboarding_step: 4,
        onboarding_completed: true,
        is_active: true,
      })
      .select()
      .single()
    return { data, error }
  },

  // Atualizar step do onboarding
  updateOnboarding: async (id: string, data: Record<string, any>, step: number) => {
    const updates: Record<string, any> = {
      ...data,
      onboarding_step: step,
    }

    // Se chegou no step 4 (final), marca como completo e ativo
    if (step >= 4) {
      updates.onboarding_completed = true
      updates.is_active = true
    }

    const { data: result, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data: result, error }
  },

  // Atualizar perfil
  update: async (id: string, updates: Partial<{
    name: string
    bio: string
    profession: string
    height: number
    education: string
    latitude: number
    longitude: number
    city: string
    state: string
    zodiac_sign: string
    filter_min_age: number
    filter_max_age: number
    filter_max_distance: number
    looking_for: 'male' | 'female' | 'both'
    onboarding_step: number
    onboarding_completed: boolean
  }>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Buscar perfis para o feed (com filtros)
  getFeed: async (userId: string, filters: {
    gender?: string
    minAge?: number
    maxAge?: number
    minHeight?: number
    zodiac?: string
    maxDistance?: number
    userLocation?: { latitude: number, longitude: number }
    limit?: number
  }) => {
    let query = supabase
      .from('profiles')
      .select('*, photos(*)')
      .neq('id', userId)
      .eq('is_active', true)
      .eq('is_incognito', false) // Não mostrar usuários em modo incógnito

    // Filtro de Gênero
    if (filters.gender && filters.gender !== 'both') {
      query = query.eq('gender', filters.gender)
    }

    // Filtro de Idade (Calculado via data de nascimento)
    const today = new Date();
    if (filters.minAge) {
      const maxBirthDate = new Date(today.getFullYear() - filters.minAge, today.getMonth(), today.getDate()).toISOString().split('T')[0];
      query = query.lte('birth_date', maxBirthDate);
    }
    if (filters.maxAge) {
      const minBirthDate = new Date(today.getFullYear() - filters.maxAge - 1, today.getMonth(), today.getDate()).toISOString().split('T')[0];
      query = query.gte('birth_date', minBirthDate);
    }

    // Filtro de Altura
    if (filters.minHeight) {
      query = query.gte('height', filters.minHeight);
    }

    // Filtro de Signo
    if (filters.zodiac) {
      query = query.eq('zodiac_sign', filters.zodiac);
    }

    // Excluir perfis já vistos (swipes)
    const { data: swipedIds } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', userId)

    if (swipedIds && swipedIds.length > 0) {
      query = query.not('id', 'in', `(${swipedIds.map(s => s.swiped_id).join(',')})`)
    }

    // Buscar mais resultados para filtrar por distância no cliente
    // Se tiver filtro de distância, buscamos mais para garantir que sobrem alguns após o filtro
    const fetchLimit = filters.maxDistance ? (filters.limit || 10) * 5 : (filters.limit || 10);

    const { data, error } = await query.limit(fetchLimit);

    if (error) return { data: null, error };

    // Processamento no Cliente (Distância)
    let processedData = data || [];

    if (filters.userLocation && filters.maxDistance) {
      processedData = processedData.map((profile: any) => {
        // Calcular distância (Haversine simples)
        if (profile.latitude && profile.longitude) {
          const R = 6371; // Raio da Terra em km
          const dLat = (profile.latitude - filters.userLocation!.latitude) * Math.PI / 180;
          const dLon = (profile.longitude - filters.userLocation!.longitude) * Math.PI / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(filters.userLocation!.latitude * Math.PI / 180) * Math.cos(profile.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          return { ...profile, distance };
        }
        return { ...profile, distance: 9999 }; // Sem localização = longe
      }).filter((profile: any) => profile.distance <= (filters.maxDistance || 100));
    } else {
      // Se não tem localização do usuário, assume distância 0 ou desconhecida
      processedData = processedData.map((p: any) => ({ ...p, distance: 0 }));
    }

    // Ordenar por distância (mais perto primeiro) se tiver localização
    if (filters.userLocation) {
      processedData.sort((a: any, b: any) => a.distance - b.distance);
    }

    // Aplicar limite final
    return { data: processedData.slice(0, filters.limit || 10), error: null };
  },

  // Atualizar última vez online
  updateLastOnline: async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ last_online_at: new Date().toISOString() })
      .eq('id', id)
    return { error }
  },
}

// ============================================
// PHOTOS
// ============================================

export const photos = {
  // Upload de foto para Storage + salvar no banco
  upload: async (userId: string, file: File, position: number) => {
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${userId}/${timestamp}_${position}.${fileExt}`

    // Upload para o storage
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('Erro no upload storage:', uploadError)
      return { url: null, error: uploadError }
    }

    // Pegar URL assinada (bucket privado) - Validade de 10 anos
    const { data: signedData, error: signedError } = await supabase.storage
      .from('photos')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10)

    if (signedError || !signedData?.signedUrl) {
      console.error('Erro ao gerar URL assinada:', signedError)
      return { url: null, error: signedError }
    }

    const publicUrl = signedData.signedUrl

    // Salvar no banco de dados
    const { error: dbError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        url: publicUrl,
        position,
        is_primary: position === 0,
      })

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError)
      // Mesmo com erro no banco, retorna a URL pois o upload funcionou
      return { url: publicUrl, error: dbError }
    }

    return { url: publicUrl, error: null }
  },

  // Buscar fotos do usuário
  getByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true })

    return { data, error }
  },

  // Deletar foto
  delete: async (userId: string, photoId: string, fileName: string) => {
    // Deletar do storage
    await supabase.storage
      .from('photos')
      .remove([fileName])

    // Deletar do banco
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', userId)

    return { error }
  },
}

// ============================================
// SWIPES
// ============================================

export const swipes = {
  // Registrar swipe (like/pass/super_like)
  create: async (swiperId: string, swipedId: string, action: 'like' | 'pass' | 'super_like') => {
    console.log('=== SWIPES.CREATE DEBUG ===')
    console.log('swiperId:', swiperId)
    console.log('swipedId:', swipedId)
    console.log('action:', action)

    // Verificar sessão antes do swipe
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session exists:', !!session)
    console.log('Session user ID:', session?.user?.id)
    console.log('Session access_token exists:', !!session?.access_token)

    if (!session) {
      console.error('ERRO: Sem sessão ativa!')
      return { data: null, error: { message: 'Usuário não autenticado' }, match: null }
    }

    try {
      const startTime = Date.now()
      const { data, error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: swiperId,
          swiped_id: swipedId,
          action,
        })
        .select()
        .single()

      console.log('Insert time:', Date.now() - startTime, 'ms')
      console.log('Insert data:', JSON.stringify(data))
      console.log('Insert error:', JSON.stringify(error))

      if (error) {
        console.error('Erro ao inserir swipe:', error)
        return { data: null, error, match: null }
      }

      // Se foi like, verificar se houve match
      if (action === 'like' || action === 'super_like') {
        // Ordenar IDs para buscar na tabela matches (user1_id < user2_id)
        const user1 = swiperId < swipedId ? swiperId : swipedId
        const user2 = swiperId < swipedId ? swipedId : swiperId

        console.log('Checking match - user1:', user1, 'user2:', user2)

        const { data: match, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('user1_id', user1)
          .eq('user2_id', user2)
          .maybeSingle()

        console.log('Match query result:', JSON.stringify(match))
        console.log('Match query error:', JSON.stringify(matchError))

        // Se houve match, enviar push notification para ambos
        if (match) {
          console.log('🎉 MATCH ENCONTRADO!')
          // Buscar nomes dos usuários para a notificação
          const { data: swiper } = await supabase.from('profiles').select('name').eq('id', swiperId).single()
          const { data: swiped } = await supabase.from('profiles').select('name').eq('id', swipedId).single()

          // Notificar o outro usuário (quem recebeu o like que completou o match)
          if (swiped?.name) {
            pushNotifications.notifyMatch(swipedId, swiper?.name || 'Alguém', match.id, swiperId)
          }
          // Notificar quem acabou de dar like também
          if (swiper?.name) {
            pushNotifications.notifyMatch(swiperId, swiped?.name || 'Alguém', match.id, swipedId)
          }
        } else {
          // Se NÃO houve match, notificar o like recebido (apenas Like ou Super Like)
          console.log('👍 Like registrado (sem match). Enviando notificação...')
          const { data: swiper } = await supabase.from('profiles').select('name').eq('id', swiperId).single()

          if (swiper?.name) {
            pushNotifications.notifyLike(swipedId, swiper.name)
          }
        }

        return { data, error: null, match }
      }

      return { data, error: null, match: null }
    } catch (err) {
      console.error('EXCEÇÃO no swipe:', err)
      return { data: null, error: err as any, match: null }
    }
  },

  // Verificar se pode dar like (limite diário)
  canLike: async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('is_vip, daily_likes_count')
      .eq('id', userId)
      .single()

    if (!data) return false
    if (data.is_vip) return true
    return data.daily_likes_count < 30
  },

  // Incrementar contador de likes
  incrementLikeCount: async (userId: string) => {
    const { error } = await supabase.rpc('increment_like_count', { user_id: userId })
    return { error }
  },

  // Buscar likes recebidos (Quem curtiu você)
  getReceivedLikes: async (userId: string) => {
    console.log('=== GET RECEIVED LIKES DEBUG ===')
    console.log('userId:', userId)

    // Verificar sessão
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session exists:', !!session)

    // 1. Buscar IDs de pessoas que eu já dei swipe (para não mostrar quem eu já curti ou passei)
    const { data: mySwipes, error: swipesError } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', userId)

    console.log('My swipes count:', mySwipes?.length || 0)
    console.log('My swipes error:', swipesError)

    const mySwipedIds = mySwipes?.map(s => s.swiped_id) || []

    // 2. Buscar quem me curtiu e eu AINDA NÃO dei swipe
    let query = supabase
      .from('swipes')
      .select('*, profile:profiles!swipes_swiper_id_fkey(*, photos(*))')
      .eq('swiped_id', userId)
      .eq('action', 'like')

    if (mySwipedIds.length > 0) {
      query = query.not('swiper_id', 'in', `(${mySwipedIds.join(',')})`)
    }

    const { data, error } = await query
    console.log('Received likes count:', data?.length || 0)
    console.log('Received likes error:', error)
    console.log('Received likes data:', JSON.stringify(data))

    return { data, error }
  },
}

// ============================================
// MATCHES
// ============================================

export const matches = {
  // Listar matches do usuário
  getAll: async (userId: string) => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:profiles!matches_user1_id_fkey(*, photos(*)),
        user2:profiles!matches_user2_id_fkey(*, photos(*)),
        conversation:conversations(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Deletar match (desfazer match)
  unmatch: async (matchId: string) => {
    // Usar RPC para garantir que tudo seja deletado corretamente (bypass RLS)
    const { error } = await supabase.rpc('unmatch_user', { match_id: matchId })
    return { error }
  },
}

// ============================================
// MESSAGES
// ============================================

export const messages = {
  // Listar mensagens de uma conversa
  getByConversation: async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(name, photos(url))')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    return { data, error }
  },

  // Enviar mensagem (com push notification)
  send: async (conversationId: string, senderId: string, content: string, receiverId?: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select()
      .single()

    // Se temos o receiverId, enviar push notification
    if (data && receiverId && receiverId !== senderId) {
      const { data: sender } = await supabase.from('profiles').select('name').eq('id', senderId).single()
      const preview = content.length > 50 ? content.substring(0, 50) + '...' : content
      pushNotifications.notifyMessage(receiverId, sender?.name || 'Alguém', preview, conversationId, senderId)
    }

    return { data, error }
  },

  // Enviar mensagem com mídia (com push notification)
  sendWithMedia: async (
    conversationId: string,
    senderId: string,
    mediaUrl: string,
    mediaType: 'image' | 'audio',
    content?: string,
    receiverId?: string
  ) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content || (mediaType === 'image' ? '📷 Foto' : '🎤 Áudio'),
        media_url: mediaUrl,
        media_type: mediaType,
      })
      .select()
      .single()

    // Enviar push notification
    if (data && receiverId && receiverId !== senderId) {
      const { data: sender } = await supabase.from('profiles').select('name').eq('id', senderId).single()
      const preview = mediaType === 'image' ? '📷 Foto' : '🎤 Áudio'
      pushNotifications.notifyMessage(receiverId, sender?.name || 'Alguém', preview, conversationId, senderId)
    }

    return { data, error }
  },

  // Marcar como lida
  markAsRead: async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId)

    return { error }
  },

  // Subscrever a novas mensagens (real-time)
  subscribe: (conversationId: string, callback: (message: any) => void) => {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => callback(payload.new)
      )
      .subscribe()
  },
}

// ============================================
// INTERESTS
// ============================================

export const interests = {
  // Listar todos os interesses
  getAll: async () => {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .order('category', { ascending: true })

    return { data, error }
  },

  // Salvar interesses do usuário
  saveUserInterests: async (userId: string, interestIds: string[]) => {
    // Remover interesses antigos
    await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', userId)

    // Inserir novos
    const { error } = await supabase
      .from('user_interests')
      .insert(
        interestIds.map(interestId => ({
          user_id: userId,
          interest_id: interestId,
        }))
      )

    return { error }
  },
}

// ============================================
// REPORTS & BLOCKS
// ============================================

export const safety = {
  // Denunciar usuário
  report: async (reporterId: string, reportedId: string, reason: string, description?: string) => {
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        reason,
        description,
      })

    return { error }
  },

  // Bloquear usuário
  block: async (blockerId: string, blockedId: string) => {
    const { error } = await supabase
      .from('blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      })

    return { error }
  },

  // Desbloquear usuário
  unblock: async (blockerId: string, blockedId: string) => {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)

    return { error }
  },
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

export const pushNotifications = {
  // Enviar push notification via Edge Function
  send: async (userId: string, title: string, body: string, type: 'match' | 'message' | 'like', data?: Record<string, string>) => {
    console.log('📤 Enviando push notification:', { userId, title, body, type, data })

    try {
      const { data: result, error } = await supabase.functions.invoke('send-push-notification', {
        body: { userId, title, body, type, data }
      })

      console.log('📥 Resposta da Edge Function:', { result, error })

      if (error) {
        console.error('❌ Erro ao enviar push:', error)
        return { success: false, error }
      }

      console.log('✅ Push enviado com sucesso:', result)
      return { success: true, data: result }
    } catch (err) {
      console.error('❌ Erro ao chamar Edge Function:', err)
      return { success: false, error: err }
    }
  },

  // Notificar novo match
  notifyMatch: async (userId: string, matchedUserName: string, matchId: string, matchedUserId: string) => {
    return pushNotifications.send(
      userId,
      '🔥 Novo Match!',
      `Você e ${matchedUserName} deram match!`,
      'match',
      { matchId, userId: matchedUserId }
    )
  },

  // Notificar nova mensagem
  notifyMessage: async (userId: string, senderName: string, messagePreview: string, conversationId: string, senderId: string) => {
    return pushNotifications.send(
      userId,
      senderName,
      messagePreview,
      'message',
      { conversationId, senderId }
    )
  },

  // Notificar like recebido (VIP)
  notifyLike: async (userId: string, likerName: string) => {
    return pushNotifications.send(
      userId,
      '💚 Alguém te curtiu!',
      `${likerName} curtiu você! Seja VIP para ver quem.`,
      'like'
    )
  },
}

// ============================================
// COMPATIBILIDADE POR SIGNO
// ============================================

const zodiacCompatibility: Record<string, Record<string, number>> = {
  'Áries': { 'Áries': 50, 'Touro': 38, 'Gêmeos': 83, 'Câncer': 42, 'Leão': 97, 'Virgem': 63, 'Libra': 85, 'Escorpião': 50, 'Sagitário': 93, 'Capricórnio': 47, 'Aquário': 78, 'Peixes': 67 },
  'Touro': { 'Áries': 38, 'Touro': 65, 'Gêmeos': 33, 'Câncer': 97, 'Leão': 73, 'Virgem': 90, 'Libra': 65, 'Escorpião': 88, 'Sagitário': 30, 'Capricórnio': 98, 'Aquário': 58, 'Peixes': 85 },
  'Gêmeos': { 'Áries': 83, 'Touro': 33, 'Gêmeos': 60, 'Câncer': 65, 'Leão': 88, 'Virgem': 68, 'Libra': 93, 'Escorpião': 28, 'Sagitário': 60, 'Capricórnio': 68, 'Aquário': 85, 'Peixes': 53 },
  'Câncer': { 'Áries': 42, 'Touro': 97, 'Gêmeos': 65, 'Câncer': 75, 'Leão': 35, 'Virgem': 90, 'Libra': 43, 'Escorpião': 94, 'Sagitário': 53, 'Capricórnio': 83, 'Aquário': 27, 'Peixes': 98 },
  'Leão': { 'Áries': 97, 'Touro': 73, 'Gêmeos': 88, 'Câncer': 35, 'Leão': 45, 'Virgem': 35, 'Libra': 97, 'Escorpião': 58, 'Sagitário': 93, 'Capricórnio': 35, 'Aquário': 68, 'Peixes': 38 },
  'Virgem': { 'Áries': 63, 'Touro': 90, 'Gêmeos': 68, 'Câncer': 90, 'Leão': 35, 'Virgem': 65, 'Libra': 68, 'Escorpião': 88, 'Sagitário': 48, 'Capricórnio': 95, 'Aquário': 30, 'Peixes': 88 },
  'Libra': { 'Áries': 85, 'Touro': 65, 'Gêmeos': 93, 'Câncer': 43, 'Leão': 97, 'Virgem': 68, 'Libra': 75, 'Escorpião': 35, 'Sagitário': 73, 'Capricórnio': 55, 'Aquário': 90, 'Peixes': 88 },
  'Escorpião': { 'Áries': 50, 'Touro': 88, 'Gêmeos': 28, 'Câncer': 94, 'Leão': 58, 'Virgem': 88, 'Libra': 35, 'Escorpião': 80, 'Sagitário': 28, 'Capricórnio': 95, 'Aquário': 73, 'Peixes': 97 },
  'Sagitário': { 'Áries': 93, 'Touro': 30, 'Gêmeos': 60, 'Câncer': 53, 'Leão': 93, 'Virgem': 48, 'Libra': 73, 'Escorpião': 28, 'Sagitário': 45, 'Capricórnio': 60, 'Aquário': 90, 'Peixes': 63 },
  'Capricórnio': { 'Áries': 47, 'Touro': 98, 'Gêmeos': 68, 'Câncer': 83, 'Leão': 35, 'Virgem': 95, 'Libra': 55, 'Escorpião': 95, 'Sagitário': 60, 'Capricórnio': 75, 'Aquário': 68, 'Peixes': 88 },
  'Aquário': { 'Áries': 78, 'Touro': 58, 'Gêmeos': 85, 'Câncer': 27, 'Leão': 68, 'Virgem': 30, 'Libra': 90, 'Escorpião': 73, 'Sagitário': 90, 'Capricórnio': 68, 'Aquário': 45, 'Peixes': 45 },
  'Peixes': { 'Áries': 67, 'Touro': 85, 'Gêmeos': 53, 'Câncer': 98, 'Leão': 38, 'Virgem': 88, 'Libra': 88, 'Escorpião': 97, 'Sagitário': 63, 'Capricórnio': 88, 'Aquário': 45, 'Peixes': 60 },
}

export const zodiac = {
  // Calcular compatibilidade entre dois signos
  getCompatibility: (sign1: string | undefined, sign2: string | undefined): number => {
    if (!sign1 || !sign2) return 0
    return zodiacCompatibility[sign1]?.[sign2] || 50
  },

  // Obter descrição da compatibilidade
  getCompatibilityText: (percentage: number): string => {
    if (percentage >= 90) return 'Almas gêmeas! 🔥'
    if (percentage >= 75) return 'Combinação perfeita! 💕'
    if (percentage >= 60) return 'Bom potencial! 💫'
    if (percentage >= 45) return 'Pode dar certo! 🌟'
    return 'Opostos se atraem? 🤔'
  },
}

// ============================================
// SISTEMA DE BOOST
// ============================================

export const boosts = {
  // Ativar boost (30 minutos)
  activate: async (userId: string) => {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos

    // Criar registro do boost
    const { error: boostError } = await supabase
      .from('boosts')
      .insert({
        user_id: userId,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        price: 1.99
      })

    if (boostError) return { error: boostError }

    // Atualizar perfil com boost_expires_at
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ boost_expires_at: expiresAt.toISOString() })
      .eq('id', userId)

    return { error: profileError, expiresAt }
  },

  // Verificar se usuário tem boost ativo
  isActive: async (userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('boost_expires_at')
      .eq('id', userId)
      .single()

    if (!data?.boost_expires_at) return false
    return new Date(data.boost_expires_at) > new Date()
  },

  // Obter tempo restante do boost em minutos
  getTimeRemaining: async (userId: string): Promise<number> => {
    const { data } = await supabase
      .from('profiles')
      .select('boost_expires_at')
      .eq('id', userId)
      .single()

    if (!data?.boost_expires_at) return 0
    const remaining = new Date(data.boost_expires_at).getTime() - Date.now()
    return Math.max(0, Math.ceil(remaining / 60000))
  },
}

// ============================================
// SISTEMA DE DENÚNCIAS
// ============================================

export const reports = {
  // Criar denúncia
  create: async (reporterId: string, reportedId: string, reason: string, description?: string) => {
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        reason,
        description,
      })

    return { error }
  },

  // Verificar se já denunciou este usuário
  hasReported: async (reporterId: string, reportedId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', reporterId)
      .eq('reported_id', reportedId)
      .single()

    return !!data
  },
}

// ============================================
// REAÇÕES EM MENSAGENS
// ============================================

export const messageReactions = {
  // Adicionar/Atualizar reação
  add: async (messageId: string, userId: string, reaction: string) => {
    const { error } = await supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        user_id: userId,
        reaction,
      }, {
        onConflict: 'message_id,user_id'
      })

    return { error }
  },

  // Remover reação
  remove: async (messageId: string, userId: string) => {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)

    return { error }
  },

  // Buscar reações de uma mensagem
  getByMessage: async (messageId: string) => {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('*, user:profiles(name)')
      .eq('message_id', messageId)

    return { data, error }
  },
}
