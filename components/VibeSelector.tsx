import React, { useState } from 'react';
import { X, Clock, Zap, Coffee, Gamepad2, Phone, Beer, Flame, Music, Moon } from 'lucide-react';

interface VibeOption {
    id: string;
    label: string;
    emoji: string;
    color: string;
    icon: React.ElementType;
}

const VIBES: VibeOption[] = [
    { id: 'drink', label: 'Barzinho', emoji: '🍻', color: 'from-amber-500 to-orange-600', icon: Beer },
    { id: 'coffee', label: 'Café', emoji: '☕', color: 'from-amber-700 to-brown-900', icon: Coffee }, // brown doesn't exist in tailwind default, using amber-900 logic or stone
    { id: 'party', label: 'Rolê', emoji: '🎉', color: 'from-purple-500 to-pink-600', icon: Music },
    { id: 'game', label: 'Jogar', emoji: '🎮', color: 'from-indigo-500 to-blue-600', icon: Gamepad2 },
    { id: 'call', label: 'Resenha', emoji: '💬', color: 'from-green-500 to-emerald-600', icon: Phone },
    { id: 'date', label: 'Encontro', emoji: '🥂', color: 'from-red-500 to-rose-600', icon: Flame },
];

interface VibeSelectorProps {
    currentVibe?: string;
    onSelectVibe: (vibeId: string) => void;
    onClose: () => void;
    isOpen: boolean;
    isVip?: boolean;
    lastActivation?: string; // ISO Date string
}

const VibeSelector: React.FC<VibeSelectorProps> = ({ currentVibe, onSelectVibe, onClose, isOpen, isVip = false, lastActivation }) => {
    if (!isOpen) return null;

    const canActivate = () => {
        if (isVip) return true;
        if (!lastActivation) return true;

        const last = new Date(lastActivation);
        const now = new Date();
        const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

        return diffHours >= 24;
    };

    const isLocked = !canActivate();

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom duration-300 relative z-10 pb-[calc(24px+env(safe-area-inset-bottom,20px))]">

                {/* Handle for mobile */}
                <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                            Modo Agora <span className="animate-pulse text-violet-600">🟣</span>
                        </h2>
                        <p className="text-sm text-zinc-500">O que você quer fazer <span className="text-violet-600 font-bold">agora</span>?</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 border border-zinc-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Unlock Message */}
                {isLocked && !currentVibe && (
                    <div className="mb-4 bg-zinc-100 p-3 rounded-xl border border-zinc-200 flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center">
                            <Clock size={16} className="text-zinc-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-zinc-700">Modo Agora em recarga</p>
                            <p className="text-[10px] text-zinc-500">Disponível novamente em 24h ou com VIP</p>
                        </div>
                        <button className="text-xs font-bold text-violet-600 uppercase tracking-wider bg-violet-100 px-3 py-1.5 rounded-full">
                            Virar VIP
                        </button>
                    </div>
                )}

                <div className={`grid grid-cols-2 gap-3 transition-opacity duration-300 ${isLocked && !currentVibe ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    {VIBES.map((vibe) => (
                        <button
                            key={vibe.id}
                            onClick={() => onSelectVibe(vibe.id)}
                            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 relative overflow-hidden group ${currentVibe === vibe.id
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-zinc-100 bg-zinc-50 hover:bg-zinc-100'
                                }`}
                        >
                            {/* Background gradient on hover/active */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${vibe.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${vibe.color} shadow-md`}>
                                <vibe.icon size={20} className="text-white" />
                            </div>

                            <div className="text-left">
                                <span className={`block font-bold text-sm ${currentVibe === vibe.id ? 'text-violet-900' : 'text-zinc-700'}`}>{vibe.label}</span>
                                <span className="text-xs text-zinc-400">Dura 1h</span>
                            </div>

                            {currentVibe === vibe.id && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-600 shadow-sm" />
                            )}
                        </button>
                    ))}
                </div>

                <p className="text-center text-xs text-zinc-400 mt-6 flex items-center justify-center gap-1.5">
                    <Clock size={12} />
                    Seu status some automaticamente
                </p>

            </div>
        </div>
    );
};

export default VibeSelector;
export { VIBES }; // Export to use in SwipeCard
