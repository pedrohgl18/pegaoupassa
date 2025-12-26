import { supabase } from './supabase.client'
import { pushNotifications } from './notification.service'

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
        // Note: userId is ignored by the new RPC which uses auth.uid()
        // Keeping the arg for compatibility but not passing it to RPC
        const { error } = await supabase.rpc('increment_like_count')
        return { error }
    },

    // Buscar likes recebidos (Quem curtiu você)
    getReceivedLikes: async (userId: string) => {
        console.log('=== GET RECEIVED LIKES DEBUG ===')
        console.log('userId:', userId)

        // 1. Buscar IDs de pessoas que eu já dei swipe (para não mostrar quem eu já curti ou passei)
        const { data: mySwipes } = await supabase
            .from('swipes')
            .select('swiped_id')
            .eq('swiper_id', userId)

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
