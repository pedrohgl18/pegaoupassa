import React from 'react';
import { MapPin, Globe, Navigation, BarChart3 } from 'lucide-react';
import { GeoData } from '../types';

interface GeographyPageProps {
    geoData: GeoData[];
    geoGroupBy: 'state' | 'city' | 'neighborhood';
    setGeoGroupBy: (val: 'state' | 'city' | 'neighborhood') => void;
}

const GeographyPage: React.FC<GeographyPageProps> = ({ geoData, geoGroupBy, setGeoGroupBy }) => {
    return (
        <div className="space-y-8 pb-20">
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                        <Globe size={28} className="text-blue-500" /> Distribuição Geográfica
                    </h2>
                    <p className="text-zinc-500 font-medium">Onde os usuários estão mais ativos no Brasil.</p>
                </div>

                <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
                    <ToggleButton
                        active={geoGroupBy === 'state'}
                        onClick={() => setGeoGroupBy('state')}
                        label="Estados"
                    />
                    <ToggleButton
                        active={geoGroupBy === 'city'}
                        onClick={() => setGeoGroupBy('city')}
                        label="Cidades"
                    />
                    <ToggleButton
                        active={geoGroupBy === 'neighborhood'}
                        onClick={() => setGeoGroupBy('neighborhood')}
                        label="Bairros"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ranking List */}
                <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <BarChart3 size={16} /> Top Localidades
                    </h3>
                    <div className="space-y-2">
                        {geoData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:bg-white hover:border-blue-100 transition-all">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${index === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-zinc-400 border border-zinc-200'
                                    }`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <p className="font-extrabold text-zinc-900">{item.name}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.count} usuários únicos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map/Visual Area Placeholder */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm flex flex-col items-center justify-center space-y-4 min-h-[500px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
                    <div className="relative z-10 w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center animate-pulse">
                        <Navigation size={48} />
                    </div>
                    <div className="relative z-10 text-center">
                        <h3 className="text-xl font-black text-zinc-900">Visualização de Mapa</h3>
                        <p className="text-zinc-500 font-medium max-w-sm mt-2">
                            A integração com MapBox/Google Maps para Heatmap de usuários está planejada para a próxima fase.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToggleButton = ({ active, onClick, label }: any) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${active ? 'bg-white text-zinc-900 shadow-md' : 'text-zinc-400 hover:text-zinc-600'
            }`}
    >
        {label}
    </button>
);

export default GeographyPage;
