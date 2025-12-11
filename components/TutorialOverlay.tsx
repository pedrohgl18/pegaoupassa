import React from 'react';
import { Heart, X, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

interface TutorialOverlayProps {
    onDismiss: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onDismiss }) => {
    return (
        <div
            className="fixed inset-0 z-[60] bg-gradient-to-b from-violet-900/95 to-black/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-500"
            onClick={onDismiss}
        >
            {/* Header */}
            <div className="absolute top-12 flex items-center gap-2 text-violet-300">
                <Sparkles size={20} />
                <span className="text-sm font-medium tracking-wide">Dica rápida</span>
            </div>

            {/* Card Preview Visual */}
            <div className="relative w-64 aspect-[3/4] rounded-3xl bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center mb-10 shadow-2xl shadow-violet-500/20 border border-white/10">

                {/* Fake Profile Image Placeholder */}
                <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-violet-600/30 to-pink-600/30 flex items-center justify-center">
                    <Heart size={48} className="text-white/20" />
                </div>

                {/* Swipe Down - PEGA */}
                <div className="absolute -right-16 top-1/4 flex items-center gap-2 animate-bounce">
                    <div className="flex flex-col items-center">
                        <ChevronDown size={32} className="text-emerald-400" />
                        <div className="flex items-center gap-1 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/50">
                            <Heart size={14} className="text-emerald-400 fill-emerald-400" />
                            <span className="text-emerald-400 font-bold text-sm">PEGA</span>
                        </div>
                    </div>
                </div>

                {/* Swipe Up - PASSA */}
                <div className="absolute -right-16 bottom-1/4 flex items-center gap-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 bg-red-500/20 px-3 py-1 rounded-full border border-red-400/50">
                            <X size={14} className="text-red-400" />
                            <span className="text-red-400 font-bold text-sm">PASSA</span>
                        </div>
                        <ChevronUp size={32} className="text-red-400" />
                    </div>
                </div>

                {/* Tap Hint */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-xs text-white/50 font-medium">toque p/ ver mais</span>
                </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-4 max-w-sm">
                <h2 className="text-3xl font-black bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
                    Bem-vindo ao Pega ou Passa
                </h2>

                <div className="space-y-2 text-lg">
                    <p className="text-zinc-300">
                        Arraste <span className="text-emerald-400 font-bold">↓ para baixo</span> para curtir
                    </p>
                    <p className="text-zinc-300">
                        Arraste <span className="text-red-400 font-bold">↑ para cima</span> para passar
                    </p>
                </div>

                <p className="text-sm text-zinc-500 mt-4">
                    Se os dois curtirem, é Match! 💜
                </p>
            </div>

            {/* CTA Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                }}
                className="mt-10 px-10 py-4 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
            >
                Começar a explorar
            </button>

            {/* Skip hint */}
            <p className="absolute bottom-8 text-xs text-zinc-600">
                Toque em qualquer lugar para fechar
            </p>
        </div>
    );
};

export default TutorialOverlay;
