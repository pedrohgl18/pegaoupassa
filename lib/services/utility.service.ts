import { supabase } from './supabase.client'

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
        console.log('saveUserInterests:', userId, interestIds)

        try {
            // 1. Remover interesses antigos
            const { error: deleteError } = await supabase
                .from('user_interests')
                .delete()
                .eq('user_id', userId)

            if (deleteError) {
                console.error('Erro ao limpar interesses:', deleteError)
                return { error: deleteError }
            }

            // Se não tem novos interesses, paramos aqui
            if (!interestIds || interestIds.length === 0) {
                return { error: null }
            }

            // 2. Inserir novos
            const { error: insertError } = await supabase
                .from('user_interests')
                .insert(
                    interestIds.map(interestId => ({
                        user_id: userId,
                        interest_id: interestId,
                    }))
                )

            if (insertError) {
                console.error('Erro ao salvar interesses:', insertError)
                return { error: insertError }
            }

            return { error: null }
        } catch (err) {
            console.error('Exceção em saveUserInterests:', err)
            return { error: err }
        }
    },
}

// ============================================
// REPORTS & BLOCKS
// ============================================

export const reports = {
    // Criar denúncia
    create: async (reporterId: string, reportedId: string, reason: string, description?: string, chatSnapshot?: any[]) => {
        const { error } = await supabase
            .from('reports')
            .insert({
                reporter_id: reporterId,
                reported_id: reportedId,
                reason,
                description,
                chat_snapshot: chatSnapshot
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

export const safety = {
    // Denunciar usuário
    report: async (reporterId: string, reportedId: string, reason: string, description?: string) => {
        return reports.create(reporterId, reportedId, reason, description)
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
        if (percentage >= 90) return 'Alma Gêmea! Pode marcar o casamento 💍'
        if (percentage >= 75) return 'Química Pura! 🔥 Vai dar namoro'
        if (percentage >= 60) return 'Tem Futuro! ✨ Só não enrola'
        if (percentage >= 45) return 'Pagou pra ver! 🎲 Ousadia pura'
        return 'Desafio Aceito? 😈 Os opostos se atraem...'
    },

    // Calcular signo (getSing helper)
    getSign: (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;

        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Áries';
        if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Touro';
        if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gêmeos';
        if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Câncer';
        if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leão';
        if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgem';
        if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
        if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Escorpião';
        if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagitário';
        if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricórnio';
        if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquário';
        return 'Peixes';
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
