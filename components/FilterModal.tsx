import React from 'react';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import RangeSlider from './RangeSlider';
import Button from './Button';
import { profiles } from '../lib/supabase';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    filters: {
        maxDistance: number;
        setMaxDistance: (val: number) => void;
        ageRange: [number, number];
        setAgeRange: (val: [number, number]) => void;
        interestedIn: 'men' | 'women' | 'both';
        setInterestedIn: (val: 'men' | 'women' | 'both') => void;
        minHeight: number;
        setMinHeight: (val: number) => void;
        filterZodiac: string;
        setFilterZodiac: (val: string) => void;
    };
    onSave: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, user, filters, onSave }) => {
    if (!isOpen) return null;

    const {
        maxDistance, setMaxDistance,
        ageRange, setAgeRange,
        interestedIn, setInterestedIn,
        minHeight, setMinHeight,
        filterZodiac, setFilterZodiac
    } = filters;

    return (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="bg-white w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-extrabold text-brasil-blue flex items-center gap-2">
                        <SlidersHorizontal size={24} /> O Que Eu Busco
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Distance Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-zinc-500">Distância Máxima</span>
                            <span className="text-brasil-blue">{maxDistance >= 999 ? '100km+' : `${maxDistance}km`}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="101"
                            value={maxDistance >= 999 ? 101 : maxDistance}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                // When slider is at max (101), save as 999 to indicate "unlimited"
                                setMaxDistance(val >= 101 ? 999 : val);
                            }}
                            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-brasil-green"
                        />
                    </div>

                    {/* Age Sliders */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-zinc-500">Faixa Etária</span>
                            <span className="text-brasil-blue">{ageRange[0]} - {ageRange[1]} anos</span>
                        </div>
                        <div className="px-2 py-2">
                            <RangeSlider
                                min={18}
                                max={100}
                                value={ageRange}
                                onChange={setAgeRange}
                            />
                        </div>
                    </div>

                    {/* Gender Chips */}
                    <div className="space-y-3">
                        <span className="text-sm font-bold text-zinc-500">Gênero</span>
                        <div className="flex gap-2">
                            {[
                                { id: 'men', label: 'Homens' },
                                { id: 'women', label: 'Mulheres' },
                                { id: 'both', label: 'Ambos' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setInterestedIn(opt.id as any)}
                                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all border-2 ${interestedIn === opt.id
                                        ? 'border-brasil-blue bg-brasil-blue text-white shadow-md'
                                        : 'border-zinc-200 text-zinc-500 bg-transparent hover:bg-zinc-50'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <div className="space-y-3 pt-2 border-t border-zinc-100">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Filtros Avançados</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-700">Altura Mínima (cm)</label>
                                <input
                                    type="number"
                                    value={minHeight || ''}
                                    onChange={(e) => setMinHeight(parseInt(e.target.value) || 0)}
                                    placeholder="Ex: 170"
                                    className="w-full p-3 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-zinc-50 font-bold text-zinc-900"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-700">Signo</label>
                                <select
                                    value={filterZodiac}
                                    onChange={(e) => setFilterZodiac(e.target.value)}
                                    className="w-full p-3 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-zinc-50 font-bold text-zinc-900 appearance-none"
                                >
                                    <option value="">Qualquer</option>
                                    {[
                                        'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
                                        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
                                    ].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                        <Button fullWidth onClick={async () => {
                            // Salvar filtros no banco de dados
                            if (user) {
                                const lookingForMap: Record<string, 'male' | 'female' | 'both'> = {
                                    'men': 'male',
                                    'women': 'female',
                                    'both': 'both'
                                };

                                const { error } = await profiles.update(user.id, {
                                    filter_max_distance: maxDistance,
                                    filter_min_age: ageRange[0],
                                    filter_max_age: ageRange[1],
                                    looking_for: lookingForMap[interestedIn],
                                });

                                if (error) {
                                    console.error('Erro ao salvar filtros:', error);
                                }
                            }

                            onSave();
                            onClose();
                        }} className="bg-gradient-to-r from-brasil-green to-teal-600 shadow-xl shadow-brasil-green/20">
                            <Check size={20} className="mr-2" /> Salvar Preferências
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
