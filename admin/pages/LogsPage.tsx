import React from 'react';
import { FileText, User, Tag, Clock, ChevronRight } from 'lucide-react';
import { AdminLog } from '../types';

interface LogsPageProps {
    logs: AdminLog[];
}

const LogsPage: React.FC<LogsPageProps> = ({ logs }) => {
    const getActionColor = (action: string) => {
        if (action.includes('ban')) return 'bg-red-50 text-red-600 border-red-100';
        if (action.includes('vip')) return 'bg-amber-50 text-amber-600 border-amber-100';
        if (action.includes('report')) return 'bg-blue-50 text-blue-600 border-blue-100';
        return 'bg-zinc-50 text-zinc-600 border-zinc-200';
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                    <FileText size={28} className="text-zinc-500" /> Trilha de Auditoria
                </h2>
                <p className="text-zinc-500 font-medium">Histórico completo de ações administrativas no sistema.</p>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50/50 border-b border-zinc-100">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Administrador</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Ação</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Alvo</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Detalhes</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Data/Hora</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-zinc-50/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs border border-zinc-200 group-hover:bg-white transition-colors">
                                            A
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-zinc-900 leading-none">Admin</p>
                                            <p className="text-[10px] font-bold text-zinc-400 mt-1">ID: {log.admin_id.substring(0, 8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest w-fit shadow-sm ${getActionColor(log.action)}`}>
                                        {log.action.replace('_', ' ')}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    {log.target_user ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                                                <User size={12} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900 leading-none">{log.target_user.name}</p>
                                                <p className="text-[10px] font-medium text-zinc-400 mt-1 truncate max-w-[150px]">{log.target_user.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-zinc-300 font-medium italic text-xs">Sistema/Geral</span>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-xs font-bold text-zinc-600 max-w-[200px] truncate">
                                        {log.details ? JSON.stringify(log.details) : 'N/A'}
                                    </p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs">
                                        <Clock size={12} />
                                        {new Date(log.created_at).toLocaleString('pt-BR')}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {logs.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <FileText size={48} className="mx-auto text-zinc-200" />
                        <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">Nenhum log registrado ainda</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogsPage;
