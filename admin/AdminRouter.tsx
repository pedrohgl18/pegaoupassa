import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ArrowLeft, LayoutDashboard, Users, MapPin, Database, Shield, Crown, Ban, Search, ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle, XCircle, TrendingUp, FileText, Eye, RotateCcw, Bell, X } from 'lucide-react';

// ============================================
// CONSTANTES DE ACESSO
// ============================================
const ADMIN_EMAIL = 'pedrohgl18@gmail.com';

// ============================================
// TIPOS
// ============================================
interface AdminStats {
    totalUsers: number;
    newToday: number;
    newWeek: number;
    totalMatches: number;
    totalSwipes: number;
    likesCount: number;
    passesCount: number;
    vipUsers: number;
    matchRate: number;
}

interface UserRow {
    id: string;
    name: string;
    email: string;
    city: string | null;
    state: string | null;
    is_vip: boolean;
    vip_expires_at: string | null;
    is_active: boolean;
    created_at: string;
    photos: { url: string }[];
}

interface GeoData {
    name: string;
    count: number;
}

interface QuotaInfo {
    tableName: string;
    rowCount: number;
    sizeBytes: number;
    sizeFormatted: string;
}

interface ReportRow {
    id: string;
    reporter_id: string;
    reported_id: string;
    reason: string;
    description: string | null;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    reporter: { name: string; email: string; photos: { url: string }[] };
    reported: { name: string; email: string; photos: { url: string }[]; is_active: boolean };
}

interface AdminLog {
    id: string;
    admin_id: string;
    action: string;
    target_user_id: string | null;
    details: any;
    created_at: string;
    target_user?: { name: string; email: string };
}

interface AdminAlert {
    type: 'warning' | 'danger';
    title: string;
    description: string;
}

// ============================================
// COMPONENTES
// ============================================

// Stats Card
const StatsCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
}> = ({ title, value, icon, color = 'violet', subtitle }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-sm font-medium">{title}</span>
            <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                {icon}
            </div>
        </div>
        <div className="text-2xl font-bold text-zinc-900">{value}</div>
        {subtitle && <div className="text-xs text-zinc-400 mt-1">{subtitle}</div>}
    </div>
);

