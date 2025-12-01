import React from 'react';
import { ThumbsUp, Heart } from 'lucide-react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brasil-blue overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-brasil-blue via-brasil-green/20 to-brasil-yellow/10 animate-gradient-xy" />

            {/* Animated Orbs */}
            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-brasil-yellow/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-brasil-green/20 rounded-full blur-[120px] animate-pulse delay-1000" />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Container */}
                <div className="relative mb-8 group">
                    {/* Outer Glow */}
                    <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl transform rotate-6 animate-pulse" />

                    {/* Icon Box */}
                    <div className="w-32 h-32 bg-gradient-to-tr from-brasil-yellow to-brasil-green rounded-[2rem] flex items-center justify-center shadow-2xl rotate-6 border-[6px] border-white/20 backdrop-blur-sm relative z-10 animate-float">
                        <ThumbsUp
                            size={64}
                            className="text-white drop-shadow-lg transform -rotate-6"
                            fill="white"
                            strokeWidth={2.5}
                        />
                    </div>

                    {/* Floating Heart Badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-brasil-blue rounded-full border-4 border-white/30 flex items-center justify-center z-20 shadow-lg animate-bounce">
                        <Heart size={20} className="text-white" fill="white" />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-2 animate-fade-in">
                    <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-xl">
                        Pega ou <span className="text-brasil-yellow">Passa</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-0" />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150" />
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-300" />
                    </div>
                </div>
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-10 text-white/40 text-xs font-medium tracking-widest uppercase">
                Carregando Experiência
            </div>
        </div>
    );
};

export default LoadingScreen;
