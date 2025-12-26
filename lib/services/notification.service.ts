import { supabase } from './supabase.client'

// ============================================
// PUSH NOTIFICATIONS
// ============================================

export const pushNotifications = {
    // Enviar push notification via Edge Function
    send: async (userId: string, title: string, body: string, type: 'match' | 'message' | 'like', data?: Record<string, string>) => {
        try {
            const { data: result, error } = await supabase.functions.invoke('send-push-notification', {
                body: { userId, title, body, type, data }
            })

            if (error) {
                return { success: false, error }
            }

            return { success: true, data: result }
        } catch (err) {
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
            'Alguém curtiu você! Seja VIP para ver quem.', // Privacidade: Nome removido
            'like'
        )
    },
}
