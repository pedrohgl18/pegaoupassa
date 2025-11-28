import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, MapPin, Calendar, User, Heart, MessageSquare, Loader2, Camera, Plus, X } from 'lucide-react';
import Button from './Button';
import { photos as photosApi, profiles } from '../lib/supabase';
import type { Profile } from '../types/database';

interface OnboardingProps {
  userId: string;
  profile: Profile | null;  // Perfil existente (pode ter progresso salvo)
}

const Onboarding: React.FC<OnboardingProps> = ({ userId, profile }) => {
  // Iniciar no step salvo + 1 (próximo a completar), ou 1 se novo
  const [step, setStep] = useState(() => {
    const savedStep = profile?.onboarding_step || 0;
    return Math.min(savedStep + 1, 4); // Próximo step a completar (max 4)
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Carregar dados do perfil existente (para retomar onboarding)
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(profile?.gender || null);
  const [interestedIn, setInterestedIn] = useState<'male' | 'female' | 'both' | null>(profile?.looking_for || null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar fotos existentes do usuário ao montar
  useEffect(() => {
    const loadPhotos = async () => {
      const { data } = await photosApi.getByUserId(userId);
      if (data && data.length > 0) {
        setPhotoUrls(data.map((p: any) => p.url));
      }
    };
    loadPhotos();
  }, [userId]);

  // Salvar step 1: Nome e Bio
  const handleStep1Complete = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await profiles.updateOnboarding(userId, {
      name: name.trim(),
      bio: bio.trim(),
    }, 1);
    setSaving(false);
    if (error) { alert('Erro ao salvar. Tente novamente.'); return; }
    setStep(2);
  };

  // Salvar step 2: Fotos (as fotos já são salvas no upload, só marca o step)
  const handleStep2Complete = async () => {
    if (photoUrls.length === 0) return;
    setSaving(true);
    const { error } = await profiles.updateOnboarding(userId, {}, 2);
    setSaving(false);
    if (error) { alert('Erro ao salvar. Tente novamente.'); return; }
    setStep(3);
  };

  // Salvar step 3: Dados pessoais
  const handleStep3Complete = async () => {
    if (!birthDate || !gender || !interestedIn) return;
    setSaving(true);
    const { error } = await profiles.updateOnboarding(userId, {
      birth_date: birthDate,
      gender,
      looking_for: interestedIn,
    }, 3);
    setSaving(false);
    if (error) { alert('Erro ao salvar. Tente novamente.'); return; }
    setStep(4);
  };

  // Finalizar step 4: Localização e completar onboarding
  const handleFinish = async () => {
    setSaving(true);
    
    // Tentar obter localização
    let locationData: Record<string, number> = {};
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch {
        console.log('Localização não disponível');
      }
    }
    
    const { error } = await profiles.updateOnboarding(userId, {
      ...locationData,
      onboarding_completed: true,
      is_active: true,
    }, 4);
    setSaving(false);
    
    if (error) { alert('Erro ao finalizar. Tente novamente.'); return; }
    // Recarrega a página para atualizar o estado do perfil
    window.location.reload();
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Selecione uma imagem.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB.'); return; }

    setUploadingPhoto(true);
    try {
      const { url, error } = await photosApi.upload(userId, file, photoUrls.length);
      if (error) { alert('Erro no upload.'); return; }
      if (url) setPhotoUrls(prev => [...prev, url]);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => setPhotoUrls(prev => prev.filter((_, i) => i !== index));

  const renderStep1 = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="w-16 h-16 bg-brasil-yellow rounded-2xl flex items-center justify-center shadow-lg rotate-3">
          <MessageSquare size={32} className="text-brasil-blue" />
        </div>
        <h2 className="text-3xl font-extrabold text-brasil-green">Fala tu!</h2>
        <p className="text-zinc-500">Como você quer ser chamado(a)?</p>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome"
          className="w-full p-4 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-zinc-50 text-zinc-900 font-bold text-lg" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Uma bio legal pro seu perfil..."
          className="w-full h-24 p-4 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-zinc-50 text-zinc-900 resize-none" />
      </div>
      <Button fullWidth onClick={handleStep1Complete} disabled={!name.trim() || saving}>
        {saving ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
        Próximo <ChevronRight size={20} />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col gap-6">
        <div className="w-16 h-16 bg-brasil-green rounded-2xl flex items-center justify-center shadow-lg">
          <Camera size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-brasil-blue">Mostra a cara!</h2>
        <p className="text-zinc-500">Adicione pelo menos 1 foto (máximo 6)</p>
        <div className="grid grid-cols-3 gap-3">
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className={`relative aspect-[3/4] rounded-xl overflow-hidden ${i===0?'col-span-2 row-span-2':''}`}>
              {photoUrls[i] ? (
                <>
                  <img src={photoUrls[i]} className="w-full h-full object-cover" alt={`Foto ${i+1}`} />
                  <button onClick={() => handleRemovePhoto(i)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <X size={16} className="text-white" />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-2 left-2 bg-brasil-yellow text-brasil-blue text-xs font-bold px-2 py-1 rounded-full">
                      Principal
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto || i !== photoUrls.length}
                  className={`w-full h-full border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${i===photoUrls.length?'border-brasil-blue bg-brasil-blue/5 hover:bg-brasil-blue/10':'border-zinc-200 bg-zinc-50'}`}>
                  {uploadingPhoto && i===photoUrls.length ? <Loader2 size={24} className="animate-spin text-brasil-blue" /> : <Plus size={20} className={i===photoUrls.length?'text-brasil-blue':'text-zinc-400'} />}
                </button>
              )}
            </div>
          ))}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
        <p className="text-sm text-zinc-500 text-center">{photoUrls.length}/6 fotos</p>
      </div>
      <Button fullWidth onClick={handleStep2Complete} disabled={photoUrls.length===0 || uploadingPhoto || saving}>
        {saving ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
        Próximo <ChevronRight size={20} />
      </Button>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col gap-6 pt-4">
        <h2 className="text-3xl font-extrabold text-brasil-blue">Sobre você</h2>
        <p className="text-zinc-500">Conta mais pra gente te conhecer melhor</p>
        <div className="space-y-2">
          <label className="text-sm font-bold text-brasil-green flex items-center gap-2"><Calendar size={16} />Data de Nascimento</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full p-4 rounded-xl border-2 border-zinc-200 bg-white font-bold text-zinc-900" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-brasil-green flex items-center gap-2"><User size={16} />Você se identifica como</label>
          <div className="grid grid-cols-3 gap-2">
            {[{id:'male',label:'Ele'},{id:'female',label:'Ela'},{id:'other',label:'Outro'}].map(o => (
              <button key={o.id} onClick={() => setGender(o.id as any)} className={`p-3 rounded-lg border-2 font-bold transition-all ${gender===o.id?'border-brasil-blue bg-brasil-blue text-white':'border-zinc-200 text-zinc-400 hover:border-brasil-blue/50'}`}>{o.label}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-brasil-green flex items-center gap-2"><Heart size={16} />Interessado em</label>
          <div className="grid grid-cols-3 gap-2">
            {[{id:'male',label:'Eles'},{id:'female',label:'Elas'},{id:'both',label:'Ambos'}].map(o => (
              <button key={o.id} onClick={() => setInterestedIn(o.id as any)} className={`p-3 rounded-lg border-2 font-bold transition-all ${interestedIn===o.id?'border-brasil-blue bg-brasil-blue text-white':'border-zinc-200 text-zinc-400 hover:border-brasil-blue/50'}`}>{o.label}</button>
            ))}
          </div>
        </div>
      </div>
      <Button fullWidth onClick={handleStep3Complete} disabled={!birthDate || !gender || !interestedIn || saving}>
        {saving ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
        Quase lá <ChevronRight size={20} />
      </Button>
    </div>
  );

  const renderStep4 = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-brasil-green/20 rounded-full blur-xl animate-pulse" />
          <div className="w-32 h-32 bg-gradient-to-br from-brasil-green to-teal-500 rounded-full flex items-center justify-center shadow-2xl relative">
            <MapPin size={64} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-brasil-blue">Onde você está?</h2>
        <p className="text-zinc-600 max-w-xs">Para encontrar pessoas perto de você, precisamos da sua localização.</p>
      </div>
      <Button fullWidth onClick={handleFinish} disabled={saving}>
        {saving ? <><Loader2 size={20} className="animate-spin mr-2" />Finalizando...</> : 'Começar a usar!'}
      </Button>
      <p className="text-center text-xs text-zinc-400 mt-4">Você pode pular a localização e configurar depois</p>
    </div>
  );

  return (
    <div className="h-full w-full bg-brasil-light flex flex-col">
      <div className="w-full h-1 bg-zinc-200"><div className="h-full bg-brasil-green transition-all duration-300" style={{width:`${(step/4)*100}%`}} /></div>
      {step===1 && renderStep1()}
      {step===2 && renderStep2()}
      {step===3 && renderStep3()}
      {step===4 && renderStep4()}
    </div>
  );
};

export default Onboarding;
