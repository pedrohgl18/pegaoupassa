import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserRow } from '../types';

export const useAdminActions = (user: any) => {
    const logAdminAction = async (action: string, targetUserId?: string | null, details?: any) => {
        if (!user?.id) return;
        await supabase.from('admin_logs').insert({
            admin_id: user.id,
            action,
            target_user_id: targetUserId || null,
            details: details || null
        });
    };

    const toggleVip = async (userId: string, currentVip: boolean, refreshCallback: () => void) => {
        const updates: any = { is_vip: !currentVip };
        if (!currentVip) {
            updates.vip_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else {
            updates.vip_expires_at = null;
        }

        const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
        if (!error) {
            await logAdminAction(currentVip ? 'vip_removed' : 'vip_granted', userId, { duration_days: currentVip ? null : 30 });
            refreshCallback();
        }
    };

    const toggleBan = async (userId: string, currentActive: boolean, refreshCallback: () => void) => {
        if (currentActive && !confirm('Tem certeza que deseja banir este usuário?')) return;
        const { error } = await supabase.from('profiles').update({ is_active: !currentActive }).eq('id', userId);
        if (!error) {
            await logAdminAction(currentActive ? 'user_banned' : 'user_unbanned', userId);
            refreshCallback();
        }
    };

    const resetLikes = async (userId: string, refreshCallback: () => void) => {
        const { error } = await supabase.from('profiles').update({
            daily_likes_count: 0,
            daily_likes_reset_at: new Date().toISOString().split('T')[0]
        }).eq('id', userId);

        if (!error) {
            await logAdminAction('likes_reset', userId);
            refreshCallback();
        }
    };

    const resolveReport = async (reportId: string, reportedId: string, action: 'ban' | 'dismiss', reportedName: string, refreshCallback: () => void) => {
        if (action === 'ban') {
            if (!confirm(`Banir ${reportedName || 'usuário'}? Isso irá desativar a conta.`)) return;
            await supabase.from('profiles').update({ is_active: false }).eq('id', reportedId);
        }

        const { error } = await supabase.from('reports').update({
            status: action === 'ban' ? 'resolved' : 'dismissed'
        }).eq('id', reportId);

        if (!error) {
            await logAdminAction(
                action === 'ban' ? 'report_resolved' : 'report_dismissed',
                reportedId,
                { report_id: reportId }
            );
            refreshCallback();
        }
    };

    const fetchChatEvidence = async (user1Id: string, user2Id: string) => {
        // Encontrar o match entre os dois
        const { data: matchData } = await supabase
            .from('matches')
            .select('id')
            .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
            .maybeSingle();

        if (!matchData) return [];

        // Encontrar a conversa
        const { data: convData } = await supabase
            .from('conversations')
            .select('id')
            .eq('match_id', matchData.id)
            .maybeSingle();

        if (!convData) return [];

        // Buscar as últimas 50 mensagens
        const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convData.id)
            .order('created_at', { ascending: true })
            .limit(50);

        return messages || [];
    };

    const sendBroadcast = async (title: string, body: string) => {
        // Obter todos os push tokens
        const { data: tokens } = await supabase
            .from('push_tokens')
            .select('token');

        if (!tokens || tokens.length === 0) return { success: false, count: 0 };

        // Chamar a Edge Function para enviar (em lote - simplificado)
        // Para um sistema real, faríamos batching de 100 em 100
        const { error } = await supabase.functions.invoke('send-push-notification', {
            body: {
                tokens: tokens.map(t => t.token),
                title,
                body,
                data: { type: 'system_broadcast' }
            }
        });

        if (!error) {
            await logAdminAction('broadcast_sent', 'all_users', `Título: ${title}`);
        }

        return { success: !error, count: tokens.length };
    };

    const fetchVouchers = async () => {
        const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });

        return data || [];
    };

    const createVoucher = async (code: string, type: string, limit: number) => {
        const { error } = await supabase.from('promo_codes').insert({
            code: code.toUpperCase(),
            type,
            usage_limit: limit,
            status: 'active'
        });

        if (!error) {
            await logAdminAction('voucher_created', 'system', `Código: ${code}`);
        }
        return !error;
    };

    const deleteVoucher = async (id: string) => {
        const { error } = await supabase.from('promo_codes').delete().eq('id', id);
        return !error;
    };

    const fetchUserCoordinates = async () => {
        const { data, error } = await supabase.rpc('get_user_coordinates');
        return data || [];
    };

    return {
        toggleVip,
        toggleBan,
        resetLikes,
        resolveReport,
        logAdminAction,
        fetchChatEvidence,
        sendBroadcast,
        fetchVouchers,
        createVoucher,
        deleteVoucher,
        fetchUserCoordinates
    };
};
