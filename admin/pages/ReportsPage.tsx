import React from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, User, ExternalLink, Eye } from 'lucide-react';
import { ReportRow, AdminMessage } from '../types';
import EvidenceModal from '../components/EvidenceModal';

interface ReportsPageProps {
    reports: ReportRow[];
    filter: 'pending' | 'all';
    setFilter: (val: 'pending' | 'all') => void;
    onResolve: (reportId: string, reportedId: string, action: 'ban' | 'dismiss', reportedName: string) => void;
    onFetchEvidence: (reporterId: string, reportedId: string) => Promise<AdminMessage[]>;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ reports, filter, setFilter, onResolve, onFetchEvidence }) => {
    const [evidenceModal, setEvidenceModal] = React.useState<{
        isOpen: boolean;
        reporterName: string;
        reportedName: string;
        messages: AdminMessage[];
        loading: boolean;
    }>({
        isOpen: false,
        reporterName: '',
        reportedName: '',
        messages: [],
        loading: false
    });

    const handleOpenEvidence = async (report: ReportRow) => {
        setEvidenceModal({
            isOpen: true,
            reporterName: report.reporter?.name || 'Repórter',
            reportedName: report.reported?.name || 'Denunciado',
            messages: [],
            loading: true
        });

        const messages = await onFetchEvidence(report.reporter_id, report.reported_id);

        setEvidenceModal(prev => ({
            ...prev,
            messages,
            loading: false
        }));
    };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                <div className="flex gap-2">
                    <TabButton
                        active={filter === 'pending'}
                        onClick={() => setFilter('pending')}
                        label="Pendentes"
                        count={reports.filter(r => r.status === 'pending').length}
                    />
                    <TabButton
                        active={filter === 'all'}
                        onClick={() => setFilter('all')}
                        label="Todos"
                    />
                </div>

                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    <Shield size={14} /> Moderação em Tempo Real
                </div>
            </div>

            <div className="space-y-4 pb-20">
                {reports.map((r) => (
                    <div key={r.id} className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                        <div className="p-8 flex flex-col lg:flex-row gap-8">
                            {/* Reported User Info */}
                            <div className="flex-1 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <img
                                                src={r.reported?.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${r.reported?.name}`}
                                                className={`w-14 h-14 rounded-2xl object-cover ring-2 ring-offset-2 ${!r.reported?.is_active ? 'ring-red-500' : 'ring-zinc-100'}`}
                                                alt=""
                                            />
                                            {!r.reported?.is_active && (
                                                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full border-2 border-white">
                                                    <XCircle size={10} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest leading-none mb-1">Denunciado</p>
                                            <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                                                {r.reported?.name}
                                                <span className="text-xs font-medium text-zinc-400 font-sans">{r.reported?.email}</span>
                                            </h3>
                                            <p className={`text-xs font-bold mt-1 ${!r.reported?.is_active ? 'text-red-500' : 'text-emerald-500'}`}>
                                                Status: {r.reported?.is_active ? 'Ativo' : 'Banído'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${r.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                        r.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                                        }`}>
                                        {r.status === 'pending' ? 'Pendente' : r.status === 'resolved' ? 'Resolvido' : 'Ignorado'}
                                    </div>
                                </div>

                                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                                    <div className="flex items-center gap-2 text-zinc-900 font-black text-base mb-3">
                                        <AlertTriangle size={18} className="text-amber-500" />
                                        Motivo: {r.reason}
                                    </div>
                                    <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                                        {r.description || 'Nenhuma descrição adicional fornecida.'}
                                    </p>
                                </div>
                            </div>

                            {/* Divider Logic for Desktop */}
                            <div className="hidden lg:block w-px bg-zinc-100" />

                            {/* Reporter Info & Actions */}
                            <div className="w-full lg:w-80 space-y-6">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest leading-none mb-3">Reportado por</p>
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-100">
                                        <img
                                            src={r.reporter?.photos?.[0]?.url || `https://ui-avatars.com/api/?name=${r.reporter?.name}`}
                                            className="w-10 h-10 rounded-xl object-cover"
                                            alt=""
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-zinc-900 truncate">{r.reporter?.name}</p>
                                            <p className="text-[10px] font-bold text-zinc-400 truncate">{new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {r.status === 'pending' && (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleOpenEvidence(r)}
                                            className="w-full py-4 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 mb-2"
                                        >
                                            <Eye size={18} /> Ver Evidências (Chat)
                                        </button>
                                        <button
                                            onClick={() => onResolve(r.id, r.reported_id, 'ban', r.reported?.name)}
                                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                        >
                                            <Ban size={18} /> Banir Usuário
                                        </button>
                                        <button
                                            onClick={() => onResolve(r.id, r.reported_id, 'dismiss', r.reported?.name)}
                                            className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={18} /> Ignorar Denúncia
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {reports.length === 0 && (
                    <div className="bg-white rounded-3xl p-20 border border-zinc-100 text-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900">Limpo! Nenhuma denúncia pendente.</h3>
                        <p className="text-zinc-500 font-medium">Bom trabalho mantendo a comunidade segura.</p>
                    </div>
                )}
            </div>

            <EvidenceModal
                isOpen={evidenceModal.isOpen}
                onClose={() => setEvidenceModal(prev => ({ ...prev, isOpen: false }))}
                reporterName={evidenceModal.reporterName}
                reportedName={evidenceModal.reportedName}
                messages={evidenceModal.messages}
                loading={evidenceModal.loading}
            />
        </div>
    );
};

const TabButton = ({ active, onClick, label, count }: any) => (
    <button
        onClick={onClick}
        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${active ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'text-zinc-500 hover:bg-zinc-50'
            }`}
    >
        {label}
        {count !== undefined && count > 0 && (
            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                {count}
            </span>
        )}
    </button>
);

const Ban = ({ size }: { size: number }) => <XCircle size={size} />;

export default ReportsPage;
