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

      {/* Gradient Overlay - mais sutil, apenas na parte inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Photo Indicators - Ajustado para não colidir com status bar */}
      {photos.length > 1 && (
        <div className="absolute top-20 left-4 right-4 flex gap-1.5 z-30">
          {photos.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${index === currentPhotoIndex ? 'bg-white shadow-sm' : 'bg-white/40'
                }`}
            />
          ))}
        </div>
      )}

      {/* Action Overlay - Like */}
      <div
        className="absolute inset-0 bg-brasil-green/30 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200"
        style={{ opacity: likeOpacity }}
      >
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-full border-4 border-white">
          <ThumbsUp size={72} className="text-white" fill="white" />
        </div>
      </div>

      {/* Action Overlay - Pass */}
      <div
        className="absolute inset-0 bg-red-500/30 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200"
        style={{ opacity: passOpacity }}
      >
        <div className="bg-white/20 backdrop-blur-md p-6 rounded-full border-4 border-white">
          <X size={72} className="text-white" />
        </div>
      </div>

      {/* Content - Ancorado na parte inferior, com mais espaço do BottomNav */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 20px))' }}>
        <div className="px-5 pb-6 flex flex-col gap-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-24">

          {/* Compatibilidade por Signo */}
          {myZodiacSign && profile.zodiacSign && compatibility > 0 && (
            <div className={`self-start flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg mb-1 ${compatibility >= 75 ? 'bg-brasil-green/90' :
                compatibility >= 50 ? 'bg-brasil-yellow/90' : 'bg-orange-500/90'
              }`}>
              <Heart className="w-3 h-3 text-white" fill="white" />
              <span className="text-white text-[10px] font-black uppercase tracking-wide">{compatibility}% Match</span>
            </div>
          )}

          {/* Nome e Idade */}
          <div className="flex items-end gap-2">
            <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-xl leading-none">
              {profile.name}
            </h2>
            <span className="text-xl font-medium text-white/90 mb-0.5 drop-shadow-md">{profile.age}</span>
            {profile.verified && (
              <BadgeCheck className="w-6 h-6 text-brasil-blue fill-white mb-0.5 drop-shadow-lg" />
            )}
          </div>

          {/* Badges de informação - estilo unificado e premium */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Distância */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-white/80" />
              <span className="text-white text-xs font-bold">{profile.distance} km</span>
            </div>

            {/* Signo */}
            {profile.zodiacSign && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-brasil-yellow" />
                <span className="text-white text-xs font-bold">{profile.zodiacSign}</span>
              </div>
            )}

            {/* Altura */}
            {profile.height && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Ruler className="w-3.5 h-3.5 text-white/80" />
                <span className="text-white text-xs font-bold">{profile.height} cm</span>
              </div>
            )}

            {/* Profissão */}
            {profile.profession && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Briefcase className="w-3.5 h-3.5 text-white/80" />
                <span className="text-white text-xs font-bold">{profile.profession}</span>
              </div>
            )}

            {/* Educação */}
            {profile.education && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <GraduationCap className="w-3.5 h-3.5 text-white/80" />
                <span className="text-white text-xs font-bold">{profile.education}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-white/80 text-sm leading-relaxed font-medium drop-shadow-md line-clamp-3 max-w-[90%]">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
