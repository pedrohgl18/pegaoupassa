import React, { useState } from 'react';
import { Ticket, Plus, Search, Trash2, CheckCircle, Clock } from 'lucide-react';

interface VoucherPageProps {
    vouchers: any[];
    onCreate: (code: string, type: string, limit: number) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
    refresh: () => void;
}

const VoucherPage: React.FC<VoucherPageProps> = ({ vouchers, onCreate, onDelete, refresh }) => {
    const [showModal, setShowModal] = useState(false);
    const [newVoucher, setNewVoucher] = useState({ code: '', type: 'vip_30d', limit: 100 });
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!newVoucher.code) return;
        setLoading(true);
        const success = await onCreate(newVoucher.code, newVoucher.type, newVoucher.limit);
        if (success) {
            setShowModal(false);
            setNewVoucher({ code: '', type: 'vip_30d', limit: 100 });
            refresh();
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza?')) {
            await onDelete(id);
            refresh();
        }
    };

    const activeVouchers = vouchers.filter(v => v.status === 'active').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-zinc-900">Gestor de Vouchers</h2>
                    <p className="text-zinc-500 font-medium">Crie e monitore códigos promocionais para aquisição de usuários.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-violet-600 text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-violet-100"
                >
                    <Plus size={20} /> Novo Cupom
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Ativados</p>
                    <h3 className="text-4xl font-black text-zinc-900">{vouchers.reduce((acc, v) => acc + (v.usage_count || 0), 0)}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Cupons Ativos</p>
                    <h3 className="text-4xl font-black text-zinc-900">{activeVouchers}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Potencial VIP</p>
                    <h3 className="text-4xl font-black text-zinc-900">{vouchers.length * 30}d</h3>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50/50">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Código</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Benefício</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Uso / Limite</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {vouchers.map(v => (
                                <tr key={v.id} className="hover:bg-zinc-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                                <Ticket size={18} />
                                            </div>
                                            <span className="font-extrabold text-zinc-900">{v.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-bold text-zinc-600">
                                            {v.type === 'vip_30d' ? 'VIP 30 Dias' : v.type === 'vip_7d' ? 'VIP 7 Dias' : 'VIP 1 Dia'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1.5 min-w-[120px]">
                                            <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                                                <span>{v.usage_count || 0}</span>
                                                <span>{v.usage_limit}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${v.status === 'expired' ? 'bg-zinc-300' : 'bg-violet-500'}`}
                                                    style={{ width: `${((v.usage_count || 0) / v.usage_limit) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {v.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle size={10} /> Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <Clock size={10} /> Expirado
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => handleDelete(v.id)}
                                            className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Criação */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
                                <Ticket size={24} />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900">Novo Voucher</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block">Código Cupom</label>
                                <input
                                    type="text"
                                    value={newVoucher.code}
                                    onChange={e => setNewVoucher({ ...newVoucher, code: e.target.value })}
                                    placeholder="EX: VIPSUMMER"
                                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block">Tipo de VIP</label>
                                <select
                                    value={newVoucher.type}
                                    onChange={e => setNewVoucher({ ...newVoucher, type: e.target.value })}
                                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none appearance-none"
                                >
                                    <option value="vip_1d">VIP 1 Dia</option>
                                    <option value="vip_7d">VIP 7 Dias</option>
                                    <option value="vip_30d">VIP 30 Dias</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block">Limite de Uso</label>
                                <input
                                    type="number"
                                    value={newVoucher.limit}
                                    onChange={e => setNewVoucher({ ...newVoucher, limit: parseInt(e.target.value) })}
                                    className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 text-zinc-400 font-bold text-sm hover:text-zinc-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={loading || !newVoucher.code}
                                className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 disabled:opacity-50 transition-all"
                            >
                                {loading ? 'Criando...' : 'Criar Voucher'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherPage;
