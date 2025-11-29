import React from 'react';
import { Search, Heart, Crown, Loader2, MessageCircle } from 'lucide-react';
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
    const chatTitles = [
        "Quem será que te quer? 👀",
        "Bora paquerar! 💬",
        "Conversas quentes 🔥",
        "Seus crushs 💕",
        "Papo rola aqui 💭",
    ];
    const randomTitle = chatTitles[Math.floor(Math.random() * chatTitles.length)];

    return (
        <div className="flex flex-col h-full w-full bg-zinc-50 animate-fade-in">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 bg-white border-b border-zinc-100 shadow-sm sticky top-0 z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Conversas</h1>
                        <p className="text-zinc-400 text-sm font-medium mt-1">Conecte-se com seus matches</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                        <Search size={20} />
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto flex-1 pb-24 no-scrollbar">
                {loadingMatches && matchesList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-brasil-blue" size={32} />
                        <p className="text-zinc-400 text-sm font-medium">Carregando conversas...</p>
                    </div>
                ) : (
                    <>
                        {/* Received Likes (VIP) */}
                        {receivedLikes.length > 0 && (
                            <div className="py-6">
                                <div className="px-6 flex justify-between items-center mb-4">
                                    <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-brasil-yellow/20 flex items-center justify-center">
                                            <Heart size={12} className="fill-brasil-yellow text-brasil-yellow" />
                                        </div>
                                        Curtiu Você
                                        <span className="bg-brasil-yellow text-brasil-blue text-[10px] font-bold px-2 py-0.5 rounded-full">{receivedLikes.length}</span>
                                    </h2>
                                    {!isVip && (
                                        <button onClick={onVipClick} className="text-xs font-bold text-brasil-blue hover:underline">
                                            Ver todos
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar pb-2">
                                    {receivedLikes.map((like) => (
                                        <div
                                            key={like.id}
                                            className="flex flex-col items-center gap-2 shrink-0 w-20 cursor-pointer group"
                                            onClick={() => {
                                                if (isVip) {
                                                    // Logic to view profile is handled by parent or passed down
                                                    // For now we just call the handler
                                                    const p = like.profile;
                                                    const mappedProfile = {
                                                        id: p.id,
                                                        name: p.name || 'Usuário',
                                                        age: p.age || 25,
                                                        bio: p.bio || '',
                                                        imageUrl: p.photos?.[0]?.url || 'https://picsum.photos/400/600',
                                                        photos: p.photos?.map((ph: any) => ph.url) || ['https://picsum.photos/400/600'],
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
                                            <div className="relative w-16 h-16 transition-transform group-hover:scale-105">
                                                <img
                                                    src={like.profile.photos?.[0]?.url || 'https://picsum.photos/200'}
                                                    className={`w-full h-full rounded-2xl object-cover border-2 border-white shadow-md ${!isVip ? 'blur-md' : ''}`}
                                                    alt="Hidden"
                                                />
                                                {!isVip && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl">
                                                        <Crown size={20} className="text-white drop-shadow-md" fill="#FFDF00" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-xs font-bold text-zinc-700 truncate w-full text-center ${!isVip ? 'blur-[2px]' : ''}`}>
                                                {isVip ? like.profile.name : 'Alguém'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Matches */}
                        {matchesList.length > 0 && (
                            <div className="py-2">
                                <h2 className="px-6 text-sm font-bold text-zinc-800 uppercase mb-4 tracking-wider">Seus Matches</h2>
                                <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar pb-4">
                                    {matchesList.map(chat => (
                                        <div
                                            key={chat.id}
                                            className="flex flex-col items-center gap-2 shrink-0 w-20 cursor-pointer group"
                                            onClick={() => onChatSelect(chat)}
                                        >
                                            <div className="relative w-16 h-16 transition-transform group-hover:scale-105">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-brasil-yellow to-brasil-green rounded-2xl rotate-3 opacity-50 group-hover:rotate-6 transition-transform" />
                                                <img src={chat.imageUrl} className="w-full h-full rounded-2xl object-cover border-2 border-white relative shadow-sm" alt={chat.name} />
                                                {chat.unreadCount > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-brasil-blue rounded-full border-2 border-white" />
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-zinc-700 truncate w-full text-center mt-1">{chat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages List */}
                        <div className="mt-4 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.02)] min-h-[400px]">
                            <div className="p-6">
                                <h2 className="text-sm font-bold text-zinc-400 uppercase mb-4 tracking-wider">Mensagens</h2>

                                {matchesList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-300">
                                            <MessageCircle size={32} />
                                        </div>
                                        <p className="text-zinc-500 font-medium">Nenhuma mensagem ainda</p>
                                        <p className="text-zinc-400 text-sm mt-1 max-w-[200px]">Dê match com alguém para começar a conversar!</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {matchesList.map(chat => (
                                            <div
                                                key={chat.id}
                                                className="flex items-center gap-4 p-3 -mx-3 hover:bg-zinc-50 rounded-2xl transition-colors cursor-pointer group"
                                                onClick={() => onChatSelect(chat)}
                                            >
                                                <div className="relative">
                                                    <img src={chat.imageUrl} className="w-14 h-14 rounded-full object-cover border border-zinc-100 group-hover:border-zinc-200 transition-colors" alt={chat.name} />
                                                    {chat.unreadCount > 0 && (
                                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-brasil-green rounded-full border-2 border-white" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className={`text-base truncate ${chat.unreadCount > 0 ? 'font-extrabold text-zinc-900' : 'font-bold text-zinc-700'}`}>
                                                            {chat.name}
                                                        </h3>
                                                        <span className={`text-xs ${chat.unreadCount > 0 ? 'text-brasil-green font-bold' : 'text-zinc-400'}`}>
                                                            {chat.timestamp}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-zinc-900 font-medium' : 'text-zinc-500'}`}>
                                                        {chat.lastMessage}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatList;
