import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { profiles } from '../lib/supabase';
import { Profile } from '../types';

interface UseGeolocationReturn {
    myLocation: { latitude: number; longitude: number } | null;
    locationDenied: boolean;
    city: string;
    state: string;
    neighborhood: string;
}

export const useGeolocation = (user?: any, profile?: Profile | null, isAuthenticated?: boolean): UseGeolocationReturn => {
    const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationDenied, setLocationDenied] = useState(false);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [neighborhood, setNeighborhood] = useState('');

    useEffect(() => {
        let intervalId: any;
        let appStateListener: any;

        const setupLocation = async () => {
            // Se já temos localização salva no perfil e o state está vazio, usa a do perfil (Persistência Offline)
            if (!myLocation && profile?.latitude && profile?.longitude) {
                setMyLocation({ latitude: profile.latitude, longitude: profile.longitude });
                if (profile.city) setCity(profile.city);
                if (profile.state) setState(profile.state);
                if (profile.neighborhood) setNeighborhood(profile.neighborhood);
            }

            if (!user) return;

            try {
                // Request permissions
                const permission = await Geolocation.checkPermissions();
                console.log('Permission status:', permission);

                if (permission.location !== 'granted') {
                    const request = await Geolocation.requestPermissions();
                    if (request.location !== 'granted') {
                        setLocationDenied(true);
                        return;
                    }
                }

                const updateLocation = async () => {
                    try {
                        // Get current position
                        const position = await Geolocation.getCurrentPosition();
                        if (position) {
                            const { latitude, longitude } = position.coords;
                            setMyLocation({ latitude, longitude });
                            setLocationDenied(false);

                            // Reverse Geocoding (City, State, Neighborhood)
                            try {
                                const apiKey = import.meta.env.VITE_BIGDATACLOUD_API_KEY;
                                const baseUrl = apiKey
                                    ? 'https://api-bdc.net/data/reverse-geocode'
                                    : 'https://api.bigdatacloud.net/data/reverse-geocode-client';

                                const url = `${baseUrl}?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt${apiKey ? `&key=${apiKey}` : ''}`;

                                const response = await fetch(url);
                                const data = await response.json();

                                // Parsing Estrito (Sem fallbacks)
                                const administrative = data.localityInfo?.administrative || [];

                                // Admin Level 8 = Município/Cidade (Ex: Rio de Janeiro)
                                const cityObj = administrative.find((x: any) => x.adminLevel === 8);
                                const fetchedCity = cityObj ? cityObj.name : '';
                                setCity(fetchedCity);

                                // Admin Level 4 = Estado (Ex: Rio de Janeiro)
                                const stateObj = administrative.find((x: any) => x.adminLevel === 4);
                                const fetchedState = stateObj ? stateObj.name : '';
                                setState(fetchedState);

                                // Admin Level 10 = Bairro (Ex: Tijuca)
                                const neighborhoodObj = administrative.find((x: any) => x.adminLevel === 10);
                                const fetchedNeighborhood = neighborhoodObj ? neighborhoodObj.name : '';
                                setNeighborhood(fetchedNeighborhood);

                                if (user) {
                                    // Only update if changed significantly or if it's been a while? 
                                    // For now, mirroring App.tsx logic which updates every time it runs (controlled by interval)
                                    await profiles.update(user.id, {
                                        latitude,
                                        longitude,
                                        city: fetchedCity,
                                        state: fetchedState,
                                        neighborhood: fetchedNeighborhood
                                    });
                                }
                            } catch (geoErr) {
                                console.error('Error in reverse geocoding:', geoErr);
                                // Update lat/long anyway if geocoding fails
                                await profiles.update(user.id, { latitude, longitude });
                            }
                        }
                    } catch (err) {
                        console.error('Error getting specific location:', err);
                    }
                };

                // Executar imediatamente
                updateLocation();

                // Configurar Polling (15 minutos)
                intervalId = setInterval(updateLocation, 15 * 60 * 1000);

                // Configurar Resume (Ao voltar para o app)
                const { App: CapacitorApp } = await import('@capacitor/app');
                appStateListener = await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
                    if (isActive) {
                        console.log('App resumed, updating location...');
                        updateLocation();
                    }
                });

            } catch (err) {
                console.error('Error getting location permission:', err);
                setLocationDenied(true);
            }
        };

        if (isAuthenticated && user?.id) {
            setupLocation();
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (appStateListener) appStateListener.remove();
        };
    }, [isAuthenticated, user?.id, profile]);

    return { myLocation, locationDenied, city, state, neighborhood };
};
