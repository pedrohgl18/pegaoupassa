import React, { useState } from 'react';
import { Profile } from '../types';
import { BadgeCheck, MapPin, Sparkles, GraduationCap, Ruler, X, Heart, Briefcase, Info } from 'lucide-react';
import { zodiac } from '../lib/supabase';
import { VIBES } from './VibeSelector';
import clsx from 'clsx';

interface SwipeCardProps {
  profile: Profile;
  isActive: boolean;
  swipeDirection?: 'up' | 'down' | null;
  dragOffset?: number;
  style?: React.CSSProperties;
  myZodiacSign?: string;
  activeFilters?: {
    minHeight?: number;
    zodiac?: string;
  };
  myInterests?: string[];
  hasActions?: boolean;
  onFlip?: (isFlipped: boolean) => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  isActive,
  swipeDirection,
  dragOffset = 0,
  style,
  myZodiacSign,
  activeFilters,
  myInterests,
  hasActions = true,
  onFlip
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : [profile.imageUrl];

  // Compatibilidade & Sinastria
  let compatibility = zodiac.getCompatibility(myZodiacSign, profile.zodiacSign);
  // Bônus por interesses
  if (myInterests && profile.interests) {
    const sharedCount = profile.interests.filter(i => myInterests.includes(i.id)).length;
    compatibility = Math.min(100, compatibility + (sharedCount * 15));
  }

  // Get Sinastria Verdict (Funny) if signs exist
  // FIXED: Passed compatibility number to the function
  const sinastriaVerdict = (myZodiacSign && profile.zodiacSign)
    ? getSinastriaVerdict(compatibility)
    : { title: "Mistério Astral", description: "Os astros estão em silêncio...", color: "bg-zinc-100 border-zinc-200" };

