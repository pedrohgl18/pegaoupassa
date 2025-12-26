import { supabase } from './supabase.client'

// ============================================
// PROFILES
// ============================================

export const profiles = {
    // Buscar perfil por ID
    getById: async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .maybeSingle()

            return { data, error }
        } catch (err) {
            return { data: null, error: err as any }
        }
    },

    // Buscar perfil completo com fotos e interesses
    getByIdWithRelations: async (id: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, photos(*), user_interests(*, interest:interests(*))')
            .eq('id', id)
            .single()
        return { data, error }
    },

    // Criar ou atualizar perfil inicial (usa UPSERT para evitar erros de duplicata)
    upsertInitial: async (id: string, email: string) => {
        try {
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
                    ignoreDuplicates: false,
                })
                .select()
                .single()

            return { data, error }
        } catch (err) {
            return { data: null, error: err as any }
        }
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
        vibe_status: string
        vibe_expires_at: string
        last_vibe_activation: string
        neighborhood: string
        tags: string[] // New: Identity tags
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
        // Se temos localização, usamos a RPC otimizada
        if (filters.userLocation) {

            const rpcParams = {
                lat: filters.userLocation.latitude,
                long: filters.userLocation.longitude,
                radius_km: filters.maxDistance || 100,
                user_id: userId,
                filter_gender: (filters.gender && filters.gender !== 'both') ? filters.gender : null,
                filter_min_age: filters.minAge || 18,
                filter_max_age: filters.maxAge || 100,
                filter_min_height: filters.minHeight || null,
                filter_zodiac: filters.zodiac || null,
                limit_count: filters.limit || 10,
                offset_count: 0
            };

            const { data, error } = await supabase
                .rpc('get_nearby_profiles', rpcParams);

            if (error) {
                return { data: null, error };
            }

            return { data, error: null };
        }

        // Fallback: Se NÃO tem localização, usa a query antiga (sem filtro de distância)
        let query = supabase
            .from('profiles')
            .select('*, photos(*), user_interests(*, interest:interests(*))')
            .neq('id', userId)
            .eq('is_active', true)

        // Buscar quem me curtiu (para mostrar incógnitos que me curtiram)
        const { data: fans } = await supabase
            .from('swipes')
            .select('swiper_id')
            .eq('swiped_id', userId)
            .eq('action', 'like')

        const fanIds = fans?.map(f => f.swiper_id) || [];

        if (fanIds.length > 0) {
            query = query.or(`is_incognito.eq.false,id.in.(${fanIds.join(',')})`);
        } else {
            query = query.eq('is_incognito', false);
        }

        // Filtro de Gênero
        if (filters.gender && filters.gender !== 'both') {
            query = query.eq('gender', filters.gender)
        }

        // Filtro de Idade
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

        // Excluir perfis já vistos
        const { data: swipedIds } = await supabase
            .from('swipes')
            .select('swiped_id')
            .eq('swiper_id', userId)

        if (swipedIds && swipedIds.length > 0) {
            query = query.not('id', 'in', `(${swipedIds.map(s => s.swiped_id).join(',')})`)
        }

        const { data, error } = await query.limit(filters.limit || 10);

        // Adicionar distância -1 para fallback
        const processedData = data ? data.map((p: any) => ({ ...p, distance: -1 })) : [];

        return { data: processedData, error };
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
        // Better extension handling
        let fileExt = file.name.split('.').pop();
        if (!fileExt || fileExt === file.name) {
            // If no extension, infer from type
            if (file.type === 'image/jpeg') fileExt = 'jpg';
            else if (file.type === 'image/png') fileExt = 'png';
            else if (file.type === 'image/webp') fileExt = 'webp';
            else fileExt = 'jpg'; // Fallback
        }

        const timestamp = Date.now()
        const fileName = `${userId}/${timestamp}_${position}.${fileExt}`

        // Upload para o storage
        const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, file, { upsert: true })

        if (uploadError) {
            return { url: null, error: uploadError }
        }

        // Pegar URL Pública (Bucket 'photos' deve ser Public)
        const { data: publicData } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName)

        const publicUrl = publicData.publicUrl

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

    // Manual create (used with R2 or generic URL)
    create: async (data: { user_id: string, url: string, position: number }) => {
        const { error } = await supabase
            .from('photos')
            .insert(data);
        return { error };
    },
}
