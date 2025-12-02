import React from 'react';
import { ScreenState } from '../types';
import { ThumbsUp, MessageCircle, User } from 'lucide-react';

interface BottomNavProps {
  currentScreen: ScreenState;
  onNavigate: (screen: ScreenState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  // Only show nav on specific screens
  if (![ScreenState.HOME, ScreenState.CHAT, ScreenState.PROFILE].includes(currentScreen)) {
    return null;
  }

  const navItems = [
    { id: ScreenState.CHAT, icon: MessageCircle, label: 'Contatinhos' },
    { id: ScreenState.HOME, icon: ThumbsUp, label: 'Descobrir' },
    { id: ScreenState.PROFILE, icon: User, label: 'Perfil' },
  ];

  return (
    <div
      className="absolute left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl px-6 py-3 flex items-center gap-8 pointer-events-auto transform transition-all duration-300 hover:scale-105">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative group flex flex-col items-center justify-center w-12 h-12"
            >
              {/* Active Indicator Background */}
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-md animate-pulse" />
              )}

              <Icon
                size={28}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-all duration-300 z-10 ${isActive
                  ? 'text-primary scale-110 drop-shadow-[0_0_12px_rgba(58,124,165,0.5)]'
                  : 'text-gray-dark group-hover:text-gray-dark/70'
                  }`}
                fill="none"
              />

              {/* Dot Indicator */}
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_6px_#3A7CA5] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;