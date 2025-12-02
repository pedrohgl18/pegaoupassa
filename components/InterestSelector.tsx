import React, { useEffect, useState } from 'react';
import { interests } from '../lib/supabase';
import { Check, Loader2 } from 'lucide-react';

interface Interest {
    id: string;
    name: string;
    emoji: string;
    category: string;
}

interface InterestSelectorProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    maxSelection?: number;
}

const InterestSelector: React.FC<InterestSelectorProps> = ({
    selectedIds,
    onChange,
    maxSelection = 3
}) => {
    const [allInterests, setAllInterests] = useState<Interest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterests = async () => {
            const { data, error } = await interests.getAll();
            if (data) {
                setAllInterests(data);
            }
            setLoading(false);
        };
        fetchInterests();
    }, []);

    const toggleInterest = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(i => i !== id));
        } else {
            if (selectedIds.length < maxSelection) {
                onChange([...selectedIds, id]);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-brasil-blue" />
            </div>
        );
    }

    // Group by category
    const categories = Array.from(new Set(allInterests.map(i => i.category)));

    return (
        <div className="space-y-6">
            {categories.map(category => (
                <div key={category}>
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-1">
                        {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {allInterests
                            .filter(i => i.category === category)
                            .map(interest => {
                                const isSelected = selectedIds.includes(interest.id);
                                return (
                                    <button
                                        key={interest.id}
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`
                      px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 border
                      ${isSelected
                                                ? 'bg-brasil-blue text-white border-brasil-blue shadow-md transform scale-105'
                                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-brasil-blue/50 hover:bg-blue-50'
                                            }
                    `}
                                    >
                                        <span>{interest.emoji}</span>
                                        <span>{interest.name}</span>
                                        {isSelected && <Check size={14} strokeWidth={3} />}
                                    </button>
                                );
                            })}
                    </div>
                </div>
            ))}

            <div className="text-center text-sm text-zinc-500 mt-4">
                Selecionado: {selectedIds.length}/{maxSelection}
            </div>
        </div>
    );
};

export default InterestSelector;
