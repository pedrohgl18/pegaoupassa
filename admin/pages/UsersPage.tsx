import React from 'react';
import { Search, Crown, Ban, RotateCcw, MapPin, Mail, Calendar, Users, MessageSquare, UserCheck } from 'lucide-react';
import { UserRow, AdminMessage } from '../types';
import EvidenceModal from '../components/EvidenceModal';

interface UsersPageProps {
    users: UserRow[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterVip: 'all' | 'vip' | 'free';
    setFilterVip: (val: 'all' | 'vip' | 'free') => void;
    filterState: string;
    setFilterState: (val: string) => void;
    onToggleVip: (userId: string, currentVip: boolean) => void;
    onToggleBan: (userId: string, currentActive: boolean) => void;
    onResetLikes: (userId: string) => void;
    onFetchEvidence?: (adminId: string, targetId: string) => Promise<AdminMessage[]>;
    onImpersonate?: (userId: string) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({
    users,
    searchTerm,
    setSearchTerm,
    filterVip,
    setFilterVip,
    filterState,
    setFilterState,
    onToggleVip,
    onToggleBan,
    onResetLikes,
    onFetchEvidence,
    onImpersonate
}) => {
    const [viewerModal, setViewerModal] = React.useState<{
        isOpen: boolean;
        userName: string;
        messages: AdminMessage[];
        loading: boolean;
    }>({
        isOpen: false,
        userName: '',
        messages: [],
        loading: false
    });

    const handleViewChat = async (user: UserRow) => {
        if (!onFetchEvidence) return;

        setViewerModal({
            isOpen: true,
            userName: user.name || 'Usuário',
            messages: [],
            loading: true
        });

        // In the context of "View Chat" for a single user, we need to decide WHICH chat to show
        // For simplicity, let's show the most recent conversation if we can find one,
        // or just placeholder for now. 
        // Better: We might need a separate RPC to find ALL chats for a user.
        // For this phase, let's fetch evidence between the ADMIN and this user (unlikely)
        // OR we can change fetchChatEvidence to take a target and find its status.

        // Actually, "View Chat" for support usually means seeing WHO they are talking to.
        // Let's implement a more robust logic in the hook later.
        // For now, let's just use the modal structure.
        setViewerModal(prev => ({ ...prev, loading: false }));
    };
    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Nome, e-mail ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-zinc-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-violet-500/10 outline-none transition-all font-medium"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={filterVip}
                        onChange={(e) => setFilterVip(e.target.value as any)}
                        className="px-4 py-3 bg-zinc-50 border-zinc-100 rounded-2xl focus:bg-white outline-none font-bold text-zinc-600 cursor-pointer"
                    >
                        <option value="all">Todos os Planos</option>
                        <option value="vip">Somente VIP</option>
                        <option value="free">Usuários Free</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Estado (UF)"
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        className="w-24 px-4 py-3 bg-zinc-50 border-zinc-100 rounded-2xl focus:bg-white outline-none font-bold text-zinc-600 text-center"
                    />
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
                {users.map((u) => (
                    <div key={u.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all flex gap-6 relative group overflow-hidden">
                        {/* Status indicators */}
                        {!u.is_active && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest z-10">
                                Banido
                            </div>
                        )}

                        {/* Photo */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={u.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${u.name}&background=7c3aed&color=fff`}
                                className={`w-24 h-24 rounded-2xl object-cover border-4 ${u.is_vip ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-zinc-50'}`}
                                alt=""
                            />
                            {u.is_vip && (
                                <div className="absolute -top-2 -left-2 bg-amber-400 text-white p-1.5 rounded-lg shadow-md animate-bounce">
                                    <Crown size={14} fill="currentColor" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-zinc-900 truncate flex items-center gap-2">
                                    {u.name || 'Sem Nome'}
                                    {u.is_active && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                                </h3>
                                <div className="space-y-1 mt-1">
                                    <p className="text-zinc-400 text-xs font-bold flex items-center gap-1.5">
                                        <Mail size={12} /> {u.email}
                                    </p>
                                    <p className="text-zinc-400 text-xs font-bold flex items-center gap-1.5">
                                        <MapPin size={12} /> {u.city || 'Desconhecido'}{u.state ? `, ${u.state}` : ''}
                                    </p>
                                    <p className="text-zinc-400 text-xs font-bold flex items-center gap-1.5">
                                        <Calendar size={12} /> Membro desde {new Date(u.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-50">
                                <ActionButton
                                    onClick={() => onToggleVip(u.id, u.is_vip)}
                                    active={u.is_vip}
                                    activeColor="bg-amber-100 text-amber-600"
                                    icon={<Crown size={18} />}
                                    label={u.is_vip ? 'Remover VIP' : 'Tornar VIP'}
                                />
                                <ActionButton
                                    onClick={() => onToggleBan(u.id, u.is_active)}
                                    active={!u.is_active}
                                    activeColor="bg-red-100 text-red-600"
                                    icon={<Ban size={18} />}
                                    label={u.is_active ? 'Banir' : 'Reativar'}
                                />
                                <ActionButton
                                    onClick={() => onResetLikes(u.id)}
                                    icon={<RotateCcw size={18} />}
                                    label="Reset Likes"
                                />
                                <div className="w-px h-8 bg-zinc-100 mx-1" />
                                <ActionButton
                                    onClick={() => handleViewChat(u)}
                                    icon={<MessageSquare size={18} />}
                                    label="Ver Conversas"
                                    color="text-blue-500 hover:bg-blue-50"
                                />
                                <ActionButton
                                    onClick={() => onImpersonate?.(u.id)}
                                    icon={<UserCheck size={18} />}
                                    label="Personificar"
                                    color="text-emerald-500 hover:bg-emerald-50"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="bg-white rounded-3xl p-20 border border-zinc-100 text-center space-y-4">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                        <Users size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-zinc-900">Nenhum usuário encontrado</h3>
                        <p className="text-zinc-500 font-medium">Tente ajustar seus filtros de busca.</p>
                    </div>
                </div>
            )}

            <EvidenceModal
                isOpen={viewerModal.isOpen}
                onClose={() => setViewerModal(prev => ({ ...prev, isOpen: false }))}
                reporterName="Suporte"
                reportedName={viewerModal.userName}
                messages={viewerModal.messages}
                loading={viewerModal.loading}
            />
        </div>
    );
};

const ActionButton = ({ onClick, active, activeColor, icon, label, color }: any) => (
    <button
        onClick={onClick}
        title={label}
        className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-90 ${active ? activeColor : (color || 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-900')
            }`}
    >
        {icon}
    </button>
);

export default UsersPage;
