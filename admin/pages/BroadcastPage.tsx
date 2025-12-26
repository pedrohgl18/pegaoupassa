import React, { useState } from 'react';
import { Send, Users, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

interface BroadcastPageProps {
    onSendBroadcast: (title: string, body: string) => Promise<{ success: boolean; count: number }>;
}

const BroadcastPage: React.FC<BroadcastPageProps> = ({ onSendBroadcast }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; count: number } | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body) return;

        if (!confirm(`Confirmar envio para TODOS os usuários?`)) return;

        setLoading(true);
        const res = await onSendBroadcast(title, body);
        setResult(res);
        setLoading(false);

        if (res.success) {
            setTitle('');
            setBody('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-[32px] p-10 border border-zinc-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Send size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <Send size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900">Push Broadcast</h2>
                            <p className="text-zinc-500 font-medium">Envie notificações em massa para todos os dispositivos Android registrados.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSend} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Título da Notificação</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Grande novidade chegando! 🚀"
                                className="w-full bg-zinc-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold text-zinc-900"
                                maxLength={50}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Mensagem (Corpo)</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Descreva o que os usuários devem saber..."
                                className="w-full bg-zinc-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white p-4 rounded-3xl outline-none transition-all font-bold text-zinc-900 min-h-[150px] resize-none"
                                maxLength={200}
                                required
                            />
                            <div className="flex justify-end pr-2">
                                <span className={`text-[10px] font-black ${body.length > 180 ? 'text-red-500' : 'text-zinc-300'}`}>
                                    {body.length}/200
                                </span>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[24px] flex gap-4">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-amber-900 text-sm uppercase">Cuidado com Spam</h4>
                                <p className="text-amber-800/80 text-xs font-medium mt-1">
                                    Notificações push excessivas podem levar os usuários a desinstalar o app ou desativar permissões. Use com sabedoria.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !title || !body}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-200 text-white rounded-[24px] font-black text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Enviando para o servidor...
                                </>
                            ) : (
                                <>
                                    Disparar Notificação <Send size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Resultado do Envio */}
            {result && (
                <div className={`p-8 rounded-[32px] border flex items-center gap-6 animate-in slide-in-from-bottom duration-500 ${result.success ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-red-50 border-red-100 text-red-900'
                    }`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${result.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {result.success ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-black">
                            {result.success ? 'Envio Concluído!' : 'Erro no Envio'}
                        </h3>
                        <p className="font-bold opacity-80">
                            {result.success
                                ? `A notificação foi processada com sucesso para ${result.count} dispositivos registrados.`
                                : 'Ocorreu um problema técnico ao tentar disparar o broadcast.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Preview Section */}
            <div className="bg-zinc-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                    <Smartphone size={18} className="text-white/40" />
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/40">iPhone/Android Preview</h3>
                </div>

                <div className="max-w-[300px] mx-auto bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] font-black">P</span>
                        </div>
                        <span className="text-[10px] font-black uppercase text-white/60">Pega ou Passa</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-black truncate">{title || 'Título da Notificação'}</p>
                        <p className="text-[10px] text-white/50 leading-relaxed font-bold">
                            {body || 'O conteúdo da sua mensagem aparecerá aqui para o usuário...'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastPage;
