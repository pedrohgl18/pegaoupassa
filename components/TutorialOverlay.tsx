import React from 'react';
import { Hand, ChevronUp, ChevronDown, Repeat, X } from 'lucide-react';

interface TutorialOverlayProps {
    onDismiss: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onDismiss }) => {
    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-300" onClick={onDismiss}>

            {/* Cards Stack Visual */}
            <div className="relative w-full max-w-xs aspect-[3/4] border-2 border-white/20 rounded-3xl flex items-center justify-center mb-12 bg-white/5">

                {/* Swipe Instructions */}
                <div className="absolute -right-4 top-1/4 flex flex-col items-center animate-bounce">
                    <span className="text-2xl font-bold text-green-400 mb-2">PEGA</span>
                    <ChevronDown size={40} className="text-green-400" />
                </div>

                <div className="absolute -right-4 bottom-1/4 flex flex-col items-center animate-bounce-reverse">
                    <ChevronUp size={40} className="text-red-400" />
                    <span className="text-2xl font-bold text-red-400 mt-2">PASSA</span>
                </div>

                {/* Hand Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Hand size={64} className="text-white animate-pulse" />
                </div>

                {/* Flip Instruction */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="flex items-center justify-center gap-2 text-zinc-300">
                        <Repeat size={20} />
                        <span className="text-sm font-bold">Toque para Virar</span>
                    </div>
                </div>
            </div>

            <div className="text-center space-y-4 max-w-sm">
                <h2 className="text-3xl font-black text-white">Como jogar?</h2>
                <p className="text-lg text-zinc-300">
                    Arraste para <b className="text-green-400">BAIXO</b> para curtir.<br />
                    Arraste para <b className="text-red-400">CIMA</b> para passar.
                </p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDismiss();
                    }}
                    className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform"
                >
                    Entendi!
                </button>
            </div>
        </div>
    );
};

export default TutorialOverlay;
