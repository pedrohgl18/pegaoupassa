import React from 'react';
import { Search, Heart, Crown, Loader2, MessageCircle, Flame, Ghost } from 'lucide-react';
import { ScreenState } from '../types';

interface ChatListProps {
    matchesList: any[];
    receivedLikes: any[];
    isVip: boolean;
    loadingMatches: boolean;
    onChatSelect: (chat: any) => void;
    onVipClick: () => void;
    onViewProfile: (profile: any) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    matchesList,
    receivedLikes,
    isVip,
    loadingMatches,
    onChatSelect,
    onVipClick,
    onViewProfile
}) => {
    return (
        <div className="flex flex-col h-full w-full bg-white animate-fade-in">
            {/* Header Compacto */}
            <div className="px-5 pt-10 pb-4 bg-white border-b border-zinc-100 sticky top-0 z-10 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tighter flex items-center gap-2">
                        Contatinhos <Flame className="text-orange-500 fill-orange-500" size={24} />
                    </h1>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1">Quem deu match tá aqui</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-100">
                    <Search size={18} />
                </div>
            </div>

            <div className="overflow-y-auto flex-1 pb-24 no-scrollbar">
                {loadingMatches && matchesList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="animate-spin text-brasil-blue" size={28} />
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Carregando o fervo...</p>
                    </div>
                ) : (
                    <>
                        {/* Likes Recebidos (VIP) - Compacto */}
                        {receivedLikes.length > 0 && (
                            <div className="py-4 border-b border-zinc-50">
                                <div className="px-5 flex justify-between items-center mb-3">
                                    <h2 className="text-xs font-black text-brasil-yellow uppercase tracking-widest flex items-center gap-1.5">
                                        <Heart size={14} className="fill-brasil-yellow" />
                                        Te Querem
                                        <span className="bg-brasil-yellow text-brasil-blue text-[10px] font-black px-1.5 py-0.5 rounded-md ml-1">{receivedLikes.length}</span>
                                    </h2>
                                    {!isVip && (
                                        <button onClick={onVipClick} className="text-[10px] font-black text-brasil-blue hover:underline uppercase">
                                            Ver quem é
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar pb-2">
                                    {receivedLikes.map((like) => (
                                        <div
                                            key={like.id}
                                            className="flex flex-col items-center gap-1.5 shrink-0 w-[4.5rem] cursor-pointer group"
                                            onClick={() => {
                                                if (isVip) {
                                                    const p = like.profile;
                                                    const mappedProfile = {
                                                        id: p.id,
                                                        name: p.name || 'Usuário',
                                                        age: p.age || 25,
                                                        bio: p.bio || '',
                                                        imageUrl: p.photos?.[0]?.url || '',
                                                        photos: p.photos?.map((ph: any) => ph.url) || [],
                                                        distance: p.distance !== undefined ? Math.round(p.distance) : 0,
                                                        verified: p.is_verified || false,
                                                        zodiacSign: p.zodiac_sign,
                                                        profession: p.profession,
                                                        education: p.education,
                                                        height: p.height,
                                                    };
                                                    onViewProfile(mappedProfile);
                                                } else {
                                                    onVipClick();
                                                }
                                            }}
                                        >
                                            <div className="relative w-[4.5rem] h-[4.5rem]">
                                                <img
                                                    src={like.profile.photos?.[0]?.url || ''}
                                                    className={`w-full h-full rounded-xl object-cover border-2 border-brasil-yellow/50 ${!isVip ? 'blur-md' : ''}`}
                                                    alt="Hidden"
                                                />
                                                {!isVip && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                                                        <Crown size={18} className="text-white drop-shadow-md" fill="#FFDF00" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-bold text-zinc-600 truncate w-full text-center ${!isVip ? 'blur-[2px]' : ''}`}>
                                                {isVip ? like.profile.name : 'Segredo'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Matches Recentes - Compacto */}
                        {matchesList.length > 0 && (
                            <div className="py-4">
                                <h2 className="px-5 text-xs font-black text-zinc-400 uppercase mb-3 tracking-widest">Deu Match</h2>
                                <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar pb-2">
                                    {matchesList.map(chat => (
                                        <div
                                            key={chat.id}
                                            className="flex flex-col items-center gap-1.5 shrink-0 w-[4.5rem] cursor-pointer active:scale-95 transition-transform"
                                            onClick={() => onChatSelect(chat)}
                                        >
                                            <div className="relative w-[4.5rem] h-[4.5rem]">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-brasil-yellow to-brasil-green rounded-xl rotate-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <img src={chat.imageUrl} className="w-full h-full rounded-xl object-cover border border-zinc-200 relative" alt={chat.name} />
                                                {chat.unreadCount > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brasil-blue rounded-full border-2 border-white" />
                                                )}
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-700 truncate w-full text-center">{chat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lista de Mensagens - Compacta e Limpa */}
                        <div className="mt-2">
                            <h2 className="px-5 text-xs font-black text-zinc-400 uppercase mb-2 tracking-widest">Papo Reto</h2>

                            {matchesList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center px-8 opacity-60">
                                    <Ghost size={40} className="text-zinc-300 mb-3" />
                                    <p className="text-zinc-800 font-bold text-sm">Tá um deserto aqui...</p>
                                    <p className="text-zinc-500 text-xs mt-1">Bora pro feed distribuir uns likes e movimentar esse chat!</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {matchesList.map(chat => (
                                        <div
                                            key={chat.id}
                                            className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 active:bg-zinc-100 transition-colors cursor-pointer border-b border-zinc-50 last:border-0"
                                            onClick={() => onChatSelect(chat)}
                                        >
                                            <div className="relative shrink-0">
                                                <img src={chat.imageUrl} className="w-12 h-12 rounded-full object-cover border border-zinc-100" alt={chat.name} />
                                                {chat.unreadCount > 0 && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-brasil-green rounded-full border-2 border-white" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h3 className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-black text-zinc-900' : 'font-bold text-zinc-700'}`}>
                                                        {chat.name}
                                                    </h3>
                                                    <span className={`text-[10px] font-bold ${chat.unreadCount > 0 ? 'text-brasil-green' : 'text-zinc-300'}`}>
                                                        {chat.timestamp}
                                                    </span>
                                                </div>
                                                <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                                                    {chat.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatList;
