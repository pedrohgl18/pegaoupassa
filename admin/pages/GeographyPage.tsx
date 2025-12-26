import React from 'react';
import { MapPin, Globe, Navigation, BarChart3 } from 'lucide-react';
import { GeoData } from '../types';

interface GeographyPageProps {
    geoData: GeoData[];
    geoGroupBy: 'state' | 'city' | 'neighborhood';
    setGeoGroupBy: (val: 'state' | 'city' | 'neighborhood') => void;
    userCoords: { lat: number, lng: number }[];
}

const GeographyPage: React.FC<GeographyPageProps> = ({ geoData, geoGroupBy, setGeoGroupBy, userCoords }) => {
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

                {/* Map/Visual Area */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden min-h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900">Mapeamento Geográfico Direto</h3>
                            <p className="text-zinc-500 text-xs font-medium mt-1">Coordenadas reais de perfis ativos no Brasil.</p>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" /> GPS ATIVO
                        </div>
                    </div>

                    <div className="h-[400px] bg-zinc-50 rounded-[28px] border border-zinc-100 relative overflow-hidden">
                        {/* Interactive Grid */}
                        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-50"></div>

                        {/* Real Data Points */}
                        {userCoords && userCoords.length > 0 ? (
                            <div className="absolute inset-0">
                                {userCoords.slice(0, 500).map((coord, idx) => {
                                    const x = ((coord.lng + 74) / 40) * 100;
                                    const y = (1 - (coord.lat + 34) / 39) * 100;
                                    return (
                                        <div
                                            key={idx}
                                            className="absolute w-2 h-2 bg-blue-600/40 rounded-full"
                                            style={{
                                                left: `${Math.min(98, Math.max(2, x))}%`,
                                                top: `${Math.min(98, Math.max(2, y))}%`,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="absolute inset-0 p-10 flex flex-wrap gap-2 content-start opacity-70">
                                {/* Fallback based on ranking clusters */}
                                {geoData.slice(0, 5).map((loc, i) => (
                                    <div
                                        key={i}
                                        className="bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center p-8 animate-bounce"
                                        style={{ width: `${60 + loc.count}px`, height: `${60 + loc.count}px`, animationDelay: `${i * 200}ms` }}
                                    >
                                        <span className="text-[10px] font-black text-blue-700 text-center">{loc.name}<br />{loc.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="absolute bottom-8 right-8 bg-zinc-900 text-white p-6 rounded-3xl shadow-2xl max-w-[240px] space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status de Rede</span>
                            </div>
                            <p className="text-xs font-bold leading-relaxed">
                                Mapa dinâmico gerado a partir de {userCoords?.length || 0} coordenadas reais.
                            </p>
                        </div>
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
