import React, { useState } from 'react';
import { Profile } from '../types';
import { BadgeCheck, MapPin, Sparkles, Briefcase, GraduationCap, Ruler, ThumbsUp, X, Heart, RotateCw, Info } from 'lucide-react';
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
  hasActions = true
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
  const activeVibe = profile.vibeStatus ? VIBES.find(v => v.id === profile.vibeStatus) : null;

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Math.abs(dragOffset) > 10) return;
    if (!isActive) return;

    if (isFlipped) return;

    const { clientX, currentTarget } = e;
    const { left, width } = currentTarget.getBoundingClientRect();
    const x = clientX - left;

    if (x < width / 2) {
      setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
    }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

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

  return (
    <div className={`absolute inset-0 w-full h-full ${isActive ? 'z-10' : 'z-0 scale-95 opacity-50'}`} style={cardStyle}>
      <div
        className={clsx(
          "relative w-full h-full transition-all duration-500",
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >

        {/* ================= FRONT SIDE ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-black backface-hidden rounded-[32px] overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          onClick={handleTap}
        >
          {/* Photo */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-300"
            style={{ backgroundImage: `url(${photos[currentPhotoIndex]})` }}
          />

          {/* Overlays (Like/Pass) */}
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200" style={{ opacity: likeOpacity }}>
            <div className="glass p-8 rounded-full border-4 border-white shadow-2xl transform rotate-12">
              <Heart size={80} className="text-white" fill="white" />
            </div>
          </div>
          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-200" style={{ opacity: passOpacity }}>
            <div className="glass p-8 rounded-full border-4 border-white shadow-2xl transform -rotate-12">
              <X size={80} className="text-white" />
            </div>
          </div>

          {/* Gradients */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Flip Button - RESPONSIVE SAFE AREA FIX */}
          <button
            onClick={handleFlip}
            className="absolute z-50 pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/60 transition-all active:scale-95 shadow-lg"
            style={{
              top: 'max(1rem, env(safe-area-inset-top, 16px))',
              right: 'max(1rem, env(safe-area-inset-right, 16px))'
            }}
          >
            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Photo Indicators */}
          {photos.length > 1 && (
            <div className="absolute top-2 left-0 right-0 z-30 px-3 flex gap-1" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
              {photos.map((_, index) => (
                <div key={index} className={`h-1 rounded-full flex-1 transition-all duration-300 ${index === currentPhotoIndex ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/30'}`} />
              ))}
            </div>
          )}

          {/* Info Section - CLEAN: Name, Age, Distance, Match %, Vibe */}
          <div className="absolute bottom-0 left-0 right-0 pb-[calc(100px+env(safe-area-inset-bottom))] px-4 sm:px-6 flex flex-col gap-1 z-30 pointer-events-none mb-4">


            {/* Vibe Badge (Modo Agora) */}
            {activeVibe && (
              <div className={`self-start px-3 py-1.5 rounded-full flex items-center gap-2 mb-2 shadow-lg backdrop-blur-md border border-white/20 animate-in fade-in slide-in-from-bottom-2 ${activeVibe.color.replace('text-', 'bg-').replace('500', '500/80')}`}>
                <span className="text-lg">{activeVibe.emoji}</span>
                <span className="text-xs font-bold text-white tracking-wide uppercase">{activeVibe.label}</span>
              </div>
            )}

            {/* Compatibility Badge */}
            {compatibility > 0 && (
              <div className="self-start bg-zinc-900/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 mb-2 border border-white/10">
                <Sparkles size={12} className="text-yellow-400" fill="#FACC15" />
                <span className="text-xs font-bold text-white">{compatibility}% Match</span>
              </div>
            )}

            <div className="flex items-end gap-3 translate-y-1">
              <h1 className="text-4xl font-black text-white drop-shadow-xl tracking-tight leading-none">{profile.name}</h1>
              <span className="text-2xl font-bold text-white/90 mb-0.5 shadow-black/50 drop-shadow-md">{profile.age}</span>
              {profile.verified && <BadgeCheck className="text-blue-400 w-6 h-6 mb-1" fill="white" />}
            </div>

            {/* Distance - ADDED BACK */}
            <div className="flex items-center gap-1.5 text-white/80 font-medium text-sm mt-1 ml-1">
              <MapPin size={14} className="text-white/60" />
              <span>{Math.round(profile.distance || 0)} km de distância</span>
            </div>
          </div>
        </div>

        {/* ================= BACK SIDE (DETAILS - LIGHT MODE) ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-white rounded-[32px] overflow-y-auto overflow-x-hidden [transform:rotateY(180deg)] backface-hidden px-6 py-8"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <button
            onClick={handleFlip}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 border border-zinc-200 hover:bg-zinc-200 transition-all active:scale-95"
          >
            <RotateCw size={20} className="transform rotate-180" />
          </button>

          {/* Photos (Small Gallery) */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide pt-8">
            {photos.map((photo, i) => (
              <img key={i} src={photo} className="w-20 h-28 object-cover rounded-xl flex-shrink-0 border border-zinc-100 shadow-sm" />
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-black text-zinc-900 leading-tight mb-1">{profile.name}, {profile.age}</h2>
            <span className="text-zinc-500 font-medium text-sm block">{profile.profession || 'Não informado'}</span>
          </div>

          {/* Sinastria Verdict Card - FIXED & LIGHT THEME */}
          {compatibility > 0 && (
            <div className={`p-5 rounded-2xl mb-6 relative overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 shadow-sm`}>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-violet-600" />
                  <h3 className="font-black text-violet-900 text-xs uppercase tracking-wide">Sinastria Astral</h3>
                </div>
                <h4 className="text-lg font-bold text-zinc-800 mb-1 leading-tight">{sinastriaVerdict.title}</h4>
                <p className="text-zinc-600 text-sm italic">"{sinastriaVerdict.description}"</p>
              </div>
            </div>
          )}

          {/* Details Grid - ALL INFO */}
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Detalhes</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <span className="text-xs text-zinc-400 block mb-1">Signo</span>
              <span className="text-zinc-900 font-bold flex items-center gap-2">
                <Sparkles size={14} className="text-violet-500" /> {profile.zodiacSign || "----"}
              </span>
            </div>

            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <span className="text-xs text-zinc-400 block mb-1">Altura</span>
              <span className="text-zinc-900 font-bold flex items-center gap-2">
                <Ruler size={14} className="text-blue-500" /> {profile.height ? `${profile.height}m` : '----'}
              </span>
            </div>

            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 col-span-2">
              <span className="text-xs text-zinc-400 block mb-1">Escolaridade</span>
              <span className="text-zinc-900 font-bold flex items-center gap-2">
                <GraduationCap size={14} className="text-emerald-500" /> {profile.education || "----"}
              </span>
            </div>
          </div>

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

          <div className="h-32" /> {/* Spacer for bottom actions */}
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
