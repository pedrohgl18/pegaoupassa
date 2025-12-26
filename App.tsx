import React, { useState, useEffect } from 'react';
import { ScreenState, Chat, Profile as ProfileType } from './types';
import { calculateAge } from './utils';

// Hooks
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useGeolocation } from './hooks/useGeolocation';
import { useFeed } from './hooks/useFeed';
import { useMatchData } from './hooks/useMatchData';
import { useNotifications } from './hooks/useNotifications';
import { swipes, matches } from './lib/supabase'; // Needed for manual helper functions like unmatch

// Components (Router)
import { AppRouter } from './AppRouter';
import { FilterModal } from './components/FilterModal';
import { VipSettingsModal } from './components/VipSettingsModal';
import { ProfileViewer } from './components/ProfileViewer';

const App: React.FC = () => {
  // 1. Core Hooks
  const auth = useAuth();
  const nav = useAppNavigation();

  // 2. Data Hooks
  const { myLocation } = useGeolocation(auth.user, auth.profile, auth.isAuthenticated);
  const feed = useFeed({ user: auth.user, profile: auth.profile, myLocation });
  const matchData = useMatchData(auth.user);

  // 3. UI State (Coordinator)
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ProfileType | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showVipSettingsModal, setShowVipSettingsModal] = useState(false);
  const [showVibeSelector, setShowVibeSelector] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
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

  const [swipeCount, setSwipeCount] = useState(0);

  // 4. Effects for Data Fetching
  // Fetch Feed when entering Home
  useEffect(() => {
    if (nav.currentScreen === ScreenState.HOME && auth.user && feed.feedProfiles.length === 0 && feed.filters.filtersLoaded) {
      feed.fetchFeed(myLocation || undefined);
    }
  }, [nav.currentScreen, auth.user, feed.filters.filtersLoaded, myLocation]);

  // Fetch Matches when entering Chat
  useEffect(() => {
    if (nav.currentScreen === ScreenState.CHAT && auth.user) {
      matchData.fetchMatches();
      matchData.fetchReceivedLikes();
    }
  }, [nav.currentScreen, auth.user]);

  useEffect(() => {
    if (auth.profile?.daily_likes_count !== undefined) {
      setSwipeCount(auth.profile.daily_likes_count);
    }
  }, [auth.profile?.daily_likes_count]);

  // Hardware Back Button Handler
  useEffect(() => {
    import('@capacitor/app').then(({ App: CapApp }) => {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        // 1. Close Modals if open
        if (showFilterModal) {
          setShowFilterModal(false);
          return;
        }
        if (showVipSettingsModal) {
          setShowVipSettingsModal(false);
          return;
        }
        if (showVibeSelector) {
          setShowVibeSelector(false);
          return;
        }
        if (matchModalData.isOpen) {
          setMatchModalData(prev => ({ ...prev, isOpen: false }));
          return;
        }
        if (viewingProfile) {
          setViewingProfile(null);
          return;
        }
        if (showTutorial) {
          setShowTutorial(false);
          return;
        }

        // 2. Navigation Logic
        // If in Chat -> Back to List
        if (nav.currentScreen === ScreenState.CHAT && activeChat) {
          setActiveChat(null);
          nav.setCurrentScreen(ScreenState.CHAT); // Refresh list
          return;
        }

        // If in Sub-screens -> Back to Main Tabs
        if ([ScreenState.VIP, ScreenState.EDIT_PROFILE, ScreenState.ADMIN].includes(nav.currentScreen)) {
          nav.goBack();
          return;
        }

        // If in Main Tabs (Chat List, Profile) -> Back to Home
        if (nav.currentScreen !== ScreenState.HOME && nav.currentScreen !== ScreenState.LOGIN) {
          nav.setCurrentScreen(ScreenState.HOME);
          return;
        }

        // If in Home, Minimize App (Default Android behavior usually handled by system if we don't trap it, but here we can exit)
        if (nav.currentScreen === ScreenState.HOME) {
          CapApp.exitApp();
        }
      });
    });

    return () => {
      import('@capacitor/app').then(({ App: CapApp }) => {
        CapApp.removeAllListeners();
      });
    }
  }, [showFilterModal, showVipSettingsModal, showVibeSelector, matchModalData.isOpen, viewingProfile, showTutorial, nav.currentScreen, activeChat]);

  // Auth Navigation Logic
  useEffect(() => {
    if (!auth.loading) {
      if (auth.isAuthenticated && auth.profile) {
        const onboardingCompleted = auth.profile.onboarding_completed === true;

        if (onboardingCompleted) {
          // If in Login/Onboarding but finished, go Home
          if (nav.currentScreen === ScreenState.LOGIN || nav.currentScreen === ScreenState.ONBOARDING) {
            nav.setCurrentScreen(ScreenState.HOME);
          }
        } else {
          // If not finished, go Onboarding
          if (nav.currentScreen !== ScreenState.ONBOARDING) {
            nav.setCurrentScreen(ScreenState.ONBOARDING);
          }
        }
      } else {
        // Not auth -> Login
        if (nav.currentScreen !== ScreenState.LOGIN) {
          nav.setCurrentScreen(ScreenState.LOGIN);
        }
      }
    }
  }, [auth.loading, auth.isAuthenticated, auth.profile?.onboarding_completed]);

  // 5. Notification Logic
  useNotifications({
    user: auth.user,
    activeChatId: activeChat?.conversationId,
    onNavigateToChaList: () => nav.setCurrentScreen(ScreenState.CHAT), // Correct ScreenState
    onOpenChat: (chat) => {
      setActiveChat(chat);
      nav.setCurrentScreen(ScreenState.CHAT);
    }
  });


  // 6. Helper Functions (Handlers passed to Router)
  const handleVipPurchase = async () => {
    try {
      // Use RPC call instead of direct update (which is blocked)
      const { error } = await supabase.rpc('purchase_vip');

      if (error) {
        alert('Erro ao processar VIP. Tente novamente.');
        return;
      }

      // Refresh profile to reflect changes
      await auth.refreshProfile();

      // Fix Navigation Bug: Clear active chat so BottomNav reappears
      setActiveChat(null);
      nav.setCurrentScreen(ScreenState.HOME);
    } catch (err) {
      // Silent fail
    }
  };

  const handleSelectVibe = async (vibeId: string) => {
    if (!auth.user) return;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await auth.updateProfile({
      vibe_status: vibeId,
      vibe_expires_at: expiresAt,
      last_vibe_activation: new Date().toISOString()
    });
    setShowVibeSelector(false);
  };

  const handleUnmatchSuccess = (matchId: string) => {
    // We need to update local state logic if MatchData hook doesn't expose a 'remove' function.
    // Ideally useMatchData exposes update methods.
    // For now we assume we refresh matches.
    matchData.fetchMatches();
    setActiveChat(null);
  };

  const handlePreviewProfile = () => {
    if (!auth.profile || !auth.user) return;
    const p = auth.profile;
    const preview: ProfileType = {
      id: auth.user.id,
      name: p.name || auth.user.user_metadata.full_name || 'Você',
      age: calculateAge(p.birth_date || ''),
      bio: p.bio || '',
      imageUrl: p.photos?.[0]?.url || '',
      photos: p.photos?.sort((a: any, b: any) => a.position - b.position).map((x: any) => x.url) || [],
      distance: 0,
      verified: p.is_verified || false,
      zodiacSign: p.zodiac_sign,
      profession: p.profession,
      education: p.education,
      height: p.height,
      interests: p.user_interests?.map((ui: any) => ui.interest) || [],
      vibeStatus: p.vibe_status,
      vibeExpiresAt: p.vibe_expires_at,
      neighborhood: p.neighborhood,
      tags: p.tags // Added tags mapping
    };
    setViewingProfile(preview);
  };

  // 7. Render Renderers (for Modals) passed to AppRouter
  // We pass COMPONENTS or Function that returns JSX?
  // AppRouter expects functions `renderFilterModal`.

  const renderFilterModal = () => (
    <FilterModal
      isOpen={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      user={auth.user}
      filters={feed.filters}
      onSave={() => {
        feed.setFeedProfiles([]); // Clear to refresh
        feed.fetchFeed();
      }}
    />
  );

  const renderVipSettingsModal = () => (
    <VipSettingsModal
      isOpen={showVipSettingsModal}
      onClose={() => setShowVipSettingsModal(false)}
      profile={auth.profile}
      updateProfile={auth.updateProfile}
    />
  );

  const renderProfileViewer = () => {
    if (!viewingProfile) return null;
    return (
      <ProfileViewer
        user={auth.user}
        profile={auth.profile}
        viewingProfile={viewingProfile}
        isVip={auth.isVip}
        swipeCount={swipeCount}
        incrementSwipeCount={() => setSwipeCount(p => p + 1)}
        onClose={() => setViewingProfile(null)}
        onVipGate={() => {
          setViewingProfile(null);
          nav.setCurrentScreen(ScreenState.VIP);
        }}
        onMatch={(match, p) => {
          const myPhoto = auth.profile?.photos?.[0]?.url || auth.user?.user_metadata.avatar_url || '';
          setMatchModalData({
            isOpen: true,
            theirName: p.name,
            theirPhotoUrl: p.imageUrl,
            myPhotoUrl: myPhoto
          });
        }}
        onActionComplete={() => {
          matchData.fetchReceivedLikes();
        }}
      />
    );
  };


  return (
    <AppRouter
      auth={auth}
      navigation={nav}
      feed={{
        ...feed,
        swipeCount,
        setSwipeCount
      }}
      matches={matchData}
      chat={{
        activeChat,
        setActiveChat
      }}
      ui={{
        showFilterModal,
        setShowFilterModal,
        showVipSettingsModal,
        setShowVipSettingsModal,
        showVibeSelector,
        setShowVibeSelector,
        showTutorial,
        setShowTutorial,
        isVip: auth.isVip,
        viewingProfile,
        setViewingProfile,
        matchModalData,
        setMatchModalData,
        onVipPurchase: handleVipPurchase,
        renderFilterModal,
        renderVipSettingsModal,
        renderProfileViewer,
        handleSelectVibe,
        handleUnmatchSuccess,
        handlePreviewProfile
      }}
    />
  );
};

export default App;