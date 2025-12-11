import React from 'react';
import { Crown, X, Ghost, Check } from 'lucide-react';
import { profiles } from '../lib/supabase';

interface VipSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: any;
    updateProfile: (updates: any) => Promise<void>;
}

export const VipSettingsModal: React.FC<VipSettingsModalProps> = ({ isOpen, onClose, profile, updateProfile }) => {
    if (!isOpen || !profile) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="bg-white w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-extrabold text-brasil-blue flex items-center gap-2">
                        <Crown size={24} className="text-brasil-yellow fill-brasil-yellow" /> Configurações VIP
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Incognito Mode */}
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-zinc-700">
                                <Ghost size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-800">Modo Incógnito</h3>
                                <p className="text-xs text-zinc-500 max-w-[200px]">
                                    Seu perfil só aparece para quem você curtiu primeiro.
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={profile.is_incognito || false}
                                onChange={async (e) => {
                                    const newValue = e.target.checked;
                                    await updateProfile({ is_incognito: newValue });
                                }}
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brasil-blue"></div>
                        </label>
                    </div>

                    {/* Read Receipts */}
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-zinc-700">
                                <Check size={20} className="text-brasil-green" />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-800">Confirmação de Leitura</h3>
                                <p className="text-xs text-zinc-500 max-w-[200px]">
                                    Saiba quando seus matches leram suas mensagens.
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={profile.read_receipts_enabled !== false} // Default true
                                onChange={async (e) => {
                                    const newValue = e.target.checked;
                                    await updateProfile({ read_receipts_enabled: newValue });
                                }}
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brasil-blue"></div>
                        </label>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-zinc-400">
                        Essas configurações são exclusivas para membros VIP.
                    </p>
                </div>
            </div>
        </div>
    );
};
