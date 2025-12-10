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
    { id: 'call', label: 'Call', emoji: '💬', color: 'from-green-500 to-emerald-600', icon: Phone },
    { id: 'date', label: 'Encontro', emoji: '🌹', color: 'from-red-500 to-rose-600', icon: Flame },
];

interface VibeSelectorProps {
    currentVibe?: string;
    onSelectVibe: (vibeId: string) => void;
    onClose: () => void;
    isOpen: boolean;
}

const VibeSelector: React.FC<VibeSelectorProps> = ({ currentVibe, onSelectVibe, onClose, isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-[#1E293B] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-white/10 relative z-10">

                {/* Handle for mobile */}
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            Modo Agora <span className="animate-pulse">🔴</span>
                        </h2>
                        <p className="text-sm text-gray-400">O que você quer fazer <span className="text-accent font-bold">agora</span>?</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {VIBES.map((vibe) => (
                        <button
                            key={vibe.id}
                            onClick={() => onSelectVibe(vibe.id)}
                            className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 relative overflow-hidden group ${currentVibe === vibe.id
                                    ? 'border-accent bg-accent/10'
                                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            {/* Background gradient on hover/active */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${vibe.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${vibe.color} shadow-lg`}>
                                <vibe.icon size={20} className="text-white" />
                            </div>

                            <div className="text-left">
                                <span className="block font-bold text-white text-sm">{vibe.label}</span>
                                <span className="text-xs text-gray-400">Dura 1h</span>
                            </div>

                            {currentVibe === vibe.id && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_#FFD600]" />
                            )}
                        </button>
                    ))}
                </div>

                <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-1.5">
                    <Clock size={12} />
                    Seu status somem automaticamente
                </p>

            </div>
        </div>
    );
};

export default VibeSelector;
export { VIBES }; // Export to use in SwipeCard
