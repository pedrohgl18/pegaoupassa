import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Heart, MessageCircle, AlertCircle, Zap, Clock } from 'lucide-react';

interface ActivityEvent {
    id: string;
    type: 'new_user' | 'match' | 'report' | 'swipe';
    content: string;
    timestamp: string;
    userName?: string;
}

const ActivityFeed: React.FC = () => {
    const [events, setEvents] = useState<ActivityEvent[]>([]);

    useEffect(() => {
        // Initial fetch of recent events (simulated logic using existing tables)
        const fetchInitialEvents = async () => {
            // we'll combine latest users and reports for the initial view
            const { data: users } = await supabase.from('profiles').select('id, name, created_at').order('created_at', { ascending: false }).limit(5);
            const { data: reports } = await supabase.from('reports').select('id, reporter_id, created_at').order('created_at', { ascending: false }).limit(5);

            const initial: ActivityEvent[] = [
                ...(users || []).map(u => ({
                    id: u.id,
                    type: 'new_user' as const,
                    content: `Novo usuário: ${u.name || 'Sem nome'}`,
                    timestamp: u.created_at
                })),
                ...(reports || []).map(r => ({
                    id: r.id,
                    type: 'report' as const,
                    content: `Nova denúncia recebida`,
                    timestamp: r.created_at
                }))
            ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setEvents(initial.slice(0, 10));
        };

        fetchInitialEvents();

        // Subscribe to changes
        const profilesChannel = supabase.channel('admin-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
                const newEvent: ActivityEvent = {
                    id: payload.new.id,
                    type: 'new_user',
                    content: `Novo usuário: ${payload.new.name || 'Sem nome'}`,
                    timestamp: payload.new.created_at
                };
                setEvents(prev => [newEvent, ...prev].slice(0, 20));
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, (payload) => {
                const newEvent: ActivityEvent = {
                    id: payload.new.id,
                    type: 'report',
                    content: `Nova denúncia recebida`,
                    timestamp: payload.new.created_at
                };
                setEvents(prev => [newEvent, ...prev].slice(0, 20));
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, (payload) => {
                const newEvent: ActivityEvent = {
                    id: payload.new.id,
                    type: 'match',
                    content: `Novo match aconteceu!`,
                    timestamp: payload.new.created_at
                };
                setEvents(prev => [newEvent, ...prev].slice(0, 20));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profilesChannel);
        };
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_user': return <UserPlus size={14} className="text-blue-500" />;
            case 'match': return <Heart size={14} className="text-pink-500" />;
            case 'report': return <AlertCircle size={14} className="text-red-500" />;
            default: return <Zap size={14} className="text-amber-500" />;
        }
    };

    return (
        <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-amber-500 animate-pulse" />
                    <h3 className="font-black text-zinc-900 uppercase tracking-wider text-xs">Atividade Real-time</h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar h-[300px]">
                {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-300 gap-2">
                        <Clock size={24} className="opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Aguardando eventos...</p>
                    </div>
                ) : (
                    events.map((event, i) => (
                        <div key={event.id + i} className="flex gap-3 p-3 bg-zinc-50/50 rounded-2xl border border-transparent hover:border-zinc-100 transition-all animate-in slide-in-from-right duration-500">
                            <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                {getIcon(event.type)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-zinc-900 truncate">{event.content}</p>
                                <p className="text-[10px] font-bold text-zinc-400 mt-0.5">
                                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-zinc-50/50 border-t border-zinc-50">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">
                    Acompanhando fluxo do sistema
                </p>
            </div>
        </div>
    );
};

export default ActivityFeed;
