import React from 'react';
import { X, Check } from 'lucide-react';

interface TagSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTags: string[];
    onToggleTag: (tag: string) => void;
}

const CATEGORIES = [
    {
        name: '🏳️‍🌈 Orgulho & Identidade',
        tags: ['🏳️‍🌈 LGBT+', '🏳️‍⚧️ Trans', '⚧ Não-binário', '⚤ Bissexual', '🌈 Queer', '🦄 Pan', '💅 Gay', '👭 Lésbica']
    },
    {
        name: '🔮 Signos',
        tags: ['♈ Áries', '♉ Touro', '♊ Gêmeos', '♋ Câncer', '♌ Leão', '♍ Virgem', '♎ Libra', '♏ Escorpião', '♐ Sagitário', '♑ Capricórnio', '♒ Aquário', '♓ Peixes']
    },
    {
        name: '⚡ Tribos & Vibes',
        tags: ['🎮 Gamer', '🏋️ Gym Rat', '🌿 420 Friendly', '🍷 Vinho', '🍺 Cerveja', '✈️ Viajante', '📚 Leitor', '🎨 Artista', '🤠 Agro', '🐾 Pet Lover', '☕ Café', '🏖️ Praia']
    },
    {
        name: '🌍 Origem',
        tags: ['🇧🇷 Brasil', '🇵🇹 Portugal', '🇺🇸 EUA', '🇦🇷 Argentina', '🏳️ Universal']
    }
];

export const TagSelector: React.FC<TagSelectorProps> = ({ isOpen, onClose, selectedTags, onToggleTag }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            <div
                className="absolute inset-0 bg-black/60 transition-opacity pointer-events-auto"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col pointer-events-auto animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between p-4 border-b border-zinc-100">
                    <h3 className="text-lg font-bold text-zinc-900">Escolha suas Tags</h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {CATEGORIES.map((category) => (
                        <div key={category.name}>
                            <h4 className="text-sm font-semibold text-zinc-500 mb-3 px-1">
                                {category.name}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {category.tags.map((tag) => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => onToggleTag(tag)}
                                            className={`
                        px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 border
                        ${isSelected
                                                    ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                                                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                                                }
                      `}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="h-4" /> {/* Spacer */}
                </div>

                <div className="p-4 border-t border-zinc-100 bg-white sm:rounded-b-2xl pb-safe">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-rose-500 text-white font-bold rounded-xl active:scale-[0.98] transition-transform shadow-lg shadow-rose-500/20"
                    >
                        Pronto ({selectedTags.length})
                    </button>
                </div>
            </div>
        </div>
    );
};
