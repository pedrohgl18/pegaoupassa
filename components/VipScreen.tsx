import React from 'react';
import { Crown, Rocket, ThumbsUp, SlidersHorizontal, Image, Mic } from 'lucide-react';
import Button from './Button';

interface VipScreenProps {
    price: string;
    onPurchase: () => void;
    onClose: () => void;
}

const VipScreen: React.FC<VipScreenProps> = ({ price, onPurchase, onClose }) => {
    return (
        <div className="flex flex-col h-full w-full bg-zinc-950 relative overflow-y-auto animate-slide-up">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-brasil-blue/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-brasil-green/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col items-center p-6 pt-10 flex-grow">

                {/* Header Icon */}
                <div className="mb-6 relative group">
                    <div className="absolute inset-0 bg-brasil-yellow blur-[50px] opacity-20 rounded-full group-hover:opacity-40 transition-opacity duration-700" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-brasil-yellow to-orange-500 rounded-2xl rotate-3 flex items-center justify-center shadow-2xl shadow-orange-500/20 border-2 border-white/10">
                        <Crown size={40} className="text-white drop-shadow-md -rotate-3" fill="white" />
                    </div>
                    <div className="absolute -top-3 -right-3 bg-white text-brasil-blue text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg rotate-6 border border-zinc-100">
                        ELITE
                    </div>
                </div>

                <h1 className="text-3xl font-black text-white mb-2 tracking-tighter text-center">
                    Vire o <span className="text-brasil-yellow">Dono do Jogo</span>
                </h1>
                <p className="text-zinc-400 text-center mb-8 text-sm font-medium max-w-[260px] leading-relaxed">
                    Chega de limitações. Desbloqueie o poder total e conquiste quem você quiser.
                </p>

                {/* Benefits List */}
                <div className="w-full space-y-3 mb-8">
                    {[
                        {
                            icon: <Rocket className="text-white" size={20} />,
                            color: "bg-blue-600",
                            title: "Pegas Infinitos",
                            desc: "Curta sem dó! O dedo não cai e o limite não existe."
                        },
                        {
                            icon: <ThumbsUp className="text-white" size={20} fill="white" />,
                            color: "bg-green-600",
                            title: "Quem te Curtiu?",
                            desc: "Pare de adivinhar. Veja a lista completa de quem te quer."
                        },
                        {
                            icon: <Image className="text-white" size={20} />,
                            color: "bg-purple-600",
                            title: "Mande Fotos & Áudios",
                            desc: "Solte o verbo e mostre mais de você no chat."
                        },
                        {
                            icon: <SlidersHorizontal className="text-white" size={20} />,
                            color: "bg-pink-600",
                            title: "Filtros de Elite",
                            desc: "Filtre por altura, signo e muito mais. Ache o par exato."
                        }
                    ].map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className={`w-10 h-10 rounded-lg ${benefit.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                                {benefit.icon}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">{benefit.title}</h3>
                                <p className="text-zinc-500 text-xs font-medium leading-tight">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="mt-auto w-full space-y-3 pb-6">
                    <div className="relative overflow-hidden bg-gradient-to-r from-brasil-green to-emerald-600 p-[1px] rounded-xl shadow-lg shadow-emerald-900/40">
                        <div className="bg-zinc-900/95 backdrop-blur-sm rounded-[11px] p-3 text-center">
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-0.5 block">Oferta Exclusiva</span>
                            <div className="text-2xl font-black text-white flex items-baseline justify-center gap-1">
                                {price} <span className="text-xs font-bold text-zinc-500">/ mês</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        fullWidth
                        onClick={onPurchase}
                        className="!bg-brasil-yellow !text-brasil-blue !h-12 !text-base !font-black hover:brightness-110 shadow-lg shadow-yellow-500/10 uppercase tracking-wide"
                    >
                        Quero ser VIP Agora
                    </Button>

                    <button
                        onClick={onClose}
                        className="w-full py-2 text-zinc-600 font-bold hover:text-zinc-400 transition-colors text-xs uppercase tracking-wider"
                    >
                        Continuar no básico
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VipScreen;
