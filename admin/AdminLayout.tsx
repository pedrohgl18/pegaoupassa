import React from 'react';
import { LayoutDashboard, Users, MapPin, Database, Shield, FileText, TrendingUp, LogOut, Search, Bell } from 'lucide-react';
import { AdminTab } from './types';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    onClose: () => void;
    adminEmail: string;
}

const AdminLayout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onClose, adminEmail }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'users', label: 'Usuários', icon: <Users size={20} /> },
        { id: 'reports', label: 'Denúncias', icon: <Shield size={20} /> },
        { id: 'geography', label: 'Geografia', icon: <MapPin size={20} /> },
        { id: 'analytics', label: 'Métricas', icon: <TrendingUp size={20} /> },
        { id: 'quota', label: 'Infra/Quota', icon: <Database size={20} /> },
        { id: 'logs', label: 'Logs', icon: <FileText size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col shadow-sm z-20">
                <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                        <Shield size={18} className="text-white" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-zinc-900">Admin App</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as AdminTab)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                                }`}
                        >
                            <span className={`${activeTab === item.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'}`}>
                                {item.icon}
                            </span>
                            <span className="font-semibold">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold border border-zinc-200">
                            {adminEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-900 truncate">Admin</p>
                            <p className="text-xs text-zinc-500 truncate">{adminEmail}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                    >
                        <LogOut size={20} />
                        <span>Sair do Painel</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-extrabold text-zinc-900 capitalize">
                            {menuItems.find(m => m.id === activeTab)?.label}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Busca global..."
                                className="pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all outline-none"
                            />
                        </div>
                        <button className="p-2.5 bg-zinc-100 text-zinc-500 rounded-xl hover:bg-zinc-200 hover:text-zinc-900 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-zinc-50/50">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
