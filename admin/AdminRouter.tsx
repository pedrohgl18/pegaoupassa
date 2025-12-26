import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Shield, RefreshCw } from 'lucide-react';

// Shared Types
import { AdminStats, UserRow, GeoData, QuotaInfo, ReportRow, AdminLog, AdminAlert, AdminTab, StorageBucket } from './types';

// Layout
import AdminLayout from './AdminLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import GeographyPage from './pages/GeographyPage';
import VoucherPage from './pages/VoucherPage';
import QuotaPage from './pages/QuotaPage';
import LogsPage from './pages/LogsPage';
import BroadcastPage from './pages/BroadcastPage';

// Logic Hook
import { useAdminActions } from './hooks/useAdminActions';

const ADMIN_EMAIL = 'pedrohgl18@gmail.com';

interface AdminRouterProps {
    onClose: () => void;
}

const AdminRouter: React.FC<AdminRouterProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
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
    const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
    const [alerts, setAlerts] = useState<AdminAlert[]>([]);
    const [databaseSize, setDatabaseSize] = useState<string>('');
    const [databaseSizeBytes, setDatabaseSizeBytes] = useState<number>(0);
    const [storageData, setStorageData] = useState<StorageBucket[]>([]);
    const [totalStorageBytes, setTotalStorageBytes] = useState<number>(0);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [userCoords, setUserCoords] = useState<{ lat: number, lng: number }[]>([]);

    const isAdmin = user?.email === ADMIN_EMAIL;
    const actions = useAdminActions(user);

    // Data Loaders
    const fetchStats = async () => {
        try {
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true);
            const today = new Date().toISOString().split('T')[0];
            const { count: newToday } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            const { count: newWeek } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo);
            const { count: totalMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true });
            const { count: totalSwipes } = await supabase.from('swipes').select('*', { count: 'exact', head: true });
            const { count: likesCount } = await supabase.from('swipes').select('*', { count: 'exact', head: true }).eq('action', 'like');
            const { count: passesCount } = await supabase.from('swipes').select('*', { count: 'exact', head: true }).eq('action', 'pass');
            const now = new Date().toISOString();
            const { count: vipUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_vip', true).gt('vip_expires_at', now);
            const matchRate = likesCount && likesCount > 0 ? ((totalMatches || 0) * 2 / likesCount * 100) : 0;

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
            await fetchAlerts();
        } catch (err) { }
    };

    const fetchAlerts = async () => {
        const newAlerts: AdminAlert[] = [];
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: suspectUsers } = await supabase.from('swipes').select('swiper_id').eq('action', 'like').gte('created_at', hourAgo);
        if (suspectUsers) {
            const counts: Record<string, number> = {};
            suspectUsers.forEach(s => counts[s.swiper_id] = (counts[s.swiper_id] || 0) + 1);
            const suspects = Object.entries(counts).filter(([_, c]) => c > 100);
            if (suspects.length > 0) newAlerts.push({ type: 'danger', title: 'Usuário Suspeito', description: `${suspects.length} usuário(s) com >100 likes na última hora` });
        }
        const { count: pendingReports } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        if (pendingReports && pendingReports > 5) newAlerts.push({ type: 'warning', title: 'Denúncias Pendentes', description: `${pendingReports} denúncias aguardando revisão` });
        setAlerts(newAlerts);
    };

    const fetchUsers = async () => {
        let query = supabase.from('profiles').select('id, name, email, city, state, is_vip, vip_expires_at, is_active, created_at, photos(url)').order('created_at', { ascending: false }).limit(100);
        if (searchTerm) query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        if (filterState) query = query.eq('state', filterState);
        if (filterVip === 'vip') query = query.eq('is_vip', true); else if (filterVip === 'free') query = query.eq('is_vip', false);
        const { data } = await query;
        setUsers(data || []);
    };

    const fetchGeoData = async () => {
        const column = geoGroupBy;
        const { data } = await supabase.from('profiles').select(column).not(column, 'is', null).eq('is_active', true);
        if (data) {
            const counts: Record<string, number> = {};
            data.forEach((row: any) => { const val = row[column]; if (val) counts[val] = (counts[val] || 0) + 1; });
            setGeoData(Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 15));
        }
    };

    const fetchQuotas = async () => {
        try {
            const { data, error } = await supabase.rpc('get_database_metrics');
            if (!error && data) {
                setDatabaseSize(data.database_size_pretty || '');
                setDatabaseSizeBytes(data.database_size_bytes || 0);
                if (data.storage && Array.isArray(data.storage)) {
                    const buckets = data.storage.map((s: any) => ({ bucketId: s.bucket_id, filesCount: s.files_count, totalBytes: parseInt(s.total_bytes) || 0 }));
                    setStorageData(buckets);
                    setTotalStorageBytes(buckets.reduce((sum, b) => sum + b.totalBytes, 0));
                }
                if (data.tables && Array.isArray(data.tables)) {
                    setQuotas(data.tables.map((t: any) => ({ tableName: t.table_name, sizeBytes: t.size_bytes, sizePretty: t.size_pretty })));
                }
            }
        } catch (err) { }
    };

    const fetchReports = async () => {
        let query = supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(name, email, photos(url)), reported:profiles!reports_reported_id_fkey(name, email, photos(url), is_active)').order('created_at', { ascending: false });
        if (reportsFilter === 'pending') query = query.eq('status', 'pending');
        const { data } = await query.limit(50);
        setReports(data || []);
    };

    const fetchLogs = async () => {
        const { data } = await supabase.from('admin_logs').select('*, target_user:profiles!admin_logs_target_user_id_fkey(name, email)').order('created_at', { ascending: false }).limit(50);
        setAdminLogs(data || []);
    };

    const fetchVouchersData = async () => {
        const data = await actions.fetchVouchers();
        setVouchers(data || []);
    };

    const fetchCoords = async () => {
        const data = await actions.fetchUserCoordinates();
        setUserCoords(data || []);
    };

    // Effects
    useEffect(() => { if (isAdmin) { fetchStats(); fetchQuotas(); setLoading(false); } }, [isAdmin]);
    useEffect(() => { if (isAdmin && activeTab === 'users') fetchUsers(); }, [activeTab, searchTerm, filterState, filterVip]);
    useEffect(() => { if (isAdmin && activeTab === 'geography') fetchGeoData(); }, [activeTab, geoGroupBy]);
    useEffect(() => { if (isAdmin && activeTab === 'reports') fetchReports(); }, [activeTab, reportsFilter]);
    useEffect(() => { if (isAdmin && activeTab === 'logs') fetchLogs(); }, [activeTab]);
    useEffect(() => { if (isAdmin && activeTab === 'vouchers') fetchVouchersData(); }, [activeTab]);
    useEffect(() => { if (isAdmin && (activeTab === 'dashboard' || activeTab === 'geography')) fetchCoords(); }, [activeTab]);

    const handleImpersonate = (userId: string) => {
        const url = new URL(window.location.origin);
        url.searchParams.set('impersonate', userId);
        window.open(url.toString(), '_blank');
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-10 shadow-xl text-center max-w-sm border border-zinc-100">
                    <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-zinc-900 mb-2">Acesso Negado</h2>
                    <p className="text-zinc-500 mb-8 font-medium">Você não tem permissão para acessar o painel administrativo.</p>
                    <button onClick={onClose} className="w-full px-6 py-4 bg-violet-600 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-100">
                        Voltar ao App
                    </button>
                </div>
            </div>
        );
    }

    const renderCurrentPage = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardPage stats={stats} alerts={alerts} />;
            case 'users': return (
                <UsersPage
                    users={users}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterVip={filterVip}
                    setFilterVip={setFilterVip}
                    filterState={filterState}
                    setFilterState={setFilterState}
                    onToggleVip={(id, val) => actions.toggleVip(id, val, fetchUsers)}
                    onToggleBan={(id, val) => actions.toggleBan(id, val, fetchUsers)}
                    onResetLikes={(id) => actions.resetLikes(id, fetchUsers)}
                    onFetchEvidence={actions.fetchChatEvidence}
                    onImpersonate={handleImpersonate}
                />
            );
            case 'reports': return (
                <ReportsPage
                    reports={reports}
                    filter={reportsFilter}
                    setFilter={setReportsFilter}
                    onResolve={(rid, targetId, act, name) => actions.resolveReport(rid, targetId, act, name, fetchReports)}
                    onFetchEvidence={actions.fetchChatEvidence}
                />
            );
            case 'geography': return <GeographyPage geoData={geoData} geoGroupBy={geoGroupBy} setGeoGroupBy={setGeoGroupBy} userCoords={userCoords} />;
            case 'quota': return (
                <QuotaPage
                    databaseSize={databaseSize}
                    databaseSizeBytes={databaseSizeBytes}
                    totalStorageBytes={totalStorageBytes}
                    storageData={storageData}
                    quotas={quotas}
                    onRefresh={fetchQuotas}
                />
            );
            case 'logs': return <LogsPage logs={adminLogs} />;
            case 'vouchers': return (
                <VoucherPage
                    vouchers={vouchers}
                    onCreate={actions.createVoucher}
                    onDelete={actions.deleteVoucher}
                    refresh={fetchVouchersData}
                />
            );
            case 'broadcast': return <BroadcastPage onSendBroadcast={actions.sendBroadcast} />;
            default: return <DashboardPage stats={stats} alerts={alerts} userCoords={userCoords} />;
        }
    };

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} onClose={onClose} adminEmail={ADMIN_EMAIL}>
            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <RefreshCw className="w-10 h-10 text-violet-500 animate-spin" />
                </div>
            ) : renderCurrentPage()}
        </AdminLayout>
    );
};

export default AdminRouter;
