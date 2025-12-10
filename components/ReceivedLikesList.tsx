import React, { useEffect, useState } from 'react';
import { Heart, X, Loader2, MapPin, Ruler, Briefcase, GraduationCap, ChevronLeft, Ghost } from 'lucide-react';
import { swipes, matches } from '../lib/supabase';
import Button from './Button';
import { calculateAge } from '../App';

interface ReceivedLikesListProps {
    userId: string;
    onBack: () => void;
    onMatch: () => void; // Callback to refresh matches
}

const ReceivedLikesList: React.FC<ReceivedLikesListProps> = ({ userId, onBack, onMatch }) => {
    const [likes, setLikes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchLikes();
    }, [userId]);

    const fetchLikes = async () => {
        setLoading(true);
        const { data, error } = await swipes.getReceivedLikes(userId);
        if (data) {
            setLikes(data);
        } else if (error) {
            console.error('Error fetching likes:', error);
        }
        setLoading(false);
    };

    const handleAction = async (swiperId: string, action: 'like' | 'pass') => {
        setProcessingId(swiperId);
        try {
            // Create the swipe (match or pass)
            const { match, error } = await swipes.create(userId, swiperId, action);

            if (error) {
                console.error('Error processing swipe:', error);
                alert('Erro ao processar ação. Tente novamente.');
                return;
            }

            // Remove from list
            setLikes(prev => prev.filter(l => l.swiper_id !== swiperId));

            // Use the onMatch callback if it was a match to trigger any parent updates (like confetti or modal)
            // For now, we just refresh logic if needed, but the list update is local.
            if (match) {
                onMatch();
                // Optionally show a mini success message or toast here
            }

        } catch (err) {
            console.error('Exception in handleAction:', err);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-zinc-50">
                <Loader2 className="animate-spin text-violet-600 mb-4" size={40} />
                <p className="text-zinc-500 font-medium">Buscando admiradores...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50">
            {/* Header */}
            <div className="pt-12 pb-4 px-6 bg-white shadow-sm flex items-center gap-4 z-10">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-zinc-900">Quem te Curtiu</h1>
                    <p className="text-xs text-zinc-500 font-medium">{likes.length} pessoas interessadas</p>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {likes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-3/4 text-center px-8 opacity-60">
                        <Ghost size={64} className="text-zinc-300 mb-4" />
                        <h3 className="text-xl font-bold text-zinc-800 mb-2">Tudo calmo por aqui</h3>
                        <p className="text-zinc-500">Ninguém novo curtiu seu perfil ainda. Continue usando o app para aparecer para mais pessoas!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {likes.map((like) => {
                            const profile = like.profile;
                            if (!profile) return null;

                            const age = profile.birth_date ? calculateAge(profile.birth_date) : 25;
                            const photoUrl = profile.photos?.[0]?.url || 'https://picsum.photos/400/600';

                            return (
                                <div key={like.id} className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col">
                                    <div className="relative aspect-[3/4] bg-zinc-200">
                                        <img src={photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                                            <h3 className="text-white font-bold text-xl flex items-end gap-2">
                                                {profile.name}, <span className="text-lg font-normal opacity-90">{age}</span>
                                            </h3>
                                            {profile.city && (
                                                <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
                                                    <MapPin size={12} />
                                                    {profile.city}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3 grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleAction(like.swiper_id, 'pass')}
                                            disabled={!!processingId}
                                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 text-zinc-600 font-bold hover:bg-zinc-200 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(like.swiper_id, 'like')}
                                            disabled={!!processingId}
                                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow-lg shadow-violet-200 active:scale-95 transition-all"
                                        >
                                            {processingId === like.swiper_id ? <Loader2 size={20} className="animate-spin" /> : <Heart size={20} fill="white" />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceivedLikesList;
