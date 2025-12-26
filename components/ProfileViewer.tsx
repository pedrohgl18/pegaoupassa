import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import SwipeCard from './SwipeCard';
import { useSwipeAction } from '../hooks/useSwipeAction';
import { Profile } from '../types';

interface ProfileViewerProps {
    user: any;
    profile: any;
    viewingProfile: Profile;
    onClose: () => void;
    isVip: boolean;
    swipeCount: number;
    incrementSwipeCount: () => void;
    onVipGate: () => void;
    onMatch: (match: any, profile: Profile) => void;
    onActionComplete: () => void; // Called after like/pass to refresh data
}

export const ProfileViewer: React.FC<ProfileViewerProps> = ({
    user,
    profile,
    viewingProfile,
    onClose,
    isVip,
    swipeCount,
    incrementSwipeCount,
    onVipGate,
    onMatch,
    onActionComplete
}) => {
    const [lastDirection, setLastDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
    const [dragStart, setDragStart] = useState<{ y: number } | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const { handleSwipe: performSwipeAction } = useSwipeAction({
        user,
        profile,
        isVip,
        swipeCount,
        incrementSwipeCount,
        onVipGate,
        onMatch
    });

    const triggerAction = async (direction: 'up' | 'down') => {
        // Prevent swiping on self (View Public Profile mode)
        if (viewingProfile.id === user?.id) {
            return;
        }

        // 1. Close viewer immediately for responsiveness
        onClose();

        // 2. Perform API call in background (closure ensures variables are valid)
        // Note: If component unmounts, we can't update local state, but we can call callbacks.
        try {
            await performSwipeAction(direction, viewingProfile);
            onActionComplete();
        } catch (e) {
            // Silent fail
        }
    };

    // Simplified Drag Handlers specific to this overlay
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (lastDirection) return;
        const y = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragStart({ y });
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!dragStart || !isDragging) return;
        const y = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        const deltaY = y - dragStart.y;
        setDragOffset(deltaY);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        const threshold = 100;
        if (dragOffset > threshold) {
            // Down = Like
            triggerAction('down');
        } else if (dragOffset < -threshold) {
            // Up = Pass
            triggerAction('up');
        }
        setDragStart(null);
        setDragOffset(0);
        setIsDragging(false);
    };


    return (
        <div
            className="absolute inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-bottom duration-300"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
        >
            {/* Header with Back button */}
            <div className="absolute top-12 left-4 z-50 pointer-events-auto">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            <div className="flex-1 relative">
                <SwipeCard
                    profile={viewingProfile}
                    isActive={true}
                    swipeDirection={lastDirection === 'down' ? 'down' : lastDirection === 'up' ? 'up' : null}
                    dragOffset={dragOffset}
                    myZodiacSign={profile?.zodiac_sign}
                    myInterests={profile?.user_interests?.map((ui: any) => ui.interest?.id) || []}
                    hasActions={true} // In viewer we can show actions if we want, but UI design says Swipe Only, keeping true to render card properly
                />
            </div>
        </div>
    );
};
