import { useState, useEffect, useCallback } from 'react';
import { profiles } from '../lib/supabase';
import { Profile as ProfileType } from '../types';
import { calculateAge } from '../utils';

interface UseFeedProps {
    user: any;
    profile: any;
    myLocation: { latitude: number; longitude: number } | null;
}

export const useFeed = ({ user, profile, myLocation }: UseFeedProps) => {
    const [feedProfiles, setFeedProfiles] = useState<ProfileType[]>([]);
    const [loadingFeed, setLoadingFeed] = useState(false);

    // Filters
    const [maxDistance, setMaxDistance] = useState(50);
    const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
    const [interestedIn, setInterestedIn] = useState<'men' | 'women' | 'both'>('both');
    const [minHeight, setMinHeight] = useState<number>(0);
    const [filterZodiac, setFilterZodiac] = useState<string>('');
    const [filtersLoaded, setFiltersLoaded] = useState(false);

    // Load saved filters from profile
    useEffect(() => {
        if (profile && !filtersLoaded) {
            if (profile.filter_max_distance !== undefined && profile.filter_max_distance !== null) {
                setMaxDistance(profile.filter_max_distance);
            }
            if (profile.filter_min_age !== undefined && profile.filter_max_age !== undefined) {
                setAgeRange([profile.filter_min_age, profile.filter_max_age]);
            }
            if (profile.looking_for) {
                const lookingForMap: Record<string, 'men' | 'women' | 'both'> = {
                    'male': 'men',
                    'female': 'women',
                    'both': 'both'
                };
                setInterestedIn(lookingForMap[profile.looking_for] || 'both');
            }
            setFiltersLoaded(true);
        }
    }, [profile, filtersLoaded]);

    const fetchFeed = useCallback(async (location?: { latitude: number, longitude: number }) => {
        if (!user) return;
        setLoadingFeed(true);

        const loc = location || myLocation;

        try {
            const { data, error } = await profiles.getFeed(user.id, {
                limit: 10,
                gender: interestedIn === 'both' ? undefined : (interestedIn === 'men' ? 'male' : 'female'),
                minAge: ageRange[0],
                maxAge: ageRange[1],
                minHeight: minHeight > 0 ? minHeight : undefined,
                zodiac: filterZodiac || undefined,
                maxDistance: maxDistance,
                userLocation: loc ? { latitude: loc.latitude, longitude: loc.longitude } : undefined
            });

            if (error) {
                console.error('Erro ao buscar feed:', error);
            }

            if (data) {
                const mappedProfiles: ProfileType[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name || 'Usuário',
                    age: p.age || (p.birth_date ? calculateAge(p.birth_date) : 25),
                    bio: p.bio || '',
                    imageUrl: p.photos?.[0]?.url || '',
                    photos: p.photos?.sort((a: any, b: any) => a.position - b.position).map((ph: any) => ph.url) || [],
                    distance: p.distance !== undefined ? p.distance : 0,
                    verified: p.is_verified || false,
                    zodiacSign: p.zodiac_sign,
                    profession: p.profession,
                    education: p.education,
                    height: p.height,
                    interests: p.user_interests?.map((ui: any) => ui.interest) || [],
                    vibeStatus: p.vibe_status,
                    vibeExpiresAt: p.vibe_expires_at,
                    neighborhood: p.neighborhood,
                }));

                // Filter out duplicates if any (merging strategy can be improved)
                setFeedProfiles(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newProfiles = mappedProfiles.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newProfiles];
                });
            }
        } catch (err) {
            console.error('Erro ao buscar feed:', err);
        } finally {
            setLoadingFeed(false);
        }
    }, [user, myLocation, interestedIn, ageRange, minHeight, filterZodiac, maxDistance]);

    return {
        feedProfiles,
        setFeedProfiles,
        loadingFeed,
        fetchFeed,
        filters: {
            maxDistance, setMaxDistance,
            ageRange, setAgeRange,
            interestedIn, setInterestedIn,
            minHeight, setMinHeight,
            filterZodiac, setFilterZodiac,
            filtersLoaded
        }
    };
};
