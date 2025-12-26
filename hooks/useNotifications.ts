import { useEffect } from 'react';
import { matches } from '../lib/supabase';
import { Chat } from '../types';
import { Preferences } from '@capacitor/preferences';

interface UseNotificationsProps {
    user: any;
    activeChatId?: string; // To suppress notifications if chat is open
    onOpenChat: (chat: Chat) => void;
    onNavigateToChaList: () => void;
}

export const useNotifications = ({ user, activeChatId, onOpenChat, onNavigateToChaList }: UseNotificationsProps) => {

    useEffect(() => {
        const handleNotificationTap = async (event: CustomEvent) => {
            const data = event.detail;

            // Guardar os dados da notificação para processar quando o user estiver disponível
            if (data.type === 'message' && data.conversationId) {
                // Salvar no localStorage para recuperar caso o app recarregue
                Preferences.set({ key: 'pendingNotification', value: JSON.stringify(data) });

                // Se já temos o user, processar imediatamente
                if (user) {
                    await openChatFromNotification(data.conversationId, user.id);
                }
            } else if (data.type === 'match') {
                onNavigateToChaList();
            }
        };

        const handlePushNotificationReceived = (event: CustomEvent) => {
            const data = event.detail;

            // Lógica de Supressão In-App (Se já estiver no chat, não incomodar)
            // activeChatId relates to the conversation ID usually
            if (data.type === 'message' && activeChatId === data.data.conversationId) {
                return;
            }

            // TODO: Mostrar um Toast/Snackbar customizado aqui para outras notificações
        };

        // Função para buscar o chat e abrir
        const openChatFromNotification = async (conversationId: string, userId: string) => {
            // Navegar para lista de chats primeiro (opcional, user preference)
            onNavigateToChaList();

            const { data: matchData } = await matches.getAll(userId);
            if (matchData) {
                const targetMatch = matchData.find((m: any) => {
                    const conv = Array.isArray(m.conversation) ? m.conversation[0] : m.conversation;
                    return conv?.id === conversationId;
                });

                if (targetMatch) {
                    const otherUser = targetMatch.user1_id === userId ? targetMatch.user2 : targetMatch.user1;
                    const conversation = Array.isArray(targetMatch.conversation) ? targetMatch.conversation[0] : targetMatch.conversation;

                    // Preparar objeto Chat
                    const chatObj: Chat = {
                        id: targetMatch.id,
                        otherUserId: otherUser.id,
                        name: otherUser.name,
                        imageUrl: otherUser.photos?.[0]?.url || 'https://picsum.photos/200',
                        lastMessage: conversation?.last_message_content || '',
                        timestamp: '', // Não crítico para abrir o chat
                        unreadCount: 0,
                        conversationId: conversation?.id,
                        isVip: otherUser.is_vip
                    };

                    onOpenChat(chatObj);

                    // Limpar notificação pendente
                    Preferences.remove({ key: 'pendingNotification' });
                }
            }
        };

        // Verificar se há notificação pendente (app foi aberto via notificação)
        const checkPendingNotification = async () => {
            const { value: pending } = await Preferences.get({ key: 'pendingNotification' });
            if (pending && user) {
                const data = JSON.parse(pending);
                if (data.conversationId) {
                    await openChatFromNotification(data.conversationId, user.id);
                }
            }
        };

        // Verificar notificação pendente quando user ficar disponível
        if (user) {
            checkPendingNotification();
        }

        window.addEventListener('push-notification-tap', handleNotificationTap as EventListener);
        window.addEventListener('push-notification', handlePushNotificationReceived as EventListener);

        return () => {
            window.removeEventListener('push-notification-tap', handleNotificationTap as EventListener);
            window.removeEventListener('push-notification', handlePushNotificationReceived as EventListener);
        };
    }, [user, activeChatId]); // Removed callbacks from deps to avoid re-renders if they are not memoized, but in strict React they should be.
};
