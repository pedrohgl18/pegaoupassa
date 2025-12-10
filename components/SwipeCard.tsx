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
  const sinastriaVerdict = (myZodiacSign && profile.zodiacSign)
    ? getSinastriaVerdict(compatibility)
    : { title: "Mistério Astral", description: "Os astros estão em silêncio...", color: "bg-gray-800" };

  // Vibe Data
  const activeVibe = profile.vibeStatus ? VIBES.find(v => v.id === profile.vibeStatus) : null;

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Math.abs(dragOffset) > 10) return;
    if (!isActive) return;

    // If card is flipped, tapping usually flips back or does nothing specific (maybe scroll)
    // We'll let the user click the "Flip Back" button specifically, or tap anywhere to flip back?
    // Let's keep tap regions on Front only.
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
          className="absolute inset-0 w-full h-full bg-black backface-hidden rounded-[32px] overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} // Ensure backface hidden
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
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Photo Indicators */}
          {photos.length > 1 && (
            <div className="absolute top-2 left-0 right-0 z-30 px-3 flex gap-1">
              {photos.map((_, index) => (
                <div key={index} className={`h-1 rounded-full flex-1 transition-all duration-300 ${index === currentPhotoIndex ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/30'}`} />
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="absolute bottom-0 left-0 right-0 pb-[calc(100px+env(safe-area-inset-bottom))] px-6 flex flex-col gap-2 z-30 pointer-events-none">
            {/* Compatibility Badge */}
            {compatibility > 0 && (
              <div className="self-start glass-strong px-3 py-1 rounded-full flex items-center gap-1.5 mb-1">
                <Heart size={12} className="text-accent" fill="#FFD600" />
                <span className="text-xs font-bold text-white">{compatibility}% Match</span>
              </div>
            )}

            <div className="flex items-end gap-3">
              <h1 className="text-4xl font-black text-white drop-shadow-xl tracking-tight">{profile.name}</h1>
              <span className="text-2xl font-bold text-gray-300 mb-1">{profile.age}</span>
              {profile.verified && <BadgeCheck className="text-primary w-6 h-6 mb-1.5" fill="white" />}
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-gray-200 font-medium">
              {profile.profession && (
                <span className="flex items-center gap-1"><Briefcase size={14} /> {profile.profession}</span>
              )}
              {Math.round(profile.distance || 0) < 100 && (
                <span className="flex items-center gap-1"><MapPin size={14} /> {Math.round(profile.distance || 0)}km</span>
              )}
            </div>

            {/* Flip Button */}
            <div className="absolute right-6 bottom-[calc(100px+env(safe-area-inset-bottom))] pointer-events-auto">
              <button onClick={handleFlip} className="w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95">
                <RotateCw size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= BACK SIDE (DETAILS/SINASTRIA) ================= */}
        <div
          className="absolute inset-0 w-full h-full bg-slate-900 rounded-[32px] overflow-y-auto overflow-x-hidden [transform:rotateY(180deg)] backface-hidden px-6 py-8"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <button
            onClick={handleFlip}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <RotateCw size={20} className="transform rotate-180" />
          </button>

          {/* Photos (Small Gallery) */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            {photos.map((photo, i) => (
              <img key={i} src={photo} className="w-20 h-28 object-cover rounded-lg flex-shrink-0" />
            ))}
          </div>

          {/* Sinastria Verdict Card */}
          {compatibility > 0 && (
            <div className={`p-5 rounded-2xl mb-6 relative overflow-hidden ${sinastriaVerdict.color} shadow-lg`}>
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-white" />
                  <h3 className="font-black text-white text-lg uppercase tracking-wide">Sinastria</h3>
                </div>
                <h4 className="text-xl font-bold text-white mb-1 leading-tight">{sinastriaVerdict.title}</h4>
                <p className="text-white/90 text-sm italic">"{sinastriaVerdict.description}"</p>
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Sobre Mim</h3>
            <p className="text-white text-lg leading-relaxed font-medium">
              {profile.bio || "Sem biografia... Mistério total! 🕵️‍♂️"}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {profile.zodiacSign && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">Signo</span>
                <span className="text-white font-bold flex items-center gap-2"><Sparkles size={14} className="text-yellow-400" /> {profile.zodiacSign}</span>
              </div>
            )}
            {profile.height && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">Altura</span>
                <span className="text-white font-bold flex items-center gap-2"><Ruler size={14} className="text-blue-400" /> {profile.height}cm</span>
              </div>
            )}
            {profile.education && (
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 col-span-2">
                <span className="text-xs text-gray-400 block mb-1">Escolaridade</span>
                <span className="text-white font-bold flex items-center gap-2"><GraduationCap size={14} className="text-purple-400" /> {profile.education}</span>
              </div>
            )}
          </div>

          {/* Interests */}
          {profile.interests && (
            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Interesses</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(i => (
                  <div key={i.id} className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/5">
                    <span>{i.emoji}</span>
                    <span className="text-white text-sm font-medium">{i.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-24" /> {/* Spacer for bottom actions */}
        </div>

      </div>
    </div>
  );
};

// Helper Utility for Sinastria Verdicts (Creative & Funny)
const getSinastriaVerdict = (percentage: number) => {
  if (percentage >= 90) return { title: "Alma Gêmea (Corre!)", description: "Vocês combinam mais que feijoada e caipirinha. Já marca o casamento!", color: "bg-gradient-to-br from-pink-600 to-rose-600" };
  if (percentage >= 80) return { title: "Química Explosiva", description: "Cuidado pra não incendiar a casa. A tensão aqui é real!", color: "bg-gradient-to-br from-orange-500 to-red-600" };
  if (percentage >= 70) return { title: "Vai dar Bom", description: "Tem futuro, hein? Só não esquece de responder o 'Bom dia'.", color: "bg-gradient-to-br from-emerald-500 to-green-600" };
  if (percentage >= 50) return { title: "Pagou pra Ver", description: "Pode ser incrível ou um desastre. Só tem um jeito de descobrir...", color: "bg-gradient-to-br from-blue-500 to-indigo-600" };
  return { title: "Desafio Aceito?", description: "Os astros dizem 'não', mas quem liga? Prove que eles estão errados!", color: "bg-gradient-to-br from-gray-600 to-gray-800" };
};

export default SwipeCard;
