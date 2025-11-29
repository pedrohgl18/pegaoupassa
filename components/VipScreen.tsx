import React from 'react';
import { Crown, Rocket, ThumbsUp, Ban, Check } from 'lucide-react';
import Button from './Button';

interface VipScreenProps {
    price: string;
    onPurchase: () => void;
    onClose: () => void;
}

const VipScreen: React.FC<VipScreenProps> = ({ price, onPurchase, onClose }) => {
    return (
        <div className="flex flex-col h-full w-full bg-zinc-900 relative overflow-y-auto animate-slide-up">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brasil-blue/30 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brasil-green/20 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col items-center p-6 pt-12 flex-grow">

                {/* Header Icon */}
                <div className="mb-8 relative group">
                    <div className="absolute inset-0 bg-brasil-yellow blur-[60px] opacity-30 rounded-full group-hover:opacity-50 transition-opacity duration-700" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-brasil-yellow to-orange-400 rounded-3xl rotate-6 flex items-center justify-center shadow-2xl shadow-orange-500/20 border-4 border-white/10">
                        <Crown size={48} className="text-white drop-shadow-md -rotate-6" fill="white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white text-brasil-blue text-xs font-black px-3 py-1 rounded-full shadow-lg rotate-12">
                        PREMIUM
                    </div>
                </div>

                <h1 className="text-4xl font-black text-white mb-3 tracking-tight text-center">
                    Seja <span className="text-brasil-yellow">VIP</span>
                </h1>
                <p className="text-zinc-400 text-center mb-10 text-lg max-w-[280px] leading-relaxed">
                    Desbloqueie o poder máximo do Pega ou Passa.
                </p>

                {/* Benefits List */}
                <div className="w-full space-y-4 mb-8">
                    {[
                        {
                            icon: <Rocket className="text-white" size={24} />,
                            color: "bg-blue-500",
                            title: "Pegas Ilimitados",
                            desc: "Curta quantas pessoas quiser, sem limites."
                        },
                        {
                            icon: <ThumbsUp className="text-white" size={24} fill="white" />,
                            color: "bg-green-500",
                            title: "Veja quem te curtiu",
                            desc: "Descubra seus admiradores secretos."
                        },
                        {
                            icon: <Ban className="text-white" size={24} />,
                            color: "bg-red-500",
                            title: "Sem Anúncios",
                            desc: "Navegue sem interrupções chatas."
                        }
                    ].map((benefit, index) => (
                        <div key={index} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className={`w-12 h-12 rounded-2xl ${benefit.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                                {benefit.icon}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{benefit.title}</h3>
                                <p className="text-zinc-400 text-sm">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="mt-auto w-full space-y-4 pb-8">
                    <div className="relative overflow-hidden bg-gradient-to-r from-brasil-green to-emerald-600 p-1 rounded-2xl shadow-xl shadow-emerald-900/50">
                        <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-4 text-center">
                            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1 block">Oferta Especial</span>
                            <div className="text-3xl font-black text-white flex items-baseline justify-center gap-1">
                                {price} <span className="text-base font-medium text-zinc-400">/ mês</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        fullWidth
                        onClick={onPurchase}
                        className="!bg-brasil-yellow !text-brasil-blue !h-14 !text-lg !font-black hover:brightness-110 shadow-lg shadow-yellow-500/20"
                    >
                        ASSINAR AGORA
                    </Button>

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-zinc-500 font-bold hover:text-white transition-colors text-sm"
                    >
                        Continuar com plano grátis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VipScreen;
