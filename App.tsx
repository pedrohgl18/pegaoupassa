import React, { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, X, Crown, Rocket, Star, Ban, Search, User, ChevronUp, ChevronDown, Hand, Heart, Pencil, SlidersHorizontal, Check, Loader2, ChevronLeft } from 'lucide-react';
import { ScreenState, SwipeDirection, Profile as ProfileType } from './types';
import { DAILY_FREE_SWIPES, VIP_PRICE } from './constants';
import SwipeCard from './components/SwipeCard';
import Button from './components/Button';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import EditProfile from './components/EditProfile';
import MatchModal from './components/MatchModal';
import ChatScreen from './components/ChatScreen';
import RangeSlider from './components/RangeSlider';
import Profile from './components/Profile';
import ChatList from './components/ChatList';
import VipScreen from './components/VipScreen';
import LoadingScreen from './components/LoadingScreen';
import { useAuth } from './hooks/useAuth';
import { profiles, swipes, matches, messages, supabase } from './lib/supabase';
import { Chat } from './types';
import { Capacitor } from '@capacitor/core';

// Helper to calculate age
const calculateAge = (birthDate: string) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const App: React.FC = () => {
  // Auth Hook
  const {
    user,
    profile,
    loading: authLoading,
    error: authError,
    isAuthenticated,
    hasProfile,
    isVip: userIsVip,
    signInWithGoogle,
    signOut,
    createProfile,
  } = useAuth();

  // State
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(ScreenState.LOGIN);
  const [swipeCount, setSwipeCount] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [lastDirection, setLastDirection] = useState<SwipeDirection>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Drag State
  const [dragStart, setDragStart] = useState<{ y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Feed State
  const [feedProfiles, setFeedProfiles] = useState<ProfileType[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // Matches State
  const [matchesList, setMatchesList] = useState<Chat[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [receivedLikes, setReceivedLikes] = useState<any[]>([]);
  const [viewingProfile, setViewingProfile] = useState<ProfileType | null>(null);

  // Match Modal State
  const [matchModalData, setMatchModalData] = useState<{
    isOpen: boolean;
    theirName: string;
    theirPhotoUrl: string;
    myPhotoUrl: string;
  }>({
    isOpen: false,
    theirName: '',
    theirPhotoUrl: '',
    myPhotoUrl: '',
  });

  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);

  // Filter State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 50]);
  const [interestedIn, setInterestedIn] = useState<'men' | 'women' | 'both'>('both');
  const [minHeight, setMinHeight] = useState<number>(0);
  const [filterZodiac, setFilterZodiac] = useState<string>('');
  const [myLocation, setMyLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // Derived State
  const currentProfile = feedProfiles[0];
  const nextProfile = feedProfiles[1];

  // Hardware Back Button Handler (Android)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let backButtonListener: any = null;

    const setupBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app');

        backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
          console.log('Back button pressed, canGoBack:', canGoBack);

          // Se estiver em um chat aberto, fecha o chat
          if (activeChat) {
            setActiveChat(null);
            return;
          }

          // Se estiver visualizando um perfil, fecha a visualização
          if (viewingProfile) {
            setViewingProfile(null);
            return;
          }

          // Se estiver no modal de filtros, fecha
          if (showFilterModal) {
            setShowFilterModal(false);
            return;
          }

          // Se estiver em telas secundárias, volta para HOME
          if (currentScreen === ScreenState.EDIT_PROFILE ||
            currentScreen === ScreenState.VIP) {
            setCurrentScreen(ScreenState.HOME);
            return;
          }

          // Se estiver na tela de CHAT (lista de matches), volta para HOME
          if (currentScreen === ScreenState.CHAT) {
            setCurrentScreen(ScreenState.HOME);
            return;
          }

          // Se estiver na tela de PROFILE, volta para HOME
          if (currentScreen === ScreenState.PROFILE) {
            setCurrentScreen(ScreenState.HOME);
            return;
          }

          // Se estiver na HOME, minimiza o app (não fecha)
          if (currentScreen === ScreenState.HOME) {
            App.minimizeApp();
            return;
          }
        });

        console.log('Back button listener configurado');
      } catch (err) {
        console.error('Erro ao configurar back button:', err);
      }
    };

    setupBackButton();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [activeChat, viewingProfile, showFilterModal, currentScreen]);

  // Push Notification Tap Handler - Abre o chat específico
  useEffect(() => {
    const handleNotificationTap = async (event: CustomEvent) => {
      const data = event.detail;

      // Guardar os dados da notificação para processar quando o user estiver disponível
      if (data.type === 'message' && data.conversationId) {
        // Salvar no localStorage para recuperar caso o app recarregue
        localStorage.setItem('pendingNotification', JSON.stringify(data));

        // Se já temos o user, processar imediatamente
        if (user) {
          await openChatFromNotification(data.conversationId, user.id);
        }
      } else if (data.type === 'match') {
        setCurrentScreen(ScreenState.CHAT);
      }
    };

    // Função para abrir o chat
    const openChatFromNotification = async (conversationId: string, userId: string) => {
      // Primeiro ir para a tela de chat
      setCurrentScreen(ScreenState.CHAT);

      const { data: matchData } = await matches.getAll(userId);
      if (matchData) {
        const targetMatch = matchData.find((m: any) => {
          const conv = Array.isArray(m.conversation) ? m.conversation[0] : m.conversation;
          return conv?.id === conversationId;
        });

        if (targetMatch) {
          const otherUser = targetMatch.user1_id === userId ? targetMatch.user2 : targetMatch.user1;
          const conversation = Array.isArray(targetMatch.conversation) ? targetMatch.conversation[0] : targetMatch.conversation;

          // Usar setTimeout para garantir que a tela de chat foi renderizada
          setTimeout(() => {
            setActiveChat({
              id: targetMatch.id,
              otherUserId: otherUser.id,
              name: otherUser.name,
              imageUrl: otherUser.photos?.[0]?.url || 'https://picsum.photos/200',
              lastMessage: conversation?.last_message_content || '',
              timestamp: '',
              unreadCount: 0,
              conversationId: conversation?.id,
              isVip: otherUser.is_vip
            });
            // Limpar notificação pendente
            localStorage.removeItem('pendingNotification');
          }, 200);
        }
      }
    };

    // Verificar se há notificação pendente (app foi aberto via notificação)
    const checkPendingNotification = async () => {
      const pending = localStorage.getItem('pendingNotification');
      if (pending && user) {
        const data = JSON.parse(pending);
        if (data.conversationId) {
          await openChatFromNotification(data.conversationId, user.id);
        }
      }
    };

    // Verificar notificação pendente quando user ficar disponível
    if (user) {
      checkPendingNotification();
    }

    window.addEventListener('push-notification-tap', handleNotificationTap as EventListener);

    return () => {
      window.removeEventListener('push-notification-tap', handleNotificationTap as EventListener);
    };
  }, [user]);

  // Initialize Tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial && currentScreen === ScreenState.HOME) {
      setShowTutorial(true);
    }
  }, [currentScreen]);

  // Sync VIP status with profile
  useEffect(() => {
    if (userIsVip) {
      setIsVip(true);
    }
  }, [userIsVip]);

  // Load saved filters from profile
  useEffect(() => {
    if (profile && !filtersLoaded) {
      // Carregar filtros salvos no perfil
      if (profile.filter_max_distance !== undefined && profile.filter_max_distance !== null) {
        setMaxDistance(profile.filter_max_distance);
      }
      if (profile.filter_min_age !== undefined && profile.filter_max_age !== undefined) {
        setAgeRange([profile.filter_min_age, profile.filter_max_age]);
      }
      if (profile.looking_for) {
        // Converter de 'male'/'female'/'both' para 'men'/'women'/'both'
        const lookingForMap: Record<string, 'men' | 'women' | 'both'> = {
          'male': 'men',
          'female': 'women',
          'both': 'both'
        };
        setInterestedIn(lookingForMap[profile.looking_for] || 'both');
      }
      setFiltersLoaded(true);
      console.log('Filtros carregados do perfil:', {
        maxDistance: profile.filter_max_distance,
        ageRange: [profile.filter_min_age, profile.filter_max_age],
        lookingFor: profile.looking_for
      });
    }
  }, [profile, filtersLoaded]);

  // Fetch Feed when entering Home
  useEffect(() => {
    if (currentScreen === ScreenState.HOME && user && feedProfiles.length === 0 && filtersLoaded) {
      // Get location first if possible
      if (navigator.geolocation && !myLocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setMyLocation({ latitude, longitude });

            // Update profile in background
            if (user) {
              await profiles.update(user.id, { latitude, longitude });
            }

            // Fetch feed with location
            fetchFeed({ latitude, longitude });
          },
          (err) => {
            console.error("Location error:", err);
            fetchFeed(); // Fetch without location
          }
        );
      } else {
        fetchFeed(myLocation || undefined);
      }
    }
  }, [currentScreen, user, filtersLoaded]);

  // ... (Fetch Matches useEffect) ...

  const fetchFeed = async (location?: { latitude: number, longitude: number }) => {
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
          imageUrl: p.photos?.[0]?.url || 'https://picsum.photos/400/600',
          photos: p.photos?.map((ph: any) => ph.url) || ['https://picsum.photos/400/600'],
          distance: p.distance !== undefined ? Math.round(p.distance) : 0,
          verified: p.is_verified || false,
          zodiacSign: p.zodiac_sign,
          profession: p.profession,
          education: p.education,
          height: p.height,
        }));

        // Filter out duplicates if any
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
  };

  // Handle auth state changes
  useEffect(() => {
    console.log(`authLoading=${authLoading} isAuthenticated=${isAuthenticated} userId=${user?.id ?? 'null'} profileId=${profile?.id ?? 'null'}`);
    if (!authLoading) {
      if (isAuthenticated && profile) {
        // Verifica se o onboarding foi completado
        const onboardingCompleted = profile?.onboarding_completed === true;

        if (onboardingCompleted) {
          // Usuário logado com onboarding completo -> vai pro feed
          if (currentScreen === ScreenState.LOGIN || currentScreen === ScreenState.ONBOARDING) {
            console.log('Navegando para HOME (onboarding completo)');
            setCurrentScreen(ScreenState.HOME);
          }
        } else {
          // Usuário logado mas onboarding incompleto -> vai pro onboarding
          console.log('Navegando para ONBOARDING (onboarding incompleto)');
          setCurrentScreen(ScreenState.ONBOARDING);
        }
      } else {
        // Não logado -> tela de login
        console.log('Navegando para LOGIN (não autenticado)');
        setCurrentScreen(ScreenState.LOGIN);
      }
    }
  }, [authLoading, isAuthenticated, profile?.onboarding_completed]);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const fetchMatches = async () => {
    if (!user) return;
    setLoadingMatches(true);
    const { data, error } = await matches.getAll(user.id);
    if (data) {
      const formattedMatches: Chat[] = data.map((m: any) => {
        const otherUser = m.user1_id === user.id ? m.user2 : m.user1;
        // conversation pode vir como array ou objeto dependendo da query
        const conversation = Array.isArray(m.conversation) ? m.conversation[0] : m.conversation;

        const lastMsg = conversation?.last_message_content || 'Comece a conversar!';
        const lastTime = conversation?.last_message_at
          ? new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';

        return {
          id: m.id,
          otherUserId: otherUser.id,
          name: otherUser.name,
          imageUrl: otherUser.photos?.[0]?.url || 'https://picsum.photos/200',
          lastMessage: lastMsg,
          timestamp: lastTime,
          unreadCount: 0,
          conversationId: conversation?.id,
          isVip: otherUser.is_vip
        };
      });
      setMatchesList(formattedMatches);
    }
    setLoadingMatches(false);
  };

  const fetchReceivedLikes = async () => {
    if (!user) return;
    const { data, error } = await swipes.getReceivedLikes(user.id);
    if (error) {
      console.error('Erro ao buscar likes recebidos:', error);
    }
    if (data) {
      setReceivedLikes(data);
    }
  };

  // Fetch Matches and Likes when entering Chat screen
  useEffect(() => {
    if (currentScreen === ScreenState.CHAT && user) {
      fetchMatches();
      fetchReceivedLikes();
    }
  }, [currentScreen, user]);

  // Real-time listener for new messages (updates chat list)
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages where I'm the recipient
    const channel = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          console.log('Nova mensagem recebida (chat list):', newMsg);

          // Update the matchesList with the new message
          setMatchesList(prev => {
            return prev.map(chat => {
              if (chat.conversationId === newMsg.conversation_id) {
                return {
                  ...chat,
                  lastMessage: newMsg.content || (newMsg.image_url ? '📷 Imagem' : ''),
                  timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  unreadCount: newMsg.sender_id !== user.id ? (chat.unreadCount || 0) + 1 : chat.unreadCount,
                };
              }
              return chat;
            });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Actions
  const handleSwipe = async (direction: SwipeDirection) => {
    if (!user || !currentProfile) return;

    // Vertical Logic:
    // UP = PASS (Next Profile)
    // DOWN = PEGA (Like)

    const action = direction === 'down' ? 'like' : 'pass';

    if (direction === 'down') {
      // "Pega" logic - check limits
      if (swipeCount >= DAILY_FREE_SWIPES && !isVip) {
        setCurrentScreen(ScreenState.VIP);
        return;
      }
      setSwipeCount(prev => prev + 1);
    }

    setLastDirection(direction);

    // Animate transition and update state
    setTimeout(() => {
      setLastDirection(null);
      setFeedProfiles(prev => prev.slice(1)); // Remove first profile

      // Fetch more if running low
      if (feedProfiles.length < 3) {
        fetchFeed();
      }
    }, 300);

    // Call API
    try {
      console.log('Enviando swipe:', { userId: user.id, profileId: currentProfile.id, action });
      const { match, error } = await swipes.create(user.id, currentProfile.id, action);

      console.log('Resposta do swipe:', JSON.stringify({ match, error }, null, 2));

      if (error) {
        console.error('Erro ao registrar swipe:', error);
      }

      // Se houve match, enviar push notification para ambos
      if (match) {
        console.log('MATCH ENCONTRADO!', match);
        // Fetch my photo for the modal
        const myPhoto = user.user_metadata.avatar_url || 'https://picsum.photos/200';

        setMatchModalData({
          isOpen: true,
          theirName: currentProfile.name,
          theirPhotoUrl: currentProfile.imageUrl,
          myPhotoUrl: myPhoto,
        });

        // Tentar enviar mensagem de quebra-gelo automática (Bio)
        if (profile?.bio) {
          console.log('Enviando quebra-gelo automático...');
          // Aguardar um pouco para garantir que a trigger criou a conversa
          setTimeout(async () => {
            try {
              const { data: conversation } = await supabase
                .from('conversations')
                .select('id')
                .eq('match_id', match.id)
                .single();

              if (conversation) {
                await messages.send(conversation.id, user.id, profile.bio, currentProfile.id);
                console.log('Quebra-gelo enviado com sucesso!');
              } else {
                console.log('Conversa não encontrada para envio do quebra-gelo.');
              }
            } catch (err) {
              console.error('Erro ao enviar quebra-gelo:', err);
            }
          }, 1000); // 1 segundo de delay
        }

        // Refresh matches list in background
        fetchMatches();
      }
    } catch (err) {
      console.error('Erro na requisição de swipe:', err);
    }
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    }
    setLoginLoading(false);
    // O redirect é feito automaticamente pelo useEffect
  };

  const handleOnboardingComplete = async (data: {
    name: string;
    bio: string;
    birthDate: string;
    gender: 'male' | 'female' | 'other';
    lookingFor: 'male' | 'female' | 'both';
    photos: string[];
  }) => {
    console.log('handleOnboardingComplete chamado com:', data);

    const { error } = await createProfile({
      name: data.name,
      bio: data.bio,
      birth_date: data.birthDate,
      gender: data.gender,
      looking_for: data.lookingFor,
    });

    console.log('createProfile resultado - error:', error);

    if (error) {
      console.error('Erro ao criar perfil:', error);
      alert('Erro ao salvar perfil: ' + (error.message || JSON.stringify(error)));
      return;
    }

    console.log('Perfil criado com sucesso, redirecionando para HOME');
    setCurrentScreen(ScreenState.HOME);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentScreen(ScreenState.LOGIN);
  };

  const handlePurchaseVip = () => {
    setIsVip(true);
    setCurrentScreen(ScreenState.HOME);
  };

  // Drag Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (lastDirection) return; // Don't allow drag during animation
    const y = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ y });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!dragStart || !isDragging) return;
    const y = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaY = y - dragStart.y;
    setDragOffset(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = 100; // px to trigger swipe
    if (dragOffset > threshold) {
      handleSwipe('down');
    } else if (dragOffset < -threshold) {
      handleSwipe('up');
    }

    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  // Renderers
  const renderProfileViewer = () => {
    if (!viewingProfile) return null;

    const handleLikeFromViewer = async () => {
      if (!user) return;
      try {
        const { match } = await swipes.create(user.id, viewingProfile.id, 'like');
        setViewingProfile(null);
        fetchReceivedLikes();
        fetchMatches();

        if (match) {
          const myPhoto = user.user_metadata.avatar_url || 'https://picsum.photos/200';
          setMatchModalData({
            isOpen: true,
            theirName: viewingProfile.name,
            theirPhotoUrl: viewingProfile.imageUrl,
            myPhotoUrl: myPhoto,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    const handlePassFromViewer = async () => {
      if (!user) return;
      try {
        await swipes.create(user.id, viewingProfile.id, 'pass');
        setViewingProfile(null);
        fetchReceivedLikes();
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header with Back button */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setViewingProfile(null)}
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* SwipeCard reused - force isActive to true so it shows info */}
        <div className="flex-1 relative">
          <SwipeCard profile={viewingProfile} isActive={true} myZodiacSign={profile?.zodiac_sign} />
        </div>

        {/* Action Buttons */}
        <div className="h-24 bg-black flex items-center justify-center gap-8 pb-4 pt-2">
          <button
            onClick={handlePassFromViewer}
            className="w-14 h-14 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-800 border border-white/10 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors shadow-lg"
          >
            <X size={28} />
          </button>
          <button
            onClick={handleLikeFromViewer}
            className="w-16 h-16 rounded-full bg-gradient-to-b from-brasil-green-light to-brasil-green flex items-center justify-center text-white shadow-lg shadow-brasil-green/40 hover:scale-105 transition-transform border-2 border-white/20"
          >
            <Heart size={32} fill="white" />
          </button>
        </div>
      </div>
    );
  };

  const renderLogin = () => (
    <div className="flex flex-col h-full w-full relative bg-brasil-blue animate-fade-in overflow-hidden">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brasil-blue via-brasil-green to-brasil-yellow/30 pointer-events-none" />

      {/* Fluid Shapes */}
      <div className="absolute -top-[20%] -right-[20%] w-[90%] h-[60%] bg-gradient-to-b from-brasil-yellow to-transparent rounded-full blur-[80px] opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[90%] h-[60%] bg-gradient-to-t from-brasil-green to-transparent rounded-full blur-[80px] opacity-40 animate-pulse delay-1000 pointer-events-none" />

      {/* Content Container - não deixa o conteúdo crescer demais em telas baixas */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-6 px-6 pt-8 pb-2 z-10 relative min-h-0 max-h-[60%]">

        {/* Logo Section */}
        <div className="relative group scale-90 sm:scale-100">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />

          {/* Icon Container */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-brasil-yellow to-brasil-green rounded-[2rem] flex items-center justify-center shadow-2xl rotate-6 border-[6px] border-white/20 backdrop-blur-sm relative z-10 hover:rotate-3 transition-transform duration-500">
            <div className="text-white drop-shadow-lg transform -rotate-6">
              <ThumbsUp size={52} className="sm:w-16 sm:h-16" fill="white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Decorative 'Heart' Badge */}
          <div className="absolute -top-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-brasil-blue rounded-full border-4 border-white/30 flex items-center justify-center z-20 shadow-lg animate-bounce duration-[3000ms]">
            <Heart size={20} className="text-white" fill="white" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tighter drop-shadow-xl font-sans leading-none">
            Pega ou <br />
            <span className="text-brasil-yellow inline-block transform -rotate-2 mt-2">Passa</span>
          </h1>
          <div className="h-1 w-20 bg-white/30 rounded-full mx-auto my-3" />
          <p className="text-white/90 font-medium text-sm sm:text-lg max-w-[260px] sm:max-w-[280px] mx-auto leading-relaxed drop-shadow-md">
            O jeito brasileiro de encontrar seu par ideal.
          </p>
        </div>
      </div>

      {/* Login Section - barra fixa na parte inferior do frame do app */}
      <div className="w-full max-w-sm mx-auto z-10 shrink-0 pb-4 sm:pb-6 px-6 sm:px-8">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="transform transition-transform hover:scale-105 duration-200">
            <Button
              variant="google"
              fullWidth
              onClick={handleLogin}
              disabled={loginLoading}
              className="shadow-2xl h-12 sm:h-14 text-sm sm:text-base border-2 border-transparent hover:border-brasil-yellow/50"
            >
              {loginLoading ? (
                <Loader2 size={24} className="animate-spin mr-3" />
              ) : (
                <img
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgd2lkdGg9IjQ4cHgiIGhlaWdodD0iNDhweCI+PHBhdGggZmlsbD0iI0ZGQzEwNyIgZD0iTTQzLjYxMSwyMC4wODNINDJWMjBIMjR2OGgxMS4zMDNjLTEuNjQ5LDQuNjU3LTYuMDgsOC0xMS4zMDMsOGMtNi42MjcsMC0xMi01LjM3My0xMi0xMmMwLTYuNjI3LDUuMzczLTEyLDEyLTEyYzMuMDU5LDAsNS44NDIsMS4xNTQsNy45NjEsMy4wMzlsNS42NTctNS42NTdDMzQuMDQ2LDYuMDUzLDI5LjI2OCw0LDI0LDRDMTIuOTU1LDQsNCwxMi45NTUsNCwyNGMwLDExLjA0NSw4Ljk1NSwyMCwyMCwyMGMxMS4wNDUsMCwyMC04Ljk1NSwyMC0yMEM0NCwyMi42NTksNDMuODYyLDIxLjM1LDQzLjYxMSwyMC4wODN6Ii8+PHBhdGggZmlsbD0iI0ZGM0QwMCIgZD0iTTYuMzA2LDE0LjY5MWw2LjU3MSw0LjgxOUMxNC42NTUsMTUuMTA4LDE4Ljk2MSwxMiwyNCwxMmMzLjA1OSwwLDUuODQyLDEuMTU0LDcuOTYxLDMuMDM5bDUuNjU3LTUuNjU3QzM0LjA0Niw2LjA1MywyOS4yNjgsNCwyNCw0QzE2LjMxOCw0LDkuNjU2LDguMzM3LDYuMzA2LDE0LjY5MXoiLz48cGF0aCBmaWxsPSIjNENBRjUwIiBkPSJNMjQsNDRjNS4xNjYsMCw5Ljg2LTEuOTc3LDEzLjQwOS01LjE5MmwtNi4xOTAtNS4yMzhDMjkuMjExLDM1LjA5MSwyNi43MTUsMzYsMjQsMzZjLTUuMjAyLDAtOS42MTktMy4zMTctMTEuMjgzLTcuOTQ2bC02LjUyMiw1LjAyNUM5LjUwNSwzOS41NTYsMTYuMjI3LDQ0LDI0LDQ0eiIvPjxwYXRoIGZpbGw9IiMxOTc2RDIiIGQ9Ik00My42MTEsMjAuMDgzSDQyVjIwSDI0djhoMTEuMzAzYy0wLjc5MiwyLjIzNy0yLjIzMSw0LjE2Ni00LjA4Nyw1LjU3MWMwLjAwMS0wLjAwMSwwLjAwMi0wLjAwMSwwLjAwMy0wLjAwMmw2LjE5MCw1LjIzOEMzNi45NzEsMzkuMjA1LDQ0LDM0LDQ0LDI0QzQ0LDIyLjY1OSw0My44NjIsMjEuMzUsNDMuNjExLDIwLjA4M3oiLz48L3N2Zz4="
                  alt="Google"
                  className="w-6 h-6 sm:w-7 sm:h-7 mr-3"
                />
              )}
              {loginLoading ? 'Entrando...' : 'Entrar com Google'}
            </Button>
          </div>

          <p className="text-white/60 text-[10px] sm:text-xs text-center font-medium leading-relaxed">
            Ao continuar, você concorda com nossos <br />
            <button className="underline decoration-brasil-yellow underline-offset-4 text-white hover:text-brasil-yellow transition-colors font-bold mt-1">
              Termos de Uso
            </button>.
          </p>
        </div>
      </div>
    </div>
  );



  const handleUnmatchSuccess = (matchId: string) => {
    setMatchesList(prev => prev.filter(m => m.id !== matchId));
    setActiveChat(null);
  };

  const renderHome = () => {
    // Loading State
    if (loadingFeed && feedProfiles.length === 0) {
      return (
        <div className="relative h-full w-full bg-black flex flex-col items-center justify-center p-4 animate-fade-in">
          {/* Skeleton Card */}
          <div className="w-full h-full rounded-3xl overflow-hidden relative bg-zinc-900 border border-zinc-800">
            {/* Image Skeleton */}
            <div className="absolute inset-0 skeleton opacity-20" />

            {/* Text Skeletons */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pt-20">
              <div className="h-8 w-48 bg-zinc-800 rounded-lg mb-3 skeleton opacity-50" />
              <div className="h-4 w-32 bg-zinc-800 rounded-lg mb-2 skeleton opacity-40" />
              <div className="h-16 w-full bg-zinc-800 rounded-lg skeleton opacity-30" />
            </div>
          </div>

          {/* Floating Buttons Skeleton */}
          <div className="absolute bottom-24 right-4 flex flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 skeleton opacity-50" />
            <div className="w-14 h-14 rounded-full bg-zinc-800 skeleton opacity-40" />
          </div>
        </div>
      );
    }

    // Empty State
    if (feedProfiles.length === 0) {
      return (
        <div className="relative h-full w-full bg-zinc-950 flex flex-col items-center justify-center p-8 text-center animate-fade-in overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-brasil-blue/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-brasil-green/5 blur-[100px] rounded-full" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-black/50 border border-zinc-800 rotate-3 transform hover:rotate-6 transition-transform duration-500">
              <Search size={40} className="text-zinc-500" />
            </div>

            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
              Zerou o Game! <span className="text-2xl">🎮</span>
            </h2>

            <p className="text-zinc-400 mb-8 max-w-[280px] text-sm font-medium leading-relaxed">
              Você já viu todo mundo por aqui. Que tal expandir seus horizontes?
            </p>

            <div className="flex flex-col gap-3 w-full max-w-[260px]">
              <Button onClick={() => setShowFilterModal(true)} className="!bg-white !text-black hover:!bg-zinc-200 !font-black !h-12 shadow-lg shadow-white/5">
                Ajustar Filtros
              </Button>

              <button
                onClick={fetchFeed}
                className="py-3 text-brasil-yellow font-bold text-xs uppercase tracking-widest hover:text-brasil-yellow/80 transition-colors"
              >
                Buscar Novamente
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-full w-full bg-black animate-fade-in">
        {/* Card Stack (TikTok Vertical Style) */}
        <div className="relative w-full h-full overflow-hidden">

          {/* Current Profile (Active) */}
          {currentProfile && (
            <div
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${lastDirection === 'up' ? '-translate-y-full opacity-0' :
                lastDirection === 'down' ? 'translate-y-full opacity-0' : 'translate-y-0'
                }`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              <SwipeCard
                profile={currentProfile}
                isActive={true}
                swipeDirection={lastDirection}
                dragOffset={dragOffset}
                myZodiacSign={profile?.zodiac_sign}
                activeFilters={{
                  minHeight: minHeight,
                  zodiac: filterZodiac
                }}
              />
            </div>
          )}

          {/* Next Profile (Preloaded behind) */}
          {nextProfile && (
            <div className="absolute inset-0 -z-10">
              <SwipeCard
                profile={nextProfile}
                isActive={false}
                myZodiacSign={profile?.zodiac_sign}
              />
            </div>
          )}

          {/* Top Bar - Status VIP/Free - Redesigned */}
          {/* Top Bar - Status VIP/Free - Minimalist */}
          <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
            <div className="flex justify-center pt-12 pb-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              {!isVip && (
                <div className="flex items-center gap-3 pointer-events-auto">
                  {/* Progress Bar Minimal */}
                  <div className="flex flex-col gap-1 w-32">
                    <div className="flex justify-between items-end px-1">
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Likes</span>
                      <span className="text-[10px] font-bold text-white/80">{swipeCount}/{DAILY_FREE_SWIPES}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className="h-full bg-brasil-green shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                        style={{ width: `${Math.min((swipeCount / DAILY_FREE_SWIPES) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Button Minimal */}
                  <button
                    onClick={() => setCurrentScreen(ScreenState.VIP)}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 transition-all active:scale-95"
                  >
                    <Crown size={14} className="text-brasil-yellow" fill="#FFDF00" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">Sem Limites</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Floating Action Buttons - Redesigned Area */}
          <div
            className="absolute right-4 z-20 flex flex-col gap-4 items-center"
            style={{ bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Pega (Down) - Like */}
            <button
              onClick={() => handleSwipe('down')}
              className="w-[70px] h-[70px] rounded-full bg-brasil-green flex items-center justify-center shadow-2xl shadow-brasil-green/40 hover:scale-105 active:scale-95 transition-all border-4 border-white/10 group"
            >
              <ThumbsUp size={36} className="text-white group-hover:rotate-12 transition-transform" fill="white" />
            </button>

            {/* Passa (Up) - Pass */}
            <button
              onClick={() => handleSwipe('up')}
              className="w-[70px] h-[70px] rounded-full bg-zinc-900/90 backdrop-blur-md flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-2xl border border-white/10 group"
            >
              <X size={36} className="text-white/80 group-hover:text-white transition-colors" strokeWidth={3} />
            </button>
          </div>

          {/* Tutorial Overlay */}
          {showTutorial && (
            <div
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white"
              onClick={dismissTutorial}
            >
              <div className="flex flex-col items-center animate-bounce mb-8">
                <ChevronUp size={48} className="text-white/50" />
                <span className="font-bold text-xl mb-2">PASSAR</span>
                <span className="text-sm text-zinc-400">Deslize para cima</span>
              </div>

              <div className="w-20 h-32 border-2 border-white/30 rounded-full flex items-center justify-center relative my-4">
                <div className="w-16 h-16 bg-white/20 rounded-full absolute animate-ping" />
                <Hand size={40} />
              </div>

              <div className="flex flex-col items-center animate-bounce mt-8">
                <span className="text-sm text-zinc-400">Deslize para baixo</span>
                <span className="font-bold text-xl mt-2 text-brasil-green">PEGAR</span>
                <ChevronDown size={48} className="text-brasil-green/50" />
              </div>

              <p className="absolute bottom-28 text-sm text-white/50">Toque para começar</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFilterModal = () => (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="bg-white w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-brasil-blue flex items-center gap-2">
            <SlidersHorizontal size={24} /> O Que Eu Busco
          </h2>
          <button
            onClick={() => setShowFilterModal(false)}
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
              <span className="text-brasil-blue">{maxDistance >= 100 ? '100km+' : `${maxDistance}km`}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
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
                } else {
                  console.log('Filtros salvos com sucesso:', {
                    filter_max_distance: maxDistance,
                    filter_min_age: ageRange[0],
                    filter_max_age: ageRange[1],
                    looking_for: lookingForMap[interestedIn],
                  });
                }
              }

              setShowFilterModal(false);
              setFeedProfiles([]); // Clear feed to force refresh
              fetchFeed(); // Apply filters
            }} className="bg-gradient-to-r from-brasil-green to-teal-600 shadow-xl shadow-brasil-green/20">
              <Check size={20} className="mr-2" /> Salvar Preferências
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // renderProfile removido em favor do componente Profile.tsx

  // Main Render Switch
  // Tela de boot: mostrar enquanto authLoading for true
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Mostra erro se houver problema com o banco
  if (authError && isAuthenticated) {
    return (
      <div className="w-full h-[100dvh] bg-brasil-blue text-white overflow-hidden flex flex-col items-center justify-center font-sans p-6">
        <div className="w-full max-w-[480px] h-full relative bg-white shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <X size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erro de Conexão</h1>
          <p className="text-zinc-600 mb-4">{authError}</p>
          <p className="text-sm text-zinc-400 mb-6">
            Verifique se o banco de dados Supabase está configurado corretamente
            e se a tabela "profiles" existe com as políticas RLS corretas.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] bg-brasil-blue text-white overflow-hidden flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-[480px] h-full relative bg-white shadow-2xl overflow-hidden flex flex-col">

        {/* Main Content Area */}
        <div className="flex-1 relative w-full overflow-hidden">
          {currentScreen === ScreenState.LOGIN && renderLogin()}
          {currentScreen === ScreenState.ONBOARDING && user && (
            <Onboarding
              userId={user.id}
              onComplete={handleOnboardingComplete}
            />
          )}
          {currentScreen === ScreenState.HOME && renderHome()}
          {currentScreen === ScreenState.CHAT && (
            activeChat ? (
              <ChatScreen
                conversationId={activeChat.conversationId}
                matchId={activeChat.id}
                currentUserId={user.id}
                currentUserIsVip={isVip}
                currentUserName={profile?.name || 'Alguém'}
                otherUserId={activeChat.otherUserId}
                otherUserName={activeChat.name}
                otherUserPhoto={activeChat.imageUrl}
                otherUserIsVip={activeChat.isVip}
                onBack={() => setActiveChat(null)}
                onUnmatch={() => handleUnmatchSuccess(activeChat.id)}
                onViewProfile={() => {
                  // Mock profile data from chat info since we don't have full profile
                  // In a real app, we might fetch the full profile here
                  const mockProfile: ProfileType = {
                    id: activeChat.otherUserId,
                    name: activeChat.name,
                    age: 0, // We might not have this in chat object
                    bio: '',
                    imageUrl: activeChat.imageUrl,
                    photos: [activeChat.imageUrl],
                    distance: 0,
                    verified: false,
                    zodiacSign: '',
                    profession: '',
                    education: '',
                    height: 0
                  };
                  setViewingProfile(mockProfile);
                }}
              />
            ) : (
              <ChatList
                matchesList={matchesList}
                receivedLikes={receivedLikes}
                isVip={isVip}
                loadingMatches={loadingMatches}
                onChatSelect={setActiveChat}
                onVipClick={() => setCurrentScreen(ScreenState.VIP)}
                onViewProfile={(p) => {
                  setViewingProfile(p);
                  // Optionally navigate or just show modal
                }}
              />
            )
          )}
          {currentScreen === ScreenState.VIP && (
            <VipScreen
              price={VIP_PRICE}
              onPurchase={handlePurchaseVip}
              onClose={() => setCurrentScreen(ScreenState.HOME)}
            />
          )}
          {currentScreen === ScreenState.PROFILE && (
            <Profile
              user={user}
              profile={profile}
              isVip={isVip}
              swipeCount={swipeCount}
              onNavigate={setCurrentScreen}
              onLogout={handleLogout}
              onShowFilter={() => setShowFilterModal(true)}
            />
          )}
          {currentScreen === ScreenState.EDIT_PROFILE && user && (
            <EditProfile
              userId={user.id}
              onBack={() => setCurrentScreen(ScreenState.PROFILE)}
              onSave={() => setCurrentScreen(ScreenState.PROFILE)}
            />
          )}
        </div>

        {/* Bottom Navigation - Fixed at bottom via Flexbox */}
        {!activeChat && !viewingProfile && <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />}

        {/* Overlays / Modals */}
        {viewingProfile && renderProfileViewer()}

        {/* Modals */}
        <MatchModal
          isOpen={matchModalData.isOpen}
          theirName={matchModalData.theirName}
          theirPhotoUrl={matchModalData.theirPhotoUrl}
          myPhotoUrl={matchModalData.myPhotoUrl}
          onClose={() => setMatchModalData(prev => ({ ...prev, isOpen: false }))}
          onChat={() => {
            setMatchModalData(prev => ({ ...prev, isOpen: false }));
            setCurrentScreen(ScreenState.CHAT);
          }}
          onKeepSwiping={() => setMatchModalData(prev => ({ ...prev, isOpen: false }))}
        />
        {showFilterModal && renderFilterModal()}
      </div>
    </div>
  );
};

export default App;