// Quota Alert
const QuotaAlert: React.FC<{ percentage: number; label: string }> = ({ percentage, label }) => {
    const getColor = () => {
        if (percentage >= 90) return 'red';
        if (percentage >= 70) return 'yellow';
        return 'green';
    };

    const color = getColor();

    return (
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-100">
            <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
            <div className="flex-1">
                <div className="text-sm font-medium text-zinc-700">{label}</div>
                <div className="w-full bg-zinc-100 rounded-full h-2 mt-1">
                    <div
                        className={`h-2 rounded-full bg-${color}-500`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>
            <span className={`text-sm font-medium text-${color}-600`}>{percentage.toFixed(1)}%</span>
        </div>
    );
};

// ============================================
// ADMIN ROUTER PRINCIPAL
// ============================================
interface AdminRouterProps {
    onClose: () => void;
}

const AdminRouter: React.FC<AdminRouterProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'geography' | 'quota' | 'reports' | 'analytics' | 'logs'>('dashboard');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [geoData, setGeoData] = useState<GeoData[]>([]);
    const [geoGroupBy, setGeoGroupBy] = useState<'state' | 'city' | 'neighborhood'>('state');
    const [quotas, setQuotas] = useState<QuotaInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterState, setFilterState] = useState('');
    const [filterVip, setFilterVip] = useState<'all' | 'vip' | 'free'>('all');
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [reportsFilter, setReportsFilter] = useState<'pending' | 'all'>('pending');
    const [growthData, setGrowthData] = useState<{ date: string; users: number; matches: number }[]>([]);
    const [growthPeriod, setGrowthPeriod] = useState<7 | 30>(7);
    const [analyticsView, setAnalyticsView] = useState<'growth' | 'geo'>('growth');
    const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [databaseSize, setDatabaseSize] = useState<string>('');
    const [databaseSizeBytes, setDatabaseSizeBytes] = useState<number>(0);

    // Verificar acesso
    const isAdmin = user?.email === ADMIN_EMAIL;

    // Buscar estatísticas
    const fetchStats = async () => {
        setLoading(true);
        try {
            // Total de usuários ativos
            const { count: totalUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);

            // Novos hoje
            const today = new Date().toISOString().split('T')[0];
            const { count: newToday } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today);

            // Novos na semana
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { count: newWeek } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', weekAgo);

            // Total de matches
            const { count: totalMatches } = await supabase
                .from('matches')
                .select('*', { count: 'exact', head: true });

            // Swipes
            const { count: totalSwipes } = await supabase
                .from('swipes')
                .select('*', { count: 'exact', head: true });

            const { count: likesCount } = await supabase
                .from('swipes')
                .select('*', { count: 'exact', head: true })
                .eq('action', 'like');

            const { count: passesCount } = await supabase
                .from('swipes')
                .select('*', { count: 'exact', head: true })
                .eq('action', 'pass');

            // VIPs ativos
            const now = new Date().toISOString();
            const { count: vipUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('is_vip', true)
                .gt('vip_expires_at', now);

            // Taxa de match
            const matchRate = likesCount && likesCount > 0
                ? ((totalMatches || 0) * 2 / likesCount * 100)
                : 0;

            setStats({
                totalUsers: totalUsers || 0,
                newToday: newToday || 0,
                newWeek: newWeek || 0,
                totalMatches: totalMatches || 0,
                totalSwipes: totalSwipes || 0,
                likesCount: likesCount || 0,
                passesCount: passesCount || 0,
                vipUsers: vipUsers || 0,
                matchRate,
            });

            // Buscar alertas automáticos
            await fetchAlerts();
        } catch (err) {
            console.error('Erro ao buscar stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // Buscar alertas automáticos
    const fetchAlerts = async () => {
        const newAlerts: AdminAlert[] = [];

        // 1. Usuário suspeito (>100 likes em 1 hora)
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: suspectUsers } = await supabase
            .from('swipes')
            .select('swiper_id')
            .eq('action', 'like')
            .gte('created_at', hourAgo);

        if (suspectUsers) {
            const counts: Record<string, number> = {};
            suspectUsers.forEach(s => {
                counts[s.swiper_id] = (counts[s.swiper_id] || 0) + 1;
            });
            const suspects = Object.entries(counts).filter(([_, c]) => c > 100);
            if (suspects.length > 0) {
                newAlerts.push({
                    type: 'danger',
                    title: 'Usuário Suspeito',
                    description: `${suspects.length} usuário(s) com >100 likes na última hora`
                });
            }
        }

        // 2. Denúncias em massa (3+ reports em 24h)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentReports } = await supabase
            .from('reports')
            .select('reported_id')
            .gte('created_at', dayAgo);

        if (recentReports) {
            const reportCounts: Record<string, number> = {};
            recentReports.forEach(r => {
                reportCounts[r.reported_id] = (reportCounts[r.reported_id] || 0) + 1;
            });
            const massReported = Object.entries(reportCounts).filter(([_, c]) => c >= 3);
            if (massReported.length > 0) {
                newAlerts.push({
                    type: 'danger',
                    title: 'Denúncias em Massa',
                    description: `${massReported.length} usuário(s) com 3+ denúncias em 24h`
                });
            }
        }

        // 3. Alerta de Quota (simulado - 400 usuários como threshold)
        const { count: totalProfiles } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (totalProfiles && totalProfiles > 400) {
            newAlerts.push({
                type: 'warning',
                title: 'Quota de Banco',
                description: `${totalProfiles} perfis cadastrados. Considere monitorar tamanho do DB.`
            });
        }

        // 4. Denúncias pendentes
        const { count: pendingReports } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (pendingReports && pendingReports > 5) {
            newAlerts.push({
                type: 'warning',
                title: 'Denúncias Pendentes',
                description: `${pendingReports} denúncias aguardando revisão`
            });
        }

        setAlerts(newAlerts);
    };

    // Buscar usuários
    const fetchUsers = async () => {
        let query = supabase
            .from('profiles')
            .select('id, name, email, city, state, is_vip, vip_expires_at, is_active, created_at, photos(url)')
            .order('created_at', { ascending: false })
            .limit(100);

        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        if (filterState) {
            query = query.eq('state', filterState);
        }
        if (filterVip === 'vip') {
            query = query.eq('is_vip', true);
        } else if (filterVip === 'free') {
            query = query.eq('is_vip', false);
        }

        const { data } = await query;
        setUsers(data || []);
    };

    // Buscar dados geográficos
    const fetchGeoData = async () => {
        const column = geoGroupBy;
        const { data } = await supabase
            .from('profiles')
            .select(column)
            .not(column, 'is', null)
            .eq('is_active', true);

        if (data) {
            const counts: Record<string, number> = {};
            data.forEach((row: any) => {
                const value = row[column];
                if (value) {
                    counts[value] = (counts[value] || 0) + 1;
                }
            });

            const sorted = Object.entries(counts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 15);

            setGeoData(sorted);
        }
    };

    // Buscar quotas com tamanho real do banco
    const fetchQuotas = async () => {
        const results: QuotaInfo[] = [];

        // Buscar tamanho total do banco via SQL
        const { data: dbSizeData } = await supabase.rpc('exec_sql', {
            query: "SELECT pg_database_size(current_database()) as size_bytes"
        }).single();

        // Como RPC pode não existir, vamos usar contagem por tabela
        const tables = ['profiles', 'swipes', 'matches', 'messages', 'photos', 'notifications', 'conversations', 'reports', 'admin_logs', 'push_tokens'];

        let totalRows = 0;
        for (const table of tables) {
            const { count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            const rowCount = count || 0;
            totalRows += rowCount;

            // Estimativa de tamanho (média de 1KB por registro)
            const estimatedBytes = rowCount * 1024;
            results.push({
                tableName: table,
                rowCount,
                sizeBytes: estimatedBytes,
                sizeFormatted: formatBytes(estimatedBytes)
            });
        }

        // Ordenar por tamanho
        results.sort((a, b) => b.sizeBytes - a.sizeBytes);

        // Estimar tamanho total do banco (base + dados)
        const totalEstimatedBytes = totalRows * 1024 + 5 * 1024 * 1024; // 5MB base overhead
        setDatabaseSize(formatBytes(totalEstimatedBytes));
        setDatabaseSizeBytes(totalEstimatedBytes);

        setQuotas(results);
    };

    // Helper para formatar bytes
    const formatBytes = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Ações de admin
    const toggleVip = async (userId: string, currentVip: boolean) => {
        const updates: any = { is_vip: !currentVip };

        if (!currentVip) {
            // Dar VIP por 30 dias
            updates.vip_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else {
            updates.vip_expires_at = null;
        }

        await supabase.from('profiles').update(updates).eq('id', userId);

        // Logar ação
        await logAdminAction(
            currentVip ? 'vip_removed' : 'vip_granted',
            userId,
            { duration_days: currentVip ? null : 30 }
        );

        fetchUsers();
    };

    const toggleBan = async (userId: string, currentActive: boolean) => {
        if (currentActive && !confirm('Tem certeza que deseja banir este usuário?')) return;

        await supabase.from('profiles').update({ is_active: !currentActive }).eq('id', userId);

        // Logar ação
        await logAdminAction(
            currentActive ? 'user_banned' : 'user_unbanned',
            userId
        );

        fetchUsers();
    };

    // Resetar likes diários
    const resetLikes = async (userId: string) => {
        await supabase.from('profiles').update({
            daily_likes_count: 0,
            daily_likes_reset_at: new Date().toISOString().split('T')[0]
        }).eq('id', userId);

        await logAdminAction('likes_reset', userId);
        fetchUsers();
    };

    // Função de logging
    const logAdminAction = async (action: string, targetUserId?: string | null, details?: any) => {
        if (!user?.id) return;

        await supabase.from('admin_logs').insert({
            admin_id: user.id,
            action,
            target_user_id: targetUserId || null,
            details: details || null
        });
    };

    // Buscar logs
    const fetchLogs = async () => {
        const { data } = await supabase
            .from('admin_logs')
            .select(`
                *,
                target_user:profiles!admin_logs_target_user_id_fkey(name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        setAdminLogs(data || []);
    };

    // Buscar denúncias
    const fetchReports = async () => {
        let query = supabase
            .from('reports')
            .select(`
                *,
                reporter:profiles!reports_reporter_id_fkey(name, email, photos(url)),
                reported:profiles!reports_reported_id_fkey(name, email, photos(url), is_active)
            `)
            .order('created_at', { ascending: false });

        if (reportsFilter === 'pending') {
            query = query.eq('status', 'pending');
        }

        const { data } = await query.limit(50);
        setReports(data || []);
    };

    // Resolver denúncia
    const resolveReport = async (reportId: string, action: 'ban' | 'dismiss') => {
        const report = reports.find(r => r.id === reportId);
        if (!report) return;

        if (action === 'ban') {
            if (!confirm(`Banir ${report.reported?.name || 'usuário'}? Isso irá desativar a conta.`)) return;
            // Banir usuário
            await supabase.from('profiles').update({ is_active: false }).eq('id', report.reported_id);
        }

        // Atualizar status da denúncia
        await supabase.from('reports').update({
            status: action === 'ban' ? 'resolved' : 'dismissed'
        }).eq('id', reportId);

        // Logar ação
        await logAdminAction(
            action === 'ban' ? 'report_resolved' : 'report_dismissed',
            report.reported_id,
            { report_id: reportId, reason: report.reason }
        );

        fetchReports();
    };

    // Buscar dados de crescimento temporal
    const fetchGrowthData = async () => {
        const days = growthPeriod;
        const results: { date: string; users: number; matches: number }[] = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const nextDateStr = nextDate.toISOString().split('T')[0];

            // Contagem de usuários criados naquele dia
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', dateStr)
                .lt('created_at', nextDateStr);

            // Contagem de matches criados naquele dia
            const { count: matchesCount } = await supabase
                .from('matches')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', dateStr)
                .lt('created_at', nextDateStr);

            results.push({
                date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                users: usersCount || 0,
                matches: matchesCount || 0,
            });
        }

        setGrowthData(results);
    };

    // Effects
    useEffect(() => {
        if (isAdmin) {
            fetchStats();
            fetchQuotas();
        }
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin && activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab, searchTerm, filterState, filterVip]);

    useEffect(() => {
        if (isAdmin && activeTab === 'geography') {
            fetchGeoData();
        }
    }, [activeTab, geoGroupBy]);

    useEffect(() => {
        if (isAdmin && activeTab === 'reports') {
            fetchReports();
        }
    }, [activeTab, reportsFilter]);

    useEffect(() => {
        if (isAdmin && activeTab === 'analytics') {
            fetchGrowthData();
        }
    }, [activeTab, growthPeriod]);

    useEffect(() => {
        if (isAdmin && activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    // Se não é admin, bloqueia
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-zinc-900 mb-2">Acesso Negado</h2>
                    <p className="text-zinc-500 mb-4">Você não tem permissão para acessar o painel administrativo.</p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-violet-500 text-white rounded-lg font-medium"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    // Render tabs
    const renderContent = () => {
        if (loading && activeTab === 'dashboard') {
            return (
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-zinc-900">Dashboard</h2>

                        {/* Alertas Automáticos */}
                        {alerts.length > 0 && (
                            <div className="space-y-2">
                                {alerts.map((alert, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-start gap-3 p-3 rounded-lg ${alert.type === 'danger' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
                                            }`}
                                    >
                                        <Bell className={`w-5 h-5 flex-shrink-0 ${alert.type === 'danger' ? 'text-red-600' : 'text-amber-600'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-medium text-sm ${alert.type === 'danger' ? 'text-red-800' : 'text-amber-800'
                                                }`}>{alert.title}</div>
                                            <div className={`text-xs ${alert.type === 'danger' ? 'text-red-600' : 'text-amber-600'
                                                }`}>{alert.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* KPIs Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <StatsCard
                                title="Usuários Ativos"
                                value={stats?.totalUsers || 0}
                                icon={<Users className="w-4 h-4 text-violet-600" />}
                                color="violet"
                            />
                            <StatsCard
                                title="Novos Hoje"
                                value={stats?.newToday || 0}
                                icon={<Users className="w-4 h-4 text-green-600" />}
                                color="green"
                                subtitle={`${stats?.newWeek || 0} na semana`}
                            />
                            <StatsCard
                                title="Total Matches"
                                value={stats?.totalMatches || 0}
                                icon={<span className="text-pink-600">💕</span>}
                                color="pink"
                            />
                            <StatsCard
                                title="Taxa de Match"
                                value={`${stats?.matchRate.toFixed(1) || 0}%`}
                                icon={<span className="text-orange-600">📊</span>}
                                color="orange"
                            />
                            <StatsCard
                                title="Total Swipes"
                                value={stats?.totalSwipes || 0}
                                icon={<span className="text-blue-600">👆</span>}
                                color="blue"
                                subtitle={`${stats?.likesCount || 0} likes / ${stats?.passesCount || 0} passes`}
                            />
                            <StatsCard
                                title="VIPs Ativos"
                                value={stats?.vipUsers || 0}
                                icon={<Crown className="w-4 h-4 text-amber-600" />}
                                color="amber"
                            />
                        </div>

                        {/* Quota Alerts */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-zinc-700">Status do Banco</h3>
                            {quotas.slice(0, 4).map(q => (
                                <QuotaAlert
                                    key={q.tableName}
                                    label={`${q.tableName}: ${q.rowCount.toLocaleString()} registros`}
                                    percentage={(q.rowCount / 10000) * 100} // Estimativa baseada em 10k rows
                                />
                            ))}
                        </div>
                    </div>
                );

            case 'users':
                return (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-zinc-900">Usuários</h2>

                        {/* Search & Filters */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-lg text-sm"
                                />
                            </div>

                            <div className="flex gap-2">
                                <select
                                    value={filterVip}
                                    onChange={(e) => setFilterVip(e.target.value as any)}
                                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                                >
                                    <option value="all">Todos</option>
                                    <option value="vip">VIP</option>
                                    <option value="free">Free</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Estado..."
                                    value={filterState}
                                    onChange={(e) => setFilterState(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {users.map(u => (
                                <div key={u.id} className="bg-white rounded-lg p-3 border border-zinc-100 flex items-center gap-3">
                                    <img
                                        src={u.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${u.name}`}
                                        className="w-10 h-10 rounded-full object-cover"
                                        alt=""
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-zinc-900 truncate">{u.name || 'Sem nome'}</span>
                                            {u.is_vip && <Crown className="w-3 h-3 text-amber-500" />}
                                            {!u.is_active && <span className="text-xs text-red-500">BANIDO</span>}
                                        </div>
                                        <div className="text-xs text-zinc-500 truncate">{u.email}</div>
                                        {u.city && <div className="text-xs text-zinc-400">{u.city}, {u.state}</div>}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => toggleVip(u.id, u.is_vip)}
                                            className={`p-2 rounded-lg ${u.is_vip ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500'}`}
                                            title={u.is_vip ? 'Remover VIP' : 'Dar VIP'}
                                        >
                                            <Crown className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleBan(u.id, u.is_active)}
                                            className={`p-2 rounded-lg ${!u.is_active ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}
                                            title={u.is_active ? 'Banir' : 'Desbanir'}
                                        >
                                            <Ban className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => resetLikes(u.id)}
                                            className="p-2 rounded-lg bg-zinc-100 text-zinc-500"
                                            title="Resetar Likes"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedUser(u)}
                                            className="p-2 rounded-lg bg-violet-100 text-violet-600"
                                            title="Ver Perfil"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <div className="text-center py-8 text-zinc-400">Nenhum usuário encontrado</div>
                            )}
                        </div>
                    </div>
                );

            case 'geography':
                return (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-zinc-900">Distribuição Geográfica</h2>

                        {/* Toggle */}
                        <div className="flex gap-2">
                            {(['state', 'city', 'neighborhood'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setGeoGroupBy(type)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${geoGroupBy === type
                                        ? 'bg-violet-500 text-white'
                                        : 'bg-zinc-100 text-zinc-600'
                                        }`}
                                >
                                    {type === 'state' ? 'Estado' : type === 'city' ? 'Cidade' : 'Bairro'}
                                </button>
                            ))}
                        </div>

                        {/* Bar Chart */}
                        <div className="space-y-2">
                            {geoData.map((item, i) => {
                                const maxCount = geoData[0]?.count || 1;
                                const percentage = (item.count / maxCount) * 100;

                                return (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <span className="w-6 text-xs text-zinc-400 text-right">{i + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-zinc-700 truncate">{item.name}</span>
                                                <span className="text-zinc-500">{item.count}</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-violet-500 transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {geoData.length === 0 && (
                                <div className="text-center py-8 text-zinc-400">Sem dados disponíveis</div>
                            )}
                        </div>
                    </div>
                );

            case 'quota':
                return (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-zinc-900">Monitoramento de Quotas</h2>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Database className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <div className="font-medium text-amber-800">Plano Free do Supabase</div>
                                    <div className="text-sm text-amber-700 mt-1">
                                        Database: 500 MB | Storage: 1 GB | Edge Functions: 500K/mês
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-zinc-700">Registros por Tabela</h3>
                            {quotas.map(q => (
                                <div key={q.tableName} className="bg-white rounded-lg p-3 border border-zinc-100">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-zinc-700 capitalize">{q.tableName}</span>
                                        <span className="text-sm text-zinc-500">{q.rowCount.toLocaleString()} registros</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => { fetchStats(); fetchQuotas(); }}
                            className="w-full py-3 bg-violet-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Atualizar Dados
                        </button>
                    </div>
                );

            case 'reports':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-900">Fila de Denúncias</h2>
                            <select
                                value={reportsFilter}
                                onChange={(e) => setReportsFilter(e.target.value as any)}
                                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm"
                            >
                                <option value="pending">Pendentes</option>
                                <option value="all">Todas</option>
                            </select>
                        </div>

                        {reports.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                <p className="text-zinc-500">Nenhuma denúncia pendente!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reports.map(r => (
                                    <div key={r.id} className="bg-white rounded-xl p-4 border border-zinc-100 shadow-sm">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className={`w-4 h-4 ${r.status === 'pending' ? 'text-amber-500' :
                                                    r.status === 'resolved' ? 'text-red-500' : 'text-zinc-400'
                                                    }`} />
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    r.status === 'resolved' ? 'bg-red-100 text-red-700' :
                                                        'bg-zinc-100 text-zinc-600'
                                                    }`}>
                                                    {r.status === 'pending' ? 'Pendente' :
                                                        r.status === 'resolved' ? 'Banido' : 'Ignorado'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-zinc-400">
                                                {new Date(r.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>

                                        {/* Reported User */}
                                        <div className="flex items-center gap-3 mb-3 p-2 bg-red-50 rounded-lg">
                                            <img
                                                src={r.reported?.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${r.reported?.name}`}
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt=""
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-zinc-900 truncate">
                                                        {r.reported?.name || 'Usuário'}
                                                    </span>
                                                    {!r.reported?.is_active && (
                                                        <span className="text-xs text-red-500">BANIDO</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-zinc-500">Denunciado</div>
                                            </div>
                                        </div>

                                        {/* Reason */}
                                        <div className="mb-3">
                                            <div className="text-xs font-medium text-zinc-500 mb-1">Motivo</div>
                                            <div className="text-sm text-zinc-800 font-medium">{r.reason}</div>
                                            {r.description && (
                                                <div className="text-sm text-zinc-600 mt-1">{r.description}</div>
                                            )}
                                        </div>

                                        {/* Reporter */}
                                        <div className="text-xs text-zinc-400 mb-3">
                                            Reportado por: {r.reporter?.name || 'Anônimo'}
                                        </div>

                                        {/* Actions */}
                                        {r.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => resolveReport(r.id, 'ban')}
                                                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                    Banir Usuário
                                                </button>
                                                <button
                                                    onClick={() => resolveReport(r.id, 'dismiss')}
                                                    className="flex-1 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Ignorar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'analytics':
                const maxValue = Math.max(
                    ...growthData.map(d => Math.max(d.users, d.matches)),
                    1
                );

                return (
                    <div className="space-y-4">
                        {/* Sub-navegação interna */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setAnalyticsView('growth'); fetchGrowthData(); }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${analyticsView === 'growth'
                                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-200'
                                    : 'bg-white text-zinc-600 border border-zinc-200'
                                    }`}
                            >
                                <TrendingUp className="w-4 h-4" />
                                Crescimento
                            </button>
                            <button
                                onClick={() => { setAnalyticsView('geo'); fetchGeoData(); }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${analyticsView === 'geo'
                                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-200'
                                    : 'bg-white text-zinc-600 border border-zinc-200'
                                    }`}
                            >
                                <MapPin className="w-4 h-4" />
                                Geografia
                            </button>
                        </div>

                        {/* Conteúdo: Crescimento */}
                        {analyticsView === 'growth' && (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-zinc-700">Novos por dia</h3>
                                    <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setGrowthPeriod(7)}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${growthPeriod === 7 ? 'bg-white text-violet-600 shadow-sm' : 'text-zinc-500'
                                                }`}
                                        >
                                            7d
                                        </button>
                                        <button
                                            onClick={() => setGrowthPeriod(30)}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${growthPeriod === 30 ? 'bg-white text-violet-600 shadow-sm' : 'text-zinc-500'
                                                }`}
                                        >
                                            30d
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded bg-violet-500" />
                                        <span className="text-zinc-600">Usuários</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded bg-pink-500" />
                                        <span className="text-zinc-600">Matches</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-4 border border-zinc-100">
                                    {growthData.length === 0 ? (
                                        <div className="flex items-center justify-center h-32">
                                            <RefreshCw className="w-6 h-6 text-violet-500 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {growthData.map((day) => (
                                                <div key={day.date} className="flex items-center gap-2">
                                                    <span className="w-10 text-xs text-zinc-400 text-right">{day.date}</span>
                                                    <div className="flex-1 flex gap-1">
                                                        <div
                                                            className="h-3 bg-violet-500 rounded-sm"
                                                            style={{ width: `${(day.users / maxValue) * 50}%`, minWidth: day.users > 0 ? '3px' : '0' }}
                                                        />
                                                        <div
                                                            className="h-3 bg-pink-500 rounded-sm"
                                                            style={{ width: `${(day.matches / maxValue) * 50}%`, minWidth: day.matches > 0 ? '3px' : '0' }}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 text-xs w-12 justify-end">
                                                        <span className="text-violet-600">{day.users}</span>
                                                        <span className="text-pink-500">{day.matches}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                                        <div className="text-xl font-bold text-violet-600">
                                            {growthData.reduce((sum, d) => sum + d.users, 0)}
                                        </div>
                                        <div className="text-xs text-violet-500">Usuários ({growthPeriod}d)</div>
                                    </div>
                                    <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                                        <div className="text-xl font-bold text-pink-600">
                                            {growthData.reduce((sum, d) => sum + d.matches, 0)}
                                        </div>
                                        <div className="text-xs text-pink-500">Matches ({growthPeriod}d)</div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Conteúdo: Geografia */}
                        {analyticsView === 'geo' && (
                            <>
                                <div className="flex gap-2">
                                    {(['state', 'city', 'neighborhood'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setGeoGroupBy(type)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${geoGroupBy === type
                                                ? 'bg-violet-100 text-violet-700'
                                                : 'bg-zinc-100 text-zinc-500'
                                                }`}
                                        >
                                            {type === 'state' ? 'Estado' : type === 'city' ? 'Cidade' : 'Bairro'}
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-white rounded-xl p-4 border border-zinc-100 space-y-2">
                                    {geoData.length === 0 ? (
                                        <div className="flex items-center justify-center h-32">
                                            <RefreshCw className="w-6 h-6 text-violet-500 animate-spin" />
                                        </div>
                                    ) : (
                                        geoData.map((item, i) => {
                                            const maxCount = geoData[0]?.count || 1;
                                            const percentage = (item.count / maxCount) * 100;

                                            return (
                                                <div key={item.name} className="flex items-center gap-2">
                                                    <span className="w-5 text-xs text-zinc-400 text-right">{i + 1}</span>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="font-medium text-zinc-700 truncate">{item.name}</span>
                                                            <span className="text-zinc-500">{item.count}</span>
                                                        </div>
                                                        <div className="w-full bg-zinc-100 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full bg-violet-500"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        )}

                        <button
                            onClick={() => analyticsView === 'growth' ? fetchGrowthData() : fetchGeoData()}
                            className="w-full py-2.5 bg-violet-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Atualizar
                        </button>
                    </div>
                );

            case 'quota':
                const FREE_TIER_LIMIT = 500 * 1024 * 1024; // 500 MB
                const usagePercent = (databaseSizeBytes / FREE_TIER_LIMIT) * 100;

                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-900">Monitoramento de Quota</h2>
                            <button
                                onClick={fetchQuotas}
                                className="p-2 text-violet-500 hover:bg-violet-50 rounded-lg"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Card de Uso Total */}
                        <div className={`rounded-xl p-4 border ${usagePercent > 80 ? 'bg-red-50 border-red-200' :
                                usagePercent > 50 ? 'bg-amber-50 border-amber-200' :
                                    'bg-green-50 border-green-200'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-zinc-700">Banco de Dados (Est.)</span>
                                <span className={`text-sm font-bold ${usagePercent > 80 ? 'text-red-600' :
                                        usagePercent > 50 ? 'text-amber-600' :
                                            'text-green-600'
                                    }`}>
                                    {databaseSize || '...'} / 500 MB
                                </span>
                            </div>
                            <div className="w-full bg-white rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' :
                                            usagePercent > 50 ? 'bg-amber-500' :
                                                'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                />
                            </div>
                            <div className="text-xs text-zinc-500 mt-2">
                                Free Tier: 500 MB máximo • {usagePercent.toFixed(1)}% usado
                            </div>
                        </div>

                        {/* Tabelas por Tamanho */}
                        <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
                            <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100">
                                <span className="text-sm font-medium text-zinc-700">Tamanho por Tabela</span>
                            </div>
                            <div className="divide-y divide-zinc-100">
                                {quotas.map((q, i) => (
                                    <div key={q.tableName} className="flex items-center justify-between px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 text-xs text-zinc-400 text-right">{i + 1}</span>
                                            <span className="text-sm text-zinc-700">{q.tableName}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-zinc-400">{q.rowCount.toLocaleString()} rows</span>
                                            <span className="text-xs font-medium text-zinc-600 w-16 text-right">{q.sizeFormatted}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Limites do Free Tier */}
                        <div className="bg-white rounded-xl p-4 border border-zinc-100 space-y-3">
                            <h3 className="text-sm font-medium text-zinc-700">Limites do Free Tier</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Database Size</span>
                                    <span className="text-zinc-700">500 MB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Storage</span>
                                    <span className="text-zinc-700">1 GB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Edge Functions</span>
                                    <span className="text-zinc-700">500K/mês</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Auth MAUs</span>
                                    <span className="text-zinc-700">50K/mês</span>
                                </div>
                            </div>
                        </div>

                        {/* Link para Dashboard */}
                        <a
                            href="https://supabase.com/dashboard/project/ardevnlnrorffyhdsytn/settings/usage"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-violet-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                        >
                            <Database className="w-4 h-4" />
                            Ver no Dashboard Supabase
                        </a>
                    </div>
                );

            case 'logs':
                const actionLabels: Record<string, { label: string; color: string }> = {
                    'vip_granted': { label: 'VIP Dado', color: 'amber' },
                    'vip_removed': { label: 'VIP Removido', color: 'zinc' },
                    'user_banned': { label: 'Usuário Banido', color: 'red' },
                    'user_unbanned': { label: 'Usuário Desbanido', color: 'green' },
                    'report_resolved': { label: 'Denúncia Resolvida', color: 'red' },
                    'report_dismissed': { label: 'Denúncia Ignorada', color: 'zinc' },
                };

                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-900">Logs de Auditoria</h2>
                            <button
                                onClick={fetchLogs}
                                className="p-2 text-violet-500 hover:bg-violet-50 rounded-lg"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {adminLogs.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                                <p className="text-zinc-500">Nenhuma ação registrada ainda</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {adminLogs.map(log => {
                                    const actionInfo = actionLabels[log.action] || { label: log.action, color: 'zinc' };

                                    return (
                                        <div key={log.id} className="bg-white rounded-lg p-3 border border-zinc-100">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${actionInfo.color}-100 text-${actionInfo.color}-700`}>
                                                    {actionInfo.label}
                                                </span>
                                                <span className="text-xs text-zinc-400">
                                                    {new Date(log.created_at).toLocaleString('pt-BR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {log.target_user && (
                                                <div className="text-sm text-zinc-700">
                                                    <span className="font-medium">{log.target_user.name}</span>
                                                    <span className="text-zinc-400 ml-1">({log.target_user.email})</span>
                                                </div>
                                            )}
                                            {log.details?.reason && (
                                                <div className="text-xs text-zinc-500 mt-1">
                                                    Motivo: {log.details.reason}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Header */}
            <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    <button onClick={onClose} className="p-2 -ml-2">
                        <ArrowLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <h1 className="font-bold text-zinc-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-violet-500" />
                        Admin Panel
                    </h1>
                    <div className="w-9" />
                </div>

                {/* Tabs com scroll horizontal */}
                <div className="flex overflow-x-auto border-t border-zinc-100 scrollbar-hide">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
                        { id: 'users', icon: Users, label: 'Users' },
                        { id: 'reports', icon: AlertTriangle, label: 'Reports' },
                        { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
                        { id: 'quota', icon: Database, label: 'Quota' },
                        { id: 'logs', icon: FileText, label: 'Logs' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-shrink-0 px-4 py-3 flex flex-col items-center gap-1 border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-violet-500 text-violet-600'
                                : 'border-transparent text-zinc-400'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal Ver Perfil */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white">
                            <h3 className="font-semibold text-zinc-900">Perfil Completo</h3>
                            <button onClick={() => setSelectedUser(null)} className="p-2 -mr-2">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        {/* Fotos */}
                        <div className="p-4 space-y-4">
                            {selectedUser.photos && selectedUser.photos.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedUser.photos.map((photo, i) => (
                                        <img
                                            key={i}
                                            src={photo.url}
                                            alt={`Foto ${i + 1}`}
                                            className="w-full aspect-square object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-zinc-100 rounded-lg p-8 text-center text-zinc-400">
                                    Sem fotos
                                </div>
                            )}

                            {/* Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg">{selectedUser.name || 'Sem nome'}</span>
                                    {selectedUser.is_vip && (
                                        <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">VIP</span>
                                    )}
                                    {!selectedUser.is_active && (
                                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Banido</span>
                                    )}
                                </div>
                                <div className="text-sm text-zinc-500">{selectedUser.email}</div>
                                {selectedUser.city && selectedUser.state && (
                                    <div className="text-sm text-zinc-500">📍 {selectedUser.city}, {selectedUser.state}</div>
                                )}
                                <div className="text-xs text-zinc-400">
                                    Criado em: {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}
                                </div>
                                {selectedUser.vip_expires_at && (
                                    <div className="text-xs text-amber-600">
                                        VIP até: {new Date(selectedUser.vip_expires_at).toLocaleDateString('pt-BR')}
                                    </div>
                                )}
                            </div>

                            {/* Ações Rápidas */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => { toggleVip(selectedUser.id, selectedUser.is_vip); setSelectedUser(null); }}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${selectedUser.is_vip ? 'bg-zinc-100 text-zinc-600' : 'bg-amber-500 text-white'
                                        }`}
                                >
                                    {selectedUser.is_vip ? 'Remover VIP' : 'Dar VIP'}
                                </button>
                                <button
                                    onClick={() => { toggleBan(selectedUser.id, selectedUser.is_active); setSelectedUser(null); }}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${selectedUser.is_active ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                        }`}
                                >
                                    {selectedUser.is_active ? 'Banir' : 'Desbanir'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminRouter;
