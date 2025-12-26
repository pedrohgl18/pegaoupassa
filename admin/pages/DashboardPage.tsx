import React from 'react';
import { Users, TrendingUp, Activity, Smartphone } from 'lucide-react';
import { AdminStats, AdminAlert } from '../types';

interface DashboardPageProps {
    stats: AdminStats | null;
    alerts: AdminAlert[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ stats, alerts }) => {
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
                {/* Secondary Stats */}
                <div className="xl:col-span-2 bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm min-h-[400px]">
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

                    {/* Placeholder for a Chart */}
                    <div className="mt-10 h-48 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400">
                        <div className="text-sm font-bold">Gráfico de Atividade Real-time</div>
                        <div className="text-xs uppercase tracking-widest mt-1">Implementação Pendente (PostGIS Analytics)</div>
                    </div>
                </div>

                {/* Growth Quick Stats */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-200 relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-lg font-bold mb-6">Crescimento Semanal</h3>
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="text-white/70 text-sm font-medium">Novos Perfis</p>
                                <p className="text-3xl font-extrabold">+{stats?.newWeek || 0}</p>
                            </div>
                            <div className="h-10 w-1 bg-white/20 rounded-full"></div>
                            <div className="space-y-1 text-right">
                                <p className="text-white/70 text-sm font-medium">Conversão</p>
                                <p className="text-3xl font-extrabold">98%</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/20">
                            <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-2">Dica do sistema</p>
                            <p className="text-sm font-medium leading-relaxed italic">
                                "O volume de likes cresceu 15% na última hora. Ótimo momento para um Boost global."
                            </p>
                        </div>
                    </div>
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
