import { useState, useEffect, useCallback } from 'react';
import { matches, swipes, supabase } from '../lib/supabase';
import { Chat } from '../types';

export const useMatchData = (user: any) => {
    const [matchesList, setMatchesList] = useState<Chat[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [receivedLikes, setReceivedLikes] = useState<any[]>([]);

    const fetchMatches = useCallback(async () => {
        if (!user) return;
        setLoadingMatches(true);
        const { data, error } = await matches.getAll(user.id);
        if (data) {
            const formattedMatches: Chat[] = data.map((m: any) => {
                const otherUser = m.user1_id === user.id ? m.user2 : m.user1;
                // conversation pode vir como array ou objeto dependendo da query
                const conversation = Array.isArray(m.conversation) ? m.conversation[0] : m.conversation;

                const lastMsg = conversation?.last_message_content || 'Comece a conversar!';
                const lastTime = conversation?.last_message_at
                    ? new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                return {
                    id: m.id,
                    otherUserId: otherUser.id,
                    name: otherUser.name,
                    imageUrl: otherUser.photos?.[0]?.url || '',
                    lastMessage: lastMsg,
                    timestamp: lastTime,
                    unreadCount: 0,
                    conversationId: conversation?.id,
                    isVip: otherUser.is_vip
                };
            });
            setMatchesList(formattedMatches);
        }
        setLoadingMatches(false);
    }, [user]);

    const fetchReceivedLikes = useCallback(async () => {
        if (!user) return;
        const { data, error } = await swipes.getReceivedLikes(user.id);
        if (error) {
            // Silent fail
        }
        if (data) {
            setReceivedLikes(data);
        }
    }, [user]);

    // Real-time listener for new messages (updates chat list logic)
    useEffect(() => {
        if (!user) return;

        // Subscribe to new messages where I'm the recipient
        const channel = supabase
            .channel('chat-list-updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const newMsg = payload.new as any;

                    // Update the matchesList with the new message
                    setMatchesList(prev => {
                        return prev.map(chat => {
                            if (chat.conversationId === newMsg.conversation_id) {
                                return {
                                    ...chat,
                                    lastMessage: newMsg.content || (newMsg.image_url ? '📷 Imagem' : ''),
                                    timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    unreadCount: newMsg.sender_id !== user.id ? (chat.unreadCount || 0) + 1 : chat.unreadCount,
                                };
                            }
                            return chat;
                        });
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return {
        matchesList,
        loadingMatches,
        receivedLikes,
        setReceivedLikes,
        fetchMatches,
        fetchReceivedLikes
    };
};
