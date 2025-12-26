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

    return {
        toggleVip,
        toggleBan,
        resetLikes,
        resolveReport,
        logAdminAction
    };
};
