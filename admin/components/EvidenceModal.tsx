import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Clock, ImageIcon, Mic } from 'lucide-react';
import { AdminMessage } from '../types';

interface EvidenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    reporterName: string;
    reportedName: string;
    messages: AdminMessage[];
    loading: boolean;
}

const EvidenceModal: React.FC<EvidenceModalProps> = ({
    isOpen,
    onClose,
    reporterName,
    reportedName,
    messages,
    loading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-zinc-900 leading-none">Contexto do Chat</h2>
                            <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-wider">
                                {reporterName} vs {reportedName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-zinc-50/30">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                            <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                            <p className="font-bold text-sm">Buscando evidências...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                            <div className="bg-zinc-100 p-4 rounded-full">
                                <MessageSquare size={32} />
                            </div>
                            <div className="text-center">
                                <p className="font-extrabold text-zinc-900">Nenhuma conversa encontrada</p>
                                <p className="text-xs font-medium">Estes usuários ainda não trocaram mensagens.</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isReported = msg.sender_id !== messages[0].sender_id; // Logic should be better based on IDs
                            // In this context, we don't know who is who just by ID without passing them
                            // but usually it's better to show them as bubbles
                            return (
                                <div key={msg.id} className="group">
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${msg.sender_id === messages[0].sender_id ? 'text-violet-500' : 'text-zinc-400'}`}>
                                            ID: {msg.sender_id.substring(0, 8)}
                                        </span>
                                        <span className="text-[10px] text-zinc-300 font-bold flex items-center gap-1">
                                            <Clock size={8} /> {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="bg-white border border-zinc-100 p-4 rounded-2xl shadow-sm hover:border-zinc-200 transition-colors">
                                        {msg.media_url ? (
                                            <div className="space-y-2">
                                                {msg.media_type === 'image' && (
                                                    <img src={msg.media_url} className="max-w-xs rounded-xl border border-zinc-100" alt="Mídia" />
                                                )}
                                                {msg.media_type === 'audio' && (
                                                    <div className="flex items-center gap-2 text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                                                        <Mic size={14} /> <span className="text-[10px] font-bold">Mensagem de Áudio</span>
                                                    </div>
                                                )}
                                                <p className="text-sm font-medium text-zinc-800 italic">{msg.content || 'Mídia enviada'}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium text-zinc-800 leading-relaxed">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Tip */}
                <div className="p-4 bg-zinc-900 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    Auditado por Log de Sistema
                </div>
            </div>
        </div>
    );
};

export default EvidenceModal;
