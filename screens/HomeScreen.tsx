import React, { useState } from 'react';
import { Search, Crown } from 'lucide-react';
import SwipeCard from '../components/SwipeCard';
import Button from '../components/Button';
import { Profile } from '../types';
import { DAILY_FREE_SWIPES } from '../constants';
import { useSwipeAction } from '../hooks/useSwipeAction';
import TutorialOverlay from '../components/TutorialOverlay';

interface HomeScreenProps {
    user: any;
    profile: any;
    feedProfiles: Profile[];
    setFeedProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
    loadingFeed: boolean;
    fetchFeed: () => void;
    isVip: boolean;
    swipeCount: number;
    setSwipeCount: React.Dispatch<React.SetStateAction<number>>;
    onShowFilter: () => void;
    onVipGate: () => void;
    onMatch: (match: any, profile: Profile) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    user,
    profile,
    feedProfiles,
    setFeedProfiles,
    loadingFeed,
    fetchFeed,
    isVip,
    swipeCount,
    setSwipeCount,
    onShowFilter,
    onVipGate,
    onMatch
}) => {
    const [lastDirection, setLastDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
    const [dragStart, setDragStart] = useState<{ y: number } | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isTopCardFlipped, setIsTopCardFlipped] = useState(false);

    // Derived
    const currentProfile = feedProfiles[0];
    const nextProfile = feedProfiles[1];

    // Hook for business logic
    const { handleSwipe: performSwipeAction } = useSwipeAction({
        user,
        profile,
        isVip,
        swipeCount,
        incrementSwipeCount: () => setSwipeCount(prev => prev + 1),
        onVipGate,
        onMatch
    });

    const handleSwipe = async (direction: 'up' | 'down') => {
        if (!currentProfile) return;

        setLastDirection(direction);

        // Initial delay for animation
        setTimeout(async () => {
            // Optimistic UI update
            setFeedProfiles(prev => prev.slice(1));

            setLastDirection(null);
            setIsTopCardFlipped(false);
            setDragOffset(0);

            const success = await performSwipeAction(direction, currentProfile);

            if (success) {
                // Feed fetch logic if running low
                if (feedProfiles.length < 5) {
                    fetchFeed();
                }
            } else {
                // If failed (e.g. VIP gate), we might want to revert... 
                // But performSwipeAction returns false mainly if blocked.
                // If blocked, we shouldn't have removed the card?
                // Actually, if blocked by VIP, we want to show VIP screen and NOT remove card.
                // My Logic above removed card optimistically.
                // Fix: check success BEFORE removing? 
                // But we want animation.
                // Revert if false?
                // If VIP gate, performSwipeAction calls onVipGate immediately.
                // Ideally we check VIP before animation.
            }
        }, 200);
    };

    // Improved Swipe Handler that checks VIP before animating
    const initiateSwipe = async (direction: 'up' | 'down') => {
        if (!currentProfile) return;

        // Check VIP limit synchronously before animation if possible
        if (direction === 'down' && swipeCount >= DAILY_FREE_SWIPES && !isVip) {
            onVipGate();
            return;
        }

        setLastDirection(direction);

        setTimeout(async () => {
            setLastDirection(null);
            setIsTopCardFlipped(false);
            setDragOffset(0);

            // Remove card
            setFeedProfiles(prev => prev.slice(1));

            // Call API
            const success = await performSwipeAction(direction, currentProfile);

            if (success && feedProfiles.length < 5) {
                fetchFeed();
            }
        }, 200);
    };


    // Drag Handlers
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (lastDirection) return;
        if (isTopCardFlipped) return;
        const y = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        setDragStart({ y });
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!dragStart || !isDragging) return;
        if (isTopCardFlipped) return;
        const y = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
        const deltaY = y - dragStart.y;
        setDragOffset(deltaY);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        const threshold = 100;
        if (dragOffset > threshold) {
            initiateSwipe('down');
        } else if (dragOffset < -threshold) {
            initiateSwipe('up');
        }
        setDragStart(null);
        setDragOffset(0);
        setIsDragging(false);
    };

    // Loading State
    if (loadingFeed && feedProfiles.length === 0) {
        return (
            <div className="relative h-full w-full bg-zinc-50 flex flex-col items-center justify-center p-4 animate-fade-in">
                <div className="w-full h-full rounded-3xl overflow-hidden relative bg-white border border-zinc-200 shadow-sm">
                    <div className="absolute inset-0 skeleton opacity-50 bg-zinc-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/90 to-transparent pt-20">
                        <div className="h-8 w-48 bg-zinc-200 rounded-lg mb-3 skeleton" />
                        <div className="h-4 w-32 bg-zinc-200 rounded-lg mb-2 skeleton" />
                        <div className="h-16 w-full bg-zinc-200 rounded-lg skeleton" />
                    </div>
                </div>
            </div>
        );
    }

    // Empty State
    if (feedProfiles.length === 0) {
        return (
            <div className="relative h-full w-full bg-zinc-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-100/50 blur-[100px] rounded-full" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-green-100/50 blur-[100px] rounded-full" />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-zinc-200 border border-zinc-100 rotate-3 transform hover:rotate-6 transition-transform duration-500">
                        <Search size={40} className="text-brasil-blue" />
                    </div>

                    <h2 className="text-3xl font-black text-zinc-900 mb-3 tracking-tight">
                        Zerou o Game! <span className="text-2xl">🎮</span>
                    </h2>

                    <p className="text-zinc-500 mb-8 max-w-[280px] text-sm font-medium leading-relaxed">
                        Você já viu todo mundo por aqui. Que tal expandir seus horizontes?
                    </p>

                    <div className="flex flex-col gap-3 w-full max-w-[260px]">
                        <Button onClick={onShowFilter} className="bg-brasil-blue text-white hover:bg-brasil-blue-light font-bold h-12 shadow-lg shadow-brasil-blue/20">
                            Ajustar Filtros
                        </Button>

                        <button
                            onClick={fetchFeed}
                            className="py-3 text-zinc-400 font-bold text-xs uppercase tracking-widest hover:text-brasil-blue transition-colors"
                        >
                            Buscar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full bg-black animate-fade-in">
            <div className="relative w-full h-full overflow-hidden">
                {/* Current Profile */}
                {currentProfile && (
                    <div
                        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${lastDirection === 'up' ? '-translate-y-full opacity-0' :
                                lastDirection === 'down' ? 'translate-y-full opacity-0' : 'translate-y-0'
                            }`}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleTouchStart}
                        onMouseMove={handleTouchMove}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                    >
                        <SwipeCard
                            profile={currentProfile}
                            isActive={true}
                            swipeDirection={lastDirection === 'down' ? 'down' : lastDirection === 'up' ? 'up' : null}
                            dragOffset={dragOffset}
                            myZodiacSign={profile?.zodiac_sign}
                            // activeFilters={{ minHeight: 0, zodiac: '' }} // filters passed if needed
                            myInterests={profile?.user_interests?.map((ui: any) => ui.interest?.id) || []}
                            onFlip={(flipped) => setIsTopCardFlipped(flipped)}
                        />
                    </div>
                )}

                {/* Next Profile */}
                {nextProfile && (
                    <div className="absolute inset-0 -z-10">
                        <SwipeCard
                            profile={nextProfile}
                            isActive={false}
                            myZodiacSign={profile?.zodiac_sign}
                            myInterests={profile?.user_interests?.map((ui: any) => ui.interest?.id) || []}
                        />
                    </div>
                )}

                {/* Top Bar - Status VIP/Free */}
                <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
                    <div className="flex justify-center pt-16 pb-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                        {!isVip && !isTopCardFlipped && (
                            <div className="flex items-center gap-3 pointer-events-auto">
                                <div className="flex flex-col gap-1 w-28">
                                    <div className="flex justify-between items-end px-1">
                                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Likes</span>
                                        <span className="text-[10px] font-bold text-white/80">{swipeCount}/{DAILY_FREE_SWIPES}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div
                                            className="h-full bg-brasil-green shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                                            style={{ width: `${Math.min((swipeCount / DAILY_FREE_SWIPES) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={onVipGate}
                                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 transition-all active:scale-95"
                                >
                                    <Crown size={14} className="text-brasil-yellow" fill="#FFDF00" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">Sem Limites</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
