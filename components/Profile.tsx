import React, { useState } from 'react';
import { Crown, Pencil, SlidersHorizontal, ChevronRight, Star, Settings as SettingsIcon, LogOut, MapPin, Sparkles, Heart, User, Lock } from 'lucide-react';
import Button from './Button';
import { ScreenState } from '../types';
import { Settings } from './Settings';

interface ProfileProps {
    user: any;
    profile: any;
    isVip: boolean;
    swipeCount: number;
    onNavigate: (screen: ScreenState) => void;
    onLogout: () => void;
    onShowFilter: () => void;
    onVipSettings: () => void;
    onPreview: () => void;
    onVibeCheck: () => void;
    matchesCount: number;
    receivedLikesCount: number;
}

const Profile: React.FC<ProfileProps> = ({
    user,
    profile,
    isVip,
    swipeCount,
    onNavigate,
    onLogout,
    onShowFilter,
    onVipSettings,
    onPreview,
    onVibeCheck,
    matchesCount,
    receivedLikesCount,
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const sortedPhotos = profile?.photos?.slice().sort((a: any, b: any) => a.position - b.position) || [];
    const avatarUrl = sortedPhotos[0]?.url || "";
    const hasCoverPhoto = sortedPhotos.length > 1;

    return (
        <div className="flex flex-col h-full w-full bg-zinc-50 animate-fade-in overflow-y-auto no-scrollbar pb-24">

            {/* Header with Avatar */}
            <div className="relative w-full pt-20 pb-6 flex flex-col items-center bg-zinc-50">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full p-1 bg-white shadow-xl">
                        <img src={avatarUrl} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                    </div>
                    {isVip && (
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary rounded-full border-4 border-white/30 flex items-center justify-center z-20 shadow-lg animate-bounce">
                            <Heart size={20} className="text-white" fill="white" />
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

                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    {/* Swipe Count Card */}
                    <div className="bg-white/20 backdrop-blur-lg p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center gap-1 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-3xl font-extrabold text-primary">{swipeCount}</span>
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Pegas Hoje</span>
                    </div>

                    {/* VIP Card */}
                    <div
                        onClick={() => !isVip && onNavigate(ScreenState.VIP)}
                        className={`p-3 rounded-2xl shadow-sm border flex flex-col items-center justify-center gap-1 relative overflow-hidden group cursor-pointer transition-all min-h-[100px] ${isVip ? 'bg-white border-zinc-100' : 'bg-gradient-to-br from-yellow-500 to-orange-600 border-transparent text-white'}`}
                    >
                        {isVip ? (
                            <>
                                <span className="text-3xl font-extrabold text-primary">VIP</span>
                                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Ativo</span>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full py-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Crown size={22} className="text-white" fill="#FFFFFF" />
                                    <span className="text-lg font-bold text-white drop-shadow-md">Seja VIP</span>
                                </div>
                                <p className="text-[10px] text-white/90 font-medium text-center leading-tight px-1">
                                    O jogo vira quando<br />você é VIP.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* VIP Stats: Matches & Likes Received */}
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        {/* Matches */}
                        <div
                            onClick={() => !isVip && onNavigate(ScreenState.VIP)}
                            className={`p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center gap-1 relative overflow-hidden ${isVip ? 'bg-white' : 'bg-zinc-50 cursor-pointer group'}`}
                        >
                            {isVip ? (
                                <span className="text-3xl font-extrabold text-purple-600">{matchesCount}</span>
                            ) : (
                                <div className="h-9 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                        <Lock size={16} className="text-zinc-400 group-hover:text-purple-500" />
                                    </div>
                                </div>
                            )}
                            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Matches</span>
                        </div>

                        {/* Likes Received */}
                        <div
                            onClick={() => !isVip && onNavigate(ScreenState.VIP)}
                            className={`p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col items-center gap-1 relative overflow-hidden ${isVip ? 'bg-white' : 'bg-zinc-50 cursor-pointer group'}`}
                        >
                            {isVip ? (
                                <span className="text-3xl font-extrabold text-pink-500">{receivedLikesCount}</span>
                            ) : (
                                <div className="h-9 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                                        <Lock size={16} className="text-zinc-400 group-hover:text-pink-500" />
                                    </div>
                                </div>
                            )}
                            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Curtidas</span>
                        </div>
                    </div>
                </div>

                {/* Vibe Status Card (New Placement) */}
                <div
                    onClick={onVibeCheck}
                    className="w-full bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-between cursor-pointer group active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${profile?.vibeStatus ? 'bg-purple-100' : 'bg-zinc-100'}`}>
                            {profile?.vibeStatus ? (
                                <span className="text-2xl animate-pulse">✨</span>
                            ) : (
                                <div className="w-3 h-3 bg-violet-600 rounded-full animate-ping absolute top-0 right-0" />
                            )}
                            <Sparkles size={24} className={profile?.vibeStatus ? "text-purple-600" : "text-zinc-400"} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-zinc-900">Modo Agora {profile?.vibeStatus && <span className="text-xs font-normal text-purple-600 ml-2 bg-purple-50 px-2 py-0.5 rounded-full">Ativo</span>}</h3>
                            <p className="text-xs text-zinc-500">Defina seu status para encontros hoje</p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-zinc-300 group-hover:text-purple-600 transition-colors" />
                </div>

                {/* Menu Actions */}
                <div className="w-full space-y-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Menu</h3>

                    <button
                        onClick={() => onNavigate(ScreenState.EDIT_PROFILE)}
                        className="w-full p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                <Pencil size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-zinc-800">Editar Perfil</p>
                                <p className="text-xs text-zinc-400">Fotos, bio, interesses</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-primary transition-colors" />
                    </button>

                    <button
                        onClick={onPreview}
                        className="w-full p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-purple-500/30 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <User size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-zinc-800">Visualizar Perfil Público</p>
                                <p className="text-xs text-zinc-400">Como os outros te veem</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-purple-600 transition-colors" />
                    </button>

                    <button
                        onClick={onShowFilter}
                        className="w-full p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-secondary/30 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                                <SlidersHorizontal size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-zinc-800">Preferências</p>
                                <p className="text-xs text-zinc-400">Idade, distância, gênero</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-secondary transition-colors" />
                    </button>

                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-full p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-zinc-400/30 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-50 text-zinc-600 flex items-center justify-center group-hover:bg-zinc-600 group-hover:text-white transition-colors">
                                <SettingsIcon size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-zinc-800">Configurações</p>
                                <p className="text-xs text-zinc-400">Notificações, conta, privacidade</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                    </button>

                    {!isVip && (
                        <button
                            onClick={() => onNavigate(ScreenState.VIP)}
                            className="w-full p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100 shadow-sm flex items-center justify-between group transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200">
                                    <Sparkles size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-zinc-800">Modo VIP Lendário</p>
                                    <p className="text-xs text-zinc-500">Veja quem te curtiu e mais</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-zinc-300 group-hover:text-orange-500 transition-colors" />
                        </button>
                    )}

                    {isVip && (
                        <button
                            onClick={onVipSettings}
                            className="w-full p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-yellow-400/50 transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                    <SettingsIcon size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-zinc-800">Configurações VIP</p>
                                    <p className="text-xs text-zinc-400">Incógnito, confirmação de leitura</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-zinc-300 group-hover:text-yellow-500 transition-colors" />
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
            {showSettings && (
                <Settings onClose={() => setShowSettings(false)} onLogout={onLogout} />
            )}
        </div >
    );
};

export default Profile;
