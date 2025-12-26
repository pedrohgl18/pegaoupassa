import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Shield, Trash2, Eye, EyeOff, ChevronRight, UserX } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface SettingsProps {
    onClose: () => void;
    onLogout: () => void;
}

export function Settings({ onClose, onLogout }: SettingsProps) {
    const { user, profile, loadProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Local state for toggles
    const [notifyMatches, setNotifyMatches] = useState(true);
    const [notifyMessages, setNotifyMessages] = useState(true);
    const [isActive, setIsActive] = useState(true);

    // Blocked users state
    const [showBlocked, setShowBlocked] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);

    useEffect(() => {
        if (profile) {
            setNotifyMatches(profile.notify_matches ?? true);
            setNotifyMessages(profile.notify_messages ?? true);
            setIsActive(profile.is_active ?? true);
        }
    }, [profile]);

    const updateSetting = async (field: string, value: boolean) => {
        if (!user) return;

        // Optimistic update
        if (field === 'notify_matches') setNotifyMatches(value);
        if (field === 'notify_messages') setNotifyMessages(value);
        if (field === 'is_active') setIsActive(value);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ [field]: value })
                .eq('id', user.id);

            if (error) throw error;

            // Reload profile to sync
            await loadProfile();
        } catch (error) {
            // Revert on error (could be improved)
            alert('Erro ao salvar configuração.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Tem certeza? Essa ação é IRREVERSÍVEL. Todos os seus dados, fotos e matches serão apagados.')) return;

        const confirmText = prompt('Digite "DELETAR" para confirmar:');
        if (confirmText?.toUpperCase() !== 'DELETAR') return;

        setLoading(true);
        try {
            if (!user) return;

            // Delete profile (Cascade will handle related data)
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);

            if (error) throw error;

            alert('Sua conta foi deletada com sucesso.');
            onLogout();
        } catch (error) {
            alert('Erro ao deletar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const loadBlockedUsers = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('blocks')
                .select(`
          id,
          blocked:profiles!blocked_id(id, name, photos(*))
        `)
                .eq('blocker_id', user.id);

            if (error) throw error;
            setBlockedUsers(data || []);
            setShowBlocked(true);
        } catch (error) {
            // Silent fail
        }
    };

    const handleUnblock = async (blockId: string) => {
        try {
            const { error } = await supabase
                .from('blocks')
                .delete()
                .eq('id', blockId);

            if (error) throw error;

            setBlockedUsers(prev => prev.filter(b => b.id !== blockId));
        } catch (error) {
            alert('Erro ao desbloquear usuário.');
        }
    };

    if (showBlocked) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex flex-col animate-slide-in">
                <div className="p-4 pt-8 border-b flex items-center gap-4 bg-white shadow-sm">
                    <button onClick={() => setShowBlocked(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-zinc-700" />
                    </button>
                    <h2 className="text-xl font-bold text-zinc-800">Usuários Bloqueados</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {blockedUsers.length === 0 ? (
                        <div className="text-center text-zinc-500 mt-10">
                            <UserX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum usuário bloqueado.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {blockedUsers.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden">
                                            {item.blocked?.photos?.[0]?.url ? (
                                                <img src={item.blocked.photos[0].url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-300 text-zinc-500">
                                                    <UserX className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium text-zinc-800">{item.blocked?.name || 'Usuário'}</span>
                                    </div>
                                    <button
                                        onClick={() => handleUnblock(item.id)}
                                        className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full"
                                    >
                                        Desbloquear
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-slide-in">
            {/* Header */}
            <div className="p-4 pt-8 border-b flex items-center gap-4 bg-white shadow-sm">
                <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-zinc-700" />
                </button>
                <h2 className="text-xl font-bold text-zinc-800">Configurações</h2>
            </div>

            <div className="flex-1 overflow-y-auto bg-zinc-50">
                <div className="p-4 space-y-6">

                    {/* Notificações */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase mb-3 px-2">Notificações</h3>
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="p-4 flex items-center justify-between border-b">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-800">Novos Matches</p>
                                        <p className="text-xs text-zinc-500">Seja notificado quando der match</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifyMatches}
                                        onChange={(e) => updateSetting('notify_matches', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-800">Mensagens</p>
                                        <p className="text-xs text-zinc-500">Notificações de novas mensagens</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifyMessages}
                                        onChange={(e) => updateSetting('notify_messages', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Descoberta */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase mb-3 px-2">Descoberta</h3>
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                        {isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-800">Mostrar meu perfil</p>
                                        <p className="text-xs text-zinc-500">Se desativado, você não aparecerá para ninguém</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isActive}
                                        onChange={(e) => updateSetting('is_active', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Privacidade e Segurança */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase mb-3 px-2">Privacidade</h3>
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <button
                                onClick={loadBlockedUsers}
                                className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors border-b"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-zinc-800">Usuários Bloqueados</p>
                                        <p className="text-xs text-zinc-500">Gerenciar lista de bloqueio</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-400" />
                            </button>

                            <button
                                onClick={async () => {
                                    const { Browser } = await import('@capacitor/browser');
                                    await Browser.open({ url: 'https://pedrohgl18.github.io/politicas-app/privacy-policy.md' });
                                }}
                                className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors border-b"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                                        <Shield className="w-5 h-5 font-normal" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-zinc-800">Política de Privacidade</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-400" />
                            </button>

                            <button
                                onClick={async () => {
                                    const { Browser } = await import('@capacitor/browser');
                                    await Browser.open({ url: 'https://pedrohgl18.github.io/politicas-app/terms-of-use.md' });
                                }}
                                className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors border-b"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                                        <Shield className="w-5 h-5 font-normal" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-zinc-800">Termos de Uso</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-400" />
                            </button>

                            <button
                                onClick={async () => {
                                    const { Browser } = await import('@capacitor/browser');
                                    await Browser.open({ url: 'https://pedrohgl18.github.io/politicas-app/data-deletion.md' });
                                }}
                                className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600">
                                        <Shield className="w-5 h-5 font-normal" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-zinc-800">Exclusão de Dados</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>
                    </section>

                    {/* Conta */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase mb-3 px-2">Conta</h3>
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-200">
                                        <Trash2 className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-red-600">Deletar Conta</p>
                                        <p className="text-xs text-red-400">Apagar permanentemente seus dados</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-red-300" />
                            </button>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2 px-2 text-center">
                            Versão 1.0.0 • Pega ou Passa
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
