import React, { useEffect } from 'react';
import { Heart, MessageSquare, X } from 'lucide-react';
import Button from './Button';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChat: () => void;
  myPhotoUrl: string;
  theirPhotoUrl: string;
  theirName: string;
}

const MatchModal: React.FC<MatchModalProps> = ({ 
  isOpen, 
  onClose, 
  onChat, 
  myPhotoUrl, 
  theirPhotoUrl, 
  theirName 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md p-8 flex flex-col items-center text-center relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={32} />
        </button>

        {/* Title */}
        <div className="mb-12 relative">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brasil-yellow via-green-400 to-brasil-blue italic transform -rotate-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            DEU MATCH!
          </h1>
          <div className="absolute -right-8 -top-8 text-brasil-yellow animate-bounce">
            <Heart size={48} fill="#FFDF00" />
          </div>
        </div>

        {/* Confetti / Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.6
                }}
              >
                 {i % 3 === 0 ? (
                   <Heart size={Math.random() * 20 + 10} className="text-brasil-yellow" fill="#FFDF00" />
                 ) : i % 3 === 1 ? (
                   <div className="w-3 h-3 bg-brasil-green rounded-full" />
                 ) : (
                   <div className="w-3 h-3 bg-brasil-blue rotate-45" />
                 )}
              </div>
           ))}
        </div>

        {/* Photos */}
        <div className="flex items-center justify-center gap-4 mb-12 relative">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-[0_0_30px_rgba(0,156,59,0.6)] transform -rotate-12 translate-x-4 z-10">
            <img src={myPhotoUrl} alt="Eu" className="w-full h-full object-cover" />
          </div>
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-[0_0_30px_rgba(0,39,118,0.6)] transform rotate-12 -translate-x-4 z-20">
            <img src={theirPhotoUrl} alt={theirName} className="w-full h-full object-cover" />
          </div>
          
          {/* Heart Icon in middle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white rounded-full p-2 shadow-lg">
            <Heart size={24} className="text-red-500" fill="currentColor" />
          </div>
        </div>

        <p className="text-white text-lg font-medium mb-8">
          Você e <span className="text-brasil-yellow font-bold">{theirName}</span> se curtiram!
        </p>

        {/* Actions */}
        <div className="w-full space-y-4">
          <Button fullWidth onClick={onChat} className="h-14 text-lg">
            <MessageSquare className="mr-2" /> Mandar mensagem
          </Button>
          
          <button 
            onClick={onClose}
            className="w-full py-4 text-white/70 font-bold hover:text-white transition-colors"
          >
            Continuar jogando
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
