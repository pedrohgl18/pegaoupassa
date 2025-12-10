import React from 'react';
import { Crown, Check, X, Star, Zap, Heart } from 'lucide-react';
import Button from './Button';

interface VipScreenProps {
    price: string;
    onPurchase: () => void;
    onClose: () => void;
}

const VipScreen: React.FC<VipScreenProps> = ({ price, onPurchase, onClose }) => {
    const features = [
        { label: "Likes Infinitos", free: false, vip: true, icon: "🔥" },
        { label: "Modo Agora Ilimitado", free: false, vip: true, icon: "✨" },
        { label: "Ver quem te curtiu", free: false, vip: true, icon: "👀" },
        { label: "Enviar Fotos & Áudio", free: false, vip: true, icon: "📸" },
        { label: "Filtros Avançados", free: false, vip: true, icon: "🎯" },
        { label: "Modo Incógnito", free: false, vip: true, icon: "🕵️" },
        { label: "Confirmação de Leitura", free: false, vip: true, icon: "✅" },
        { label: "Estatísticas de Perfil", free: false, vip: true, icon: "📊" },
        { label: "Sem Anúncios", free: false, vip: true, icon: "🚫" },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-zinc-50 relative overflow-y-auto animate-in slide-in-from-bottom duration-500">
            {/* Header Background */}
            <div className="absolute top-0 left-0 right-0 h-[340px] bg-violet-900 overflow-hidden rounded-b-[40px] shadow-xl z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 opacity-90" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-500 rounded-full blur-[80px] opacity-30 animate-pulse" />
                <div className="absolute top-20 -left-20 w-48 h-48 bg-violet-500 rounded-full blur-[60px] opacity-30" />
            </div>

            <div className="relative z-10 flex flex-col items-center px-6 pt-8 pb-6 flex-grow">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-12 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full backdrop-blur-md transition-colors z-50"
                >
                    <X size={20} />
                </button>

                {/* VIP Badge */}
                <div className="mb-2 relative scale-90">
                    <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-50 rounded-full animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-3xl rotate-3 flex items-center justify-center shadow-2xl border-4 border-white/20">
                        <Crown size={48} className="text-white drop-shadow-md -rotate-3" fill="white" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-zinc-100">
                        <span className="text-xs font-black text-violet-800 uppercase tracking-widest whitespace-nowrap">
                            Nível Lendário
                        </span>
                    </div>
                </div>

                <h1 className="text-3xl font-black text-white mb-1 text-center drop-shadow-md mt-2">
                    Seja <span className="text-amber-300">VIP</span>
                </h1>
                <p className="text-indigo-100 text-center mb-4 text-sm font-medium max-w-[280px] leading-relaxed">
                    Desbloqueie superpoderes e pare de depender da sorte. O jogo vira quando você é VIP.
                </p>

                {/* Comparison Card */}
                <div className="w-full bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden mb-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 bg-zinc-50 border-b border-zinc-100 p-3">
                        <div className="col-span-1 flex items-center">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Benefícios</span>
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Free</span>
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <span className="text-[10px] font-black text-violet-600 uppercase tracking-wider bg-violet-50 px-2 py-0.5 rounded-full">VIP</span>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-zinc-50">
                        {features.map((feature, idx) => (
                            <div key={idx} className="grid grid-cols-3 p-3 items-center hover:bg-zinc-50 transition-colors">
                                <div className="col-span-1 flex flex-col">
                                    <span className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                                        {feature.label}
                                    </span>
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    {feature.free ? (
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                            <Check size={12} className="text-green-600" strokeWidth={3} />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center">
                                            <X size={12} className="text-zinc-300" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    {feature.vip ? (
                                        <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-200">
                                            <Check size={12} className="text-white" strokeWidth={4} />
                                        </div>
                                    ) : (
                                        <X size={14} className="text-zinc-300" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto w-full space-y-3 pb-8">
                    <div className="text-center">
                        <span className="text-zinc-400 text-xs font-medium line-through">R$ 29,90</span>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-black text-violet-900">{price}</span>
                            <span className="text-sm font-bold text-zinc-500">/ mês</span>
                        </div>
                        <span className="text-green-600 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
                            Economize 70% hoje
                        </span>
                    </div>

                    <Button
                        fullWidth
                        onClick={onPurchase}
                        className="!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 !text-white !h-12 !text-lg !font-black hover:!brightness-110 shadow-xl shadow-violet-500/20 uppercase tracking-wide rounded-2xl"
                    >
                        <div className="flex items-center gap-2">
                            <Zap size={18} fill="white" />
                            Quero Ser VIP
                        </div>
                    </Button>

                    <button
                        onClick={onClose}
                        className="w-full py-2 text-zinc-400 font-bold hover:text-zinc-600 transition-colors text-xs uppercase tracking-wider mb-4"
                    >
                        Não, prefiro ficar limitado
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VipScreen;