  // Vibe Data
  const isVibeExpired = profile.vibeExpiresAt ? new Date() > new Date(profile.vibeExpiresAt) : false;
  const activeVibe = (profile.vibeStatus && !isVibeExpired) ? VIBES.find(v => v.id === profile.vibeStatus) : null;

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Math.abs(dragOffset) > 10) return;
    if (!isActive) return;

    const { clientX, clientY, currentTarget } = e;
    const { left, width, top, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    // If card is flipped, tap anywhere to flip back
    if (isFlipped) {
      setIsFlipped(false);
      if (onFlip) onFlip(false);
      return;
    }

    // Right-center area tap = flip card (right 25% of width, middle 50% of height)
    const isRightArea = x > width * 0.75;
    const isCenterVertical = y > height * 0.25 && y < height * 0.75;

    if (isRightArea && isCenterVertical) {
      setIsFlipped(true);
      if (onFlip) onFlip(true);
      return;
    }

    // Normal photo navigation
    if (x < width / 2) {
      setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
    }
  };

  // handleFlip not needed anymore - using handleTap

  // Styles logic
  const likeOpacity = swipeDirection === 'down' ? 1 : Math.max(0, Math.min(dragOffset / 150, 1));
  const passOpacity = swipeDirection === 'up' ? 1 : Math.max(0, Math.min(-dragOffset / 150, 1));

  const rotateX = isActive && dragOffset !== 0 ? -dragOffset * 0.08 : 0;
  const rotateZ = isActive && dragOffset !== 0 ? dragOffset * 0.03 : 0;
  const scale = isActive ? 1 - Math.abs(dragOffset) * 0.0003 : 0.95;
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
    transformStyle: 'preserve-3d',
    transition: dragOffset === 0 ? 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
    boxShadow: isActive && dragOffset !== 0
      ? `0 ${Math.abs(dragOffset) * 0.5}px ${Math.abs(dragOffset)}px rgba(0,0,0,0.3)`
      : '0 10px 30px rgba(0,0,0,0.2)',
  };

  // Image Optimization Helper
  const getOptimizedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('supabase.co/storage/v1/object/public')) {
      return `${url}?width=500&resize=cover&quality=80&format=webp`;
    }
    return url;
  };

  const optimizedPhotos = photos.map(p => getOptimizedUrl(p));

  // Determine border color based on Vibe
  const borderColor = activeVibe
    ? activeVibe.color.replace('from-', 'border-').split(' ')[0].replace('500', '500')
    : 'border-white/10';

  return (
    <div className={`absolute inset-0 w-full h-full ${isActive ? 'z-10' : 'z-0 scale-95 opacity-50'}`} style={cardStyle}>
      <div
        className={clsx(
          "relative w-full h-full transition-all duration-500",
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >

        {/* ================= FRONT SIDE (SPLIT LAYOUT) ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-white rounded-[32px] overflow-hidden shadow-2xl backface-hidden flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          onClick={handleTap}
          role="button"
          aria-label={`Ver perfil de ${profile.name}`}
        >
          {/* --- TOP SECTION: PHOTO (75%) --- */}
          <div className="relative flex-grow h-[75%] w-full overflow-hidden bg-zinc-100">
            {/* Photo */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{ backgroundImage: `url(${optimizedPhotos[currentPhotoIndex]})` }}
              role="img"
              aria-label={`Foto ${currentPhotoIndex + 1} de ${profile.name}`}
            />

            {/* Vibe Gradient Overlay (Subtle) */}
            {activeVibe && (
              <div className={`absolute inset-0 bg-gradient-to-t ${activeVibe.color.replace('from-', 'from-').replace('to-', 'to-transparent')} opacity-20 pointer-events-none`} />
            )}

            {/* Standard Gradient for text readability if we needed it (but text is now below) 
                Keeping a small bottom gradient for photo indicators transition */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            {/* Overlays (Like/Pass) */}
            <div className="absolute inset-0 bg-violet-500/30 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200" style={{ opacity: likeOpacity }}>
              <div className="glass-strong p-6 rounded-full border-4 border-white shadow-2xl transform rotate-12">
                <Heart size={64} className="text-white" fill="white" />
              </div>
            </div>
            <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200" style={{ opacity: passOpacity }}>
              <div className="glass-strong p-6 rounded-full border-4 border-white shadow-2xl transform -rotate-12">
                <X size={64} className="text-white" />
              </div>
            </div>

            {/* Photo Indicators */}
            {photos.length > 1 && (
              <div className="absolute top-3 left-0 right-0 z-30 px-3 flex gap-1.5" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {photos.map((_, index) => (
                  <div key={index} className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${index === currentPhotoIndex ? 'bg-white shadow-md' : 'bg-white/40'}`} />
                ))}
              </div>
            )}

            {/* Vibe Badge (Floating Top Left) */}
            {activeVibe && (
              <div className="absolute top-6 left-4 z-30 mt-safe">
                <div className={`
                  px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/20 
                  bg-gradient-to-r ${activeVibe.color}
                `}>
                  <span className="text-sm shadow-black drop-shadow-sm">{activeVibe.emoji}</span>
                  <span className="text-[10px] font-bold text-white tracking-wide uppercase shadow-black drop-shadow-sm">{activeVibe.label}</span>
                </div>
              </div>
            )}

            {/* Compatibility Badge (Moved to Bottom Right to avoid overlap with Likes Counter) */}
            {compatibility > 0 && (
              <div className="absolute bottom-4 right-4 z-30">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-lg">
                  <Sparkles size={12} className="text-violet-300" fill="#C4B5FD" />
                  <span className="text-xs font-bold text-white shadow-black drop-shadow-sm">{compatibility}%</span>
                </div>
              </div>
            )}
          </div>

          {/* --- BOTTOM SECTION: INFO (25% / Auto) --- */}
          <div className="relative h-auto min-h-[25%] bg-white px-5 pt-4 pb-safe flex flex-col justify-start z-30">
            {/* Info Button (Absolute Floating or Inline?) -> Inline feels cleaner for this layout */}

            <div className="flex justify-between items-start mb-1">
              <div className="flex flex-col">
                {/* Name & Age */}
                <div className="flex items-baseline gap-2">
                  <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{profile.name}</h1>
                  <span className="text-xl font-medium text-zinc-400">{profile.age}</span>
                  {profile.verified && <BadgeCheck className="text-violet-500 w-5 h-5 self-center ml-0.5" fill="white" />}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-zinc-500 font-medium text-xs mt-0.5">
                  <MapPin size={12} className="text-zinc-400" />
                  <span>
                    {profile.distance !== undefined && profile.distance < 1
                      ? `${Math.round(profile.distance * 1000)}m de distância`
                      : `${Math.round(profile.distance || 0)} km de distância`
                    }
                  </span>
                </div>
              </div>

              {/* Info/Flip Button - Subtle, circular */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(true);
                  if (onFlip) onFlip(true);
                }}
                className="p-2.5 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-violet-600 transition-colors border border-zinc-100 shadow-sm"
              >
                <Info size={20} className="rotate-0" /> {/* Using generic info icon or similar */}
              </button>
            </div>

            {/* Tags (Scrollable horizontal if many) */}
            <div className="flex flex-wrap gap-2 mt-3 w-full items-center justify-start overflow-hidden h-[36px]">
              {/* Profile Tags */}
              {profile.tags && profile.tags.map(tag => (
                <div key={tag} className="px-2.5 py-1 bg-zinc-50 rounded-lg flex items-center border border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide">{tag}</span>
                </div>
              ))}

            </div>

          </div>
        </div>

        {/* ================= BACK SIDE (DETAILS) ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-white rounded-[32px] overflow-y-auto overflow-x-hidden [transform:rotateY(180deg)] backface-hidden px-6 py-8"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(false);
            if (onFlip) onFlip(false);
          }}
          role="button"
          aria-label="Voltar para a foto"
        >
          {/* Header - CENTERED - NAME FIRST */}
          <div className="text-center mb-6 mt-2">
            <h2 className="text-4xl font-black text-zinc-900 leading-none tracking-tight">{profile.name}, {profile.age}</h2>
            {profile.distance && (
              <span className="text-sm font-semibold text-zinc-400 mt-1 flex items-center justify-center gap-1">
                <MapPin size={12} />
                {profile.distance !== undefined && profile.distance < 1
                  ? `${Math.round(profile.distance * 1000)}m daqui`
                  : `${Math.round(profile.distance)} km daqui`
                }
              </span>
            )}
          </div>

          {/* Photos (Small Gallery) */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide justify-center px-4">
            {optimizedPhotos.map((photo, i) => (
              <div key={i} className="relative group flex-shrink-0">
                <img src={photo} className="w-16 h-20 object-cover rounded-2xl border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>

          {/* Sinastria Verdict Card */}
          {compatibility > 0 && (
            <div className={`p-5 rounded-2xl mb-6 relative overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100/50 shadow-sm`}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-violet-600" />
                  <h3 className="font-black text-violet-900 text-[10px] uppercase tracking-widest">Combinação Astral</h3>
                </div>
                <h4 className="text-lg font-bold text-zinc-800 mb-1 leading-tight">{sinastriaVerdict.title}</h4>
                <p className="text-zinc-600 text-sm font-medium leading-relaxed">"{sinastriaVerdict.description}"</p>
              </div>
            </div>
          )}

          {/* Details Grid - IMPROVED VISUALS */}
          <h3 className="text-zinc-900 text-sm font-bold mb-4 flex items-center gap-2">
            Sobre {profile.name.split(' ')[0]}
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* Row 1: Shared Space (Compact Info) */}
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex flex-col gap-1 items-start hover:bg-zinc-100 transition-colors">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Signo</span>
              <span className="text-zinc-800 font-bold text-sm flex items-center gap-2">
                <Sparkles size={14} className="text-violet-500 flex-shrink-0" />
                {profile.zodiacSign || "----"}
              </span>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex flex-col gap-1 items-start hover:bg-zinc-100 transition-colors">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Altura</span>
              <span className="text-zinc-800 font-bold text-sm flex items-center gap-2">
                <Ruler size={14} className="text-blue-500 flex-shrink-0" />
                {profile.height ? `${profile.height}m` : '----'}
              </span>
            </div>

            {/* Row 2: Full Width (Long Text) */}
            <div className="col-span-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex flex-col gap-1 items-start hover:bg-zinc-100 transition-colors">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Profissão</span>
              <span className="text-zinc-800 font-bold text-sm flex items-center gap-2 leading-tight w-full">
                <Briefcase size={14} className="text-amber-500 flex-shrink-0" />
                <span className="truncate w-full">{profile.profession || "----"}</span>
              </span>
            </div>

            {/* Row 3: Full Width (Long Text) */}
            <div className="col-span-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex flex-col gap-1 items-start hover:bg-zinc-100 transition-colors">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Escolaridade</span>
              <span className="text-zinc-800 font-bold text-sm flex items-center gap-2 leading-tight w-full">
                <GraduationCap size={14} className="text-emerald-500 flex-shrink-0" />
                <span className="truncate w-full">{profile.education || "----"}</span>
              </span>
            </div>
          </div>

          {/* Tags / Identity - REMOVED AS PER REQUEST */}
          {/* 
          {profile.tags && profile.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Identidade</h3>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl border border-rose-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )} 
*/}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Interesses</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(i => (
                  <div key={i.id} className="bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-zinc-200 shadow-sm">
                    <span>{i.emoji}</span>
                    <span className="text-zinc-700 text-sm font-bold">{i.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-24" /> {/* Spacer */}

          {/* Tap hint */}
          <p className="text-center text-xs text-zinc-400 mt-4">Toque para voltar</p>
        </div>

      </div>
    </div>
  );
};

// Helper Utility for Sinastria Verdicts
const getSinastriaVerdict = (percentage: number) => {
  if (percentage >= 90) return { title: "Alma Gêmea (Corre!)", description: "Vocês combinam mais que feijoada e caipirinha. Já marca o casamento!", color: "violet" };
  if (percentage >= 80) return { title: "Química Explosiva", description: "Cuidado pra não incendiar a casa. A tensão aqui é real!", color: "rose" };
  if (percentage >= 70) return { title: "Vai dar Bom", description: "Tem futuro, hein? Só não esquece de responder o 'Bom dia'.", color: "emerald" };
  if (percentage >= 50) return { title: "Pagou pra Ver", description: "Pode ser incrível ou um desastre. Só tem um jeito de descobrir...", color: "blue" };
  return { title: "Desafio Aceito?", description: "Os astros dizem 'não', mas quem liga? Prove que eles estão errados!", color: "gray" };
};

export default SwipeCard;
