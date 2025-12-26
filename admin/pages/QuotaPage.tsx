import React from 'react';
import { Database, HardDrive, Table, ExternalLink, Zap } from 'lucide-react';
import { QuotaInfo, StorageBucket } from '../types';

interface QuotaPageProps {
    databaseSize: string;
    databaseSizeBytes: number;
    totalStorageBytes: number;
    storageData: StorageBucket[];
    quotas: QuotaInfo[];
    onRefresh: () => void;
}

const QuotaPage: React.FC<QuotaPageProps> = ({
    databaseSize,
    databaseSizeBytes,
    totalStorageBytes,
    storageData,
    quotas,
    onRefresh
}) => {
    // Limits (Free Tier)
    const DB_LIMIT_BYTES = 500 * 1024 * 1024; // 500MB
    const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024; // 1GB (1024MB)

    const dbPercentage = (databaseSizeBytes / DB_LIMIT_BYTES) * 100;
    const storagePercentage = (totalStorageBytes / STORAGE_LIMIT_BYTES) * 100;

    const formatBytes = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Supabase Link Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-xl shadow-emerald-100 flex items-center justify-between">
                <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Zap size={32} className="text-white fill-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">Infraestrutura Supabase</h2>
                        <p className="text-white/80 font-medium">Monitoramento de limites e saúde do banco de dados.</p>
                    </div>
                </div>
                <button
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                    className="px-6 py-4 bg-white text-emerald-700 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    Painel Oficial <ExternalLink size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Database Metrics */}
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                            <Database size={20} className="text-violet-500" /> Banco de Dados
                        </h3>
                        <span className="text-sm font-bold text-zinc-400">Plano Free Tier</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Tamanho Utilizado</p>
                                <p className="text-4xl font-black text-zinc-900">{databaseSize}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Limite</p>
                                <p className="text-xl font-bold text-zinc-600">500 MB</p>
                            </div>
                        </div>

                        <div className="relative h-4 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${dbPercentage > 80 ? 'bg-red-500' : dbPercentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                style={{ width: `${Math.min(dbPercentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs font-bold text-zinc-400 text-right">{dbPercentage.toFixed(1)}% utilizado</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <Table size={14} /> Tabelas Principais
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                            {quotas.map(q => (
                                <div key={q.tableName} className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                    <span className="font-bold text-zinc-700">{q.tableName}</span>
                                    <span className="text-sm font-black text-zinc-900">{q.sizePretty}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Storage Metrics */}
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                            <HardDrive size={20} className="text-blue-500" /> Storage (Buckets)
                        </h3>
                        <span className="text-sm font-bold text-zinc-400">CDN Ativa</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Arquivos Estáticos</p>
                                <p className="text-4xl font-black text-zinc-900">{formatBytes(totalStorageBytes)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">Limite</p>
                                <p className="text-xl font-bold text-zinc-600">1 GB</p>
                            </div>
                        </div>

                        <div className="relative h-4 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${storagePercentage > 80 ? 'bg-red-500' : storagePercentage > 50 ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs font-bold text-zinc-400 text-right">{storagePercentage.toFixed(1)}% utilizado</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                            <HardDrive size={14} /> Buckets Monitorados
                        </h4>
                        <div className="space-y-4">
                            {storageData.map(b => (
                                <div key={b.bucketId} className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                        <HardDrive size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-zinc-700">{b.bucketId}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{b.filesCount} arquivos</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="h-1.5 flex-1 bg-zinc-200 rounded-full mr-4">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${Math.min((b.totalBytes / STORAGE_LIMIT_BYTES) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-zinc-900">{formatBytes(b.totalBytes)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotaPage;
