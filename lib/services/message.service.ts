import { supabase } from './supabase.client'
import { pushNotifications } from './notification.service'

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

    // Marcar várias como lidas (Batch)
    markBatchAsRead: async (messageIds: string[]) => {
        if (!messageIds || messageIds.length === 0) return { error: null };

        const { error } = await supabase
            .from('messages')
            .update({
                is_read: true,
                read_at: new Date().toISOString(),
            })
            .in('id', messageIds)

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
