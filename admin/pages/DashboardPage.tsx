import React from 'react';
import { Users, TrendingUp, Activity, Smartphone } from 'lucide-react';
import { AdminStats, AdminAlert } from '../types';
import ActivityFeed from '../components/ActivityFeed';

interface DashboardPageProps {
    stats: AdminStats | null;
    alerts: AdminAlert[];
    userCoords: { lat: number, lng: number }[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ stats, alerts, userCoords }) => {
    return (
        <div className="space-y-8 pb-10">
            {/* Alertas */}
            {alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {alerts.map((alert, i) => (
                        <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border ${alert.type === 'danger'
                            ? 'bg-red-50 border-red-100 text-red-900'
                            : 'bg-amber-50 border-amber-100 text-amber-900'
                            }`}>
                            <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                <Activity size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-wide">{alert.title}</h4>
                                <p className="text-sm opacity-90 mt-0.5 font-medium">{alert.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI
                    title="Usuários Ativos"
                    value={stats?.totalUsers || 0}
                    trend={`+${stats?.newWeek || 0} na semana`}
                    icon={<Users size={24} />}
                    color="violet"
                />
                <KPI
                    title="Taxa de Match"
                    value={`${stats?.matchRate.toFixed(1) || 0}%`}
                    trend="Eficiência do Algoritmo"
                    icon={<TrendingUp size={24} />}
                    color="pink"
                />
                <KPI
                    title="Swipes Totais"
                    value={stats?.totalSwipes?.toLocaleString() || 0}
                    trend={`${stats?.likesCount?.toLocaleString()} Likes`}
                    icon={<Activity size={24} />}
                    color="blue"
                />
                <KPI
                    title="Assinantes VIP"
                    value={stats?.vipUsers || 0}
                    trend="Receita & Engajamento"
                    icon={<Smartphone size={24} />}
                    color="amber"
                />
            </div>

            {/* Main Stats Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Visual Analytics */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Activity Overview */}
                    <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm">
                        <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-violet-500" />
                            Visão Geral de Swipes
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <MetricBox label="Likes" value={stats?.likesCount || 0} color="green" />
                            <MetricBox label="Passes" value={stats?.passesCount || 0} color="red" />
                            <MetricBox label="Matches" value={stats?.totalMatches || 0} color="pink" />
                            <MetricBox label="Novos Hoje" value={stats?.newToday || 0} color="blue" />
                        </div>
                    </div>

                    {/* Live Heatmap Visualization */}
                    <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm overflow-hidden relative min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <TrendingUp size={20} className="text-pink-500" />
                                Distribuição Geográfica Real
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Heatmap</span>
                        </div>

                        <div className="h-64 bg-zinc-50 rounded-2xl border border-zinc-100 relative overflow-hidden">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>

                            {/* Render Coords as Heat Spots */}
                            {userCoords && userCoords.length > 0 ? (
                                userCoords.slice(0, 100).map((coord: any, idx: number) => {
                                    // Normalize for Brazil roughly: Lat -34 to 5, Lng -74 to -34
                                    const x = ((coord.lng + 74) / 40) * 100;
                                    const y = (1 - (coord.lat + 34) / 39) * 100;

                                    return (
                                        <div
                                            key={idx}
                                            className="absolute w-6 h-6 bg-pink-500/30 rounded-full blur-md animate-pulse"
                                            style={{
                                                left: `${Math.min(95, Math.max(5, x))}%`,
                                                top: `${Math.min(95, Math.max(5, y))}%`,
                                                animationDelay: `${idx * 100}ms`
                                            }}
                                        />
                                    );
                                })
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-bold text-xs uppercase tracking-widest">
                                    Aguardando coordenadas...
                                </div>
                            )}

                            {/* Legend */}
                            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-zinc-100 shadow-sm text-[8px] font-black uppercase text-zinc-500 tracking-tighter">
                                Pontos de Calor Baseados em Perfis Ativos
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                            <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase">Amostra Global</p>
                                <p className="font-bold text-zinc-900">{userCoords?.length || 0} Coordenadas Ativas</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-75" />
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Feed */}
                <div className="relative">
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
};

const KPI = ({ title, value, trend, icon, color }: any) => {
    const colors: any = {
        violet: 'bg-violet-50 text-violet-600',
        pink: 'bg-pink-50 text-pink-600',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600'
    };

    return (
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-all group active:scale-95 duration-200">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${colors[color]} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-wide">{title}</p>
                <h2 className="text-3xl font-black text-zinc-900 mt-1">{value}</h2>
                <div className="flex items-center gap-1.5 mt-2 bg-zinc-50 w-fit px-2.5 py-1 rounded-full border border-zinc-100">
                    <span className="text-xs font-bold text-zinc-600">{trend}</span>
                </div>
            </div>
        </div>
    );
};

const MetricBox = ({ label, value, color }: any) => {
    const borderColors: any = {
        green: 'border-emerald-100',
        red: 'border-red-100',
        pink: 'border-pink-100',
        blue: 'border-blue-100'
    };

    const textColors: any = {
        green: 'text-emerald-600',
        red: 'text-red-600',
        pink: 'text-pink-600',
        blue: 'text-blue-600'
    };

    return (
        <div className={`bg-zinc-50/50 rounded-2xl p-4 border ${borderColors[color]} text-center`}>
            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">{label}</p>
            <p className={`text-xl font-black ${textColors[color]}`}>{value}</p>
        </div>
    );
};

export default DashboardPage;
