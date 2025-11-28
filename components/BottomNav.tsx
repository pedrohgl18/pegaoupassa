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
    { id: ScreenState.HOME, icon: ThumbsUp, label: 'Descobrir' },
    { id: ScreenState.CHAT, icon: MessageCircle, label: 'Conversas' },
    { id: ScreenState.PROFILE, icon: User, label: 'Perfil' },
  ];

  return (
    <div 
      className="w-full bg-white border-t border-zinc-100 z-50 shrink-0"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 px-6 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-brasil-blue/10' 
                  : 'hover:bg-zinc-50 active:bg-zinc-100'
              }`}
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-brasil-blue' : 'text-zinc-400'
                }`}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                isActive ? 'text-brasil-blue' : 'text-zinc-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;