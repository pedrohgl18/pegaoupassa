import React from 'react';
import { Crown, Pencil, SlidersHorizontal, ChevronRight, Star, Settings, LogOut, MapPin, Sparkles } from 'lucide-react';
import Button from './Button';
import { ScreenState } from '../types';

interface ProfileProps {
    user: any;
    profile: any;
    isVip: boolean;
    swipeCount: number;
    onNavigate: (screen: ScreenState) => void;
    onLogout: () => void;
    onShowFilter: () => void;
}

const Profile: React.FC<ProfileProps> = ({
    user,
    profile,
    isVip,
    swipeCount,
    onNavigate,
    onLogout,
    onShowFilter
}) => {
    const avatarUrl = user?.user_metadata?.avatar_url || profile?.photos?.[0]?.url || "https://picsum.photos/seed/me/400/400";
    // Use second photo for cover if available, otherwise use a gradient style (handled in render)
    const hasCoverPhoto = profile?.photos?.length > 1;
    const coverUrl = hasCoverPhoto ? profile.photos[1].url : null;

    return (
        <div className="flex flex-col h-full w-full bg-zinc-50 animate-fade-in overflow-y-auto no-scrollbar pb-24">

            {/* Simple Header with Avatar */}
            <div className="relative w-full pt-20 pb-6 flex flex-col items-center bg-zinc-50">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full p-1 bg-white shadow-xl">
                        <img
                            src={avatarUrl}
                            className="w-full h-full rounded-full object-cover"
                            alt="Avatar"
                        />
                    </div>
                    {isVip && (
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg animate-bounce-slow">
                            <Crown size={18} className="text-white" fill="white" />
                        </div>
                    )}
                    {!isVip && (
                        <button
                            onClick={() => onNavigate(ScreenState.VIP)}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-800 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg"
                        >
                            <Star size={14} fill="white" />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-2 px-6 flex flex-col items-center gap-6">

                {/* Name & Bio */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-extrabold text-zinc-900 flex items-center justify-center gap-2">
                        {profile?.name || user?.user_metadata?.full_name || 'Você'}
                        <span className="text-lg font-normal text-zinc-500">
                            {profile?.age || (profile?.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : '')}
                        </span>
                    </h1>
                    <div className="flex items-center justify-center gap-1 text-zinc-500 text-sm font-medium">
                        <MapPin size={14} />
                        {profile?.city ? `${profile.city}, ${profile.state}` : 'Brasil'}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center gap-1 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-brasil-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-3xl font-extrabold text-brasil-green">{swipeCount}</span>
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Pegas Hoje</span>
                    </div>

                    <div
                        onClick={() => !isVip && onNavigate(ScreenState.VIP)}
                        className={`p-4 rounded-2xl shadow-sm border flex flex-col items-center gap-1 relative overflow-hidden group cursor-pointer transition-all ${isVip ? 'bg-white border-zinc-100' : 'bg-gradient-to-br from-zinc-900 to-zinc-800 border-transparent text-white'}`}
                    >
                        {isVip ? (
                            <>
                                <span className="text-3xl font-extrabold text-brasil-blue">VIP</span>
                                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Ativo</span>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <Crown size={20} className="text-yellow-400" fill="#FACC15" />
                                    <span className="text-lg font-bold text-white">Seja VIP</span>
                                </div>
                                <span className="text-[10px] text-zinc-400 font-medium mt-1">Desbloqueie tudo</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Menu Actions */}
                <div className="w-full space-y-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Menu</h3>

                    <button
                        onClick={() => onNavigate(ScreenState.EDIT_PROFILE)}
                        className="w-full p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-brasil-blue/30 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-brasil-blue flex items-center justify-center group-hover:bg-brasil-blue group-hover:text-white transition-colors">
                                <Pencil size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-zinc-800">Editar Perfil</p>
                                <p className="text-xs text-zinc-400">Fotos, bio, interesses</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-brasil-blue transition-colors" />
                    </button>

                    <button
                        onClick={onShowFilter}
                        className="w-full p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-brasil-green/30 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-brasil-green flex items-center justify-center group-hover:bg-brasil-green group-hover:text-white transition-colors">
                                <SlidersHorizontal size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-zinc-800">Preferências</p>
                                <p className="text-xs text-zinc-400">Idade, distância, gênero</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-brasil-green transition-colors" />
                    </button>

                    {!isVip && (
                        <button
                            onClick={() => onNavigate(ScreenState.VIP)}
                            className="w-full p-4 bg-gradient-to-r from-brasil-yellow/10 to-brasil-green/10 rounded-2xl border border-brasil-yellow/20 shadow-sm flex items-center justify-between group transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brasil-yellow to-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-200">
                                    <Sparkles size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-zinc-800">Pega ou Passa Gold</p>
                                    <p className="text-xs text-zinc-500">Veja quem te curtiu</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-zinc-300 group-hover:text-orange-500 transition-colors" />
                        </button>
                    )}
                </div>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="mt-4 flex items-center gap-2 text-zinc-400 text-sm font-bold hover:text-red-500 transition-colors py-2 px-4 rounded-full hover:bg-red-50"
                >
                    <LogOut size={16} />
                    Sair da conta
                </button>

                <div className="h-4" />
            </div>
        </div>
    );
};

export default Profile;
