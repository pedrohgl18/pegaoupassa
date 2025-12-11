import { useCallback } from 'react';
import { swipes, matches, messages } from '../lib/supabase';
import { DAILY_FREE_SWIPES } from '../constants';

interface UseSwipeActionProps {
    user: any;
    profile: any;
    isVip: boolean;
    swipeCount: number;
    incrementSwipeCount: () => void;
    onVipGate: () => void;
    onMatch: (match: any, likedProfile: any) => void;
}

export const useSwipeAction = ({
    user,
    profile,
    isVip,
    swipeCount,
    incrementSwipeCount,
    onVipGate,
    onMatch
}: UseSwipeActionProps) => {

    const handleSwipe = useCallback(async (direction: 'left' | 'right' | 'up' | 'down', targetProfile: any, forceMatch: boolean = false) => {
        if (!user || !targetProfile) return;

        // Vertical Logic: UP = PASS, DOWN = LIKE
        // Horizontal Logic: LEFT = PASS, RIGHT = LIKE (if we support it)
        let action: 'like' | 'pass' = 'pass';
        if (direction === 'down' || direction === 'right') action = 'like';

        if (action === 'like') {
            // Check limits
            if (swipeCount >= DAILY_FREE_SWIPES && !isVip && !forceMatch) {
                onVipGate();
                return false; // Swipe blocked
            }
            if (!forceMatch) {
                incrementSwipeCount();
                // Persist increment
                swipes.incrementLikeCount(user.id).catch(err => console.error('Failed to increment like count:', err));
            }
        }

        // API Call
        try {
            const { match, error } = await swipes.create(user.id, targetProfile.id, action);

            if (error) {
                console.error('Erro no swipe:', error);
                return false;
            }

            if (match) {
                onMatch(match, targetProfile);

                // Send Ice Breaker if Bio exists
                if (profile?.bio) {
                    setTimeout(async () => {
                        // Logic to find conversation and send message
                        try {
                            // We could optimize this by returning conversationId from swipes.create or fetching just this match
                            const { data: matchesData } = await matches.getAll(user.id);
                            if (matchesData) {
                                const matchRecord = matchesData.find((m: any) =>
                                    m.user1_id === targetProfile.id || m.user2_id === targetProfile.id
                                );

                                const conversation = Array.isArray(matchRecord?.conversation)
                                    ? matchRecord?.conversation[0]
                                    : matchRecord?.conversation;

                                if (conversation) {
                                    await messages.send(conversation.id, user.id, profile.bio, targetProfile.id);
                                    console.log('Quebra-gelo enviado com sucesso!');
                                }
                            }
                        } catch (err) {
                            console.error('Error sending icebreaker:', err);
                        }
                    }, 1000);
                }
            }

            return true; // Swipe successful
        } catch (err) {
            console.error('Erro na requisição de swipe:', err);
            return false;
        }
    }, [user, profile, isVip, swipeCount, incrementSwipeCount, onVipGate, onMatch]);

    return { handleSwipe };
};
