import React, { useState } from 'react';
import { Profile } from '../types';
import { BadgeCheck, MapPin, Sparkles, Briefcase, GraduationCap, Ruler, ThumbsUp, X, Heart } from 'lucide-react';
import { zodiac } from '../lib/supabase';

interface SwipeCardProps {
  profile: Profile;
  isActive: boolean;
  swipeDirection?: 'up' | 'down' | null;
  dragOffset?: number;
  style?: React.CSSProperties;
  myZodiacSign?: string;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ profile, isActive, swipeDirection, dragOffset = 0, style, myZodiacSign }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : [profile.imageUrl];

  // Compatibilidade por signo
  const compatibility = zodiac.getCompatibility(myZodiacSign, profile.zodiacSign);
  const compatibilityText = zodiac.getCompatibilityText(compatibility);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Math.abs(dragOffset) > 10) return;
    if (!isActive) return;

    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const x = clientX - left;

    if (x < width / 2) {
      setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
    }
  };

  // Calculate opacity for overlays based on dragOffset
  const likeOpacity = swipeDirection === 'down' ? 1 : Math.max(0, Math.min(dragOffset / 150, 1));
  const passOpacity = swipeDirection === 'up' ? 1 : Math.max(0, Math.min(-dragOffset / 150, 1));

  // Efeito 3D baseado no drag
  const rotateX = isActive && dragOffset !== 0 ? -dragOffset * 0.08 : 0; // Rotação no eixo X (inclinação)
  const rotateZ = isActive && dragOffset !== 0 ? dragOffset * 0.03 : 0; // Rotação no eixo Z (giro)
  const scale = isActive ? 1 - Math.abs(dragOffset) * 0.0003 : 0.95; // Escala diminui levemente
  const translateY = isActive && dragOffset !== 0 ? dragOffset : 0;

  const cardStyle: React.CSSProperties = {
    ...style,
    transform: style?.transform || `
      perspective(1200px)
      translateY(${translateY}px)
      rotateX(${rotateX}deg)
      rotateZ(${rotateZ}deg)
      scale(${scale})
    `,
    transformStyle: 'preserve-3d' as const,
    transition: dragOffset === 0 ? 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
    boxShadow: isActive && dragOffset !== 0
      ? `0 ${Math.abs(dragOffset) * 0.5}px ${Math.abs(dragOffset)}px rgba(0,0,0,0.3)`
      : '0 10px 30px rgba(0,0,0,0.2)',
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
      else if (e.key === 'ArrowRight') setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, photos.length]);

  return (
    <div
      className={`absolute inset-0 w-full h-full bg-black overflow-hidden ${isActive ? 'z-10' : 'z-0 scale-95 opacity-50'
        }`}
      style={cardStyle}
      onClick={handleTap}
    >
      {/* Background Image - Full screen */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{ backgroundImage: `url(${photos[currentPhotoIndex]})` }}
      />

      {/* Gradient Overlay - Suave e Linear (70% -> 0%) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

      {/* Action Overlay - Like */}
      <div
        className="absolute inset-0 bg-brasil-green/30 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200"
        style={{ opacity: likeOpacity }}
      >
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-full border-4 border-white shadow-2xl">
          <ThumbsUp size={80} className="text-white" fill="white" />
        </div>
      </div>

      {/* Action Overlay - Pass */}
      <div
        className="absolute inset-0 bg-red-500/30 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200"
        style={{ opacity: passOpacity }}
      >
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-full border-4 border-white shadow-2xl">
          <X size={80} className="text-white" />
        </div>
      </div>

      {/* Content - Layout Otimizado */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="px-5 pb-1 flex flex-col gap-3 pr-[100px]">

          {/* Compatibilidade por Signo */}
          {myZodiacSign && profile.zodiacSign && compatibility > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg">
                <Heart size={12} className="text-brasil-yellow" fill="#FFDF00" />
                <span className="text-xs font-bold text-white">{compatibility}% Match</span>
              </div>
            </div>
          )}

          {/* Nome e Idade */}
          <div className="flex items-end gap-3">
            <h1 className="text-4xl font-black text-white drop-shadow-xl tracking-tight leading-none">
              {profile.name}
            </h1>
            <span className="text-2xl font-bold text-white/90 drop-shadow-lg mb-0.5">
              {profile.age}
            </span>
            {profile.verified && (
              <BadgeCheck className="text-brasil-blue w-7 h-7 mb-0.5" fill="white" />
            )}
          </div>

          {/* Badges (Distância, Signo, Altura, Profissão, Escolaridade) */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Distância */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 h-8 rounded-lg border border-white/10 shadow-sm">
              <MapPin size={14} className="text-white" />
              <span className="text-xs font-bold text-white">{Math.round(profile.distance || 0)} km</span>
            </div>

            {/* Signo */}
            {profile.zodiacSign && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 h-8 rounded-lg border border-white/10 shadow-sm">
                <Sparkles size={14} className="text-brasil-yellow" />
                <span className="text-xs font-bold text-white">{profile.zodiacSign}</span>
              </div>
            )}

            {/* Altura */}
            {profile.height && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 h-8 rounded-lg border border-white/10 shadow-sm">
                <Ruler size={14} className="text-white" />
                <span className="text-xs font-bold text-white">{profile.height} cm</span>
              </div>
            )}

            {/* Profissão */}
            {profile.profession && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 h-8 rounded-lg border border-white/10 shadow-sm">
                <Briefcase size={14} className="text-white" />
                <span className="text-xs font-bold text-white truncate max-w-[100px]">{profile.profession}</span>
              </div>
            )}

            {/* Escolaridade */}
            {profile.education && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 h-8 rounded-lg border border-white/10 shadow-sm">
                <GraduationCap size={14} className="text-white" />
                <span className="text-xs font-bold text-white truncate max-w-[100px]">{profile.education}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && profile.bio !== 'Teste' && (
            <p className="text-sm font-medium text-white/90 leading-relaxed drop-shadow-md line-clamp-2 max-w-full">
              {profile.bio}
            </p>
          )}

          {/* Photo Indicators - Full Width Bottom */}
          {photos.length > 1 && (
            <div className="flex gap-1.5 mt-3 w-full px-1">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full flex-1 transition-all duration-300 ${index === currentPhotoIndex ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/20'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
