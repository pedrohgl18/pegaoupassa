import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, MapPin, Calendar, User, Heart, MessageSquare, Loader2, Camera, Plus, X, Tag, Briefcase, GraduationCap, Ruler } from 'lucide-react';
import Button from './Button';
import { photos as photosApi, profiles, interests, zodiac } from '../lib/supabase';
import type { Profile } from '../types/database';
import InterestSelector from './InterestSelector';

interface OnboardingProps {
  userId: string;
  profile: Profile | null;  // Perfil existente (pode ter progresso salvo)
  onComplete: (photos?: string[]) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ userId, profile, onComplete }) => {
  // Iniciar no step salvo + 1 (próximo a completar), ou 1 se novo
  const [step, setStep] = useState(() => {
    const savedStep = profile?.onboarding_step || 0;
    return Math.min(savedStep + 1, 5); // Próximo step a completar (max 5)
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
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profession, setProfession] = useState(profile?.profession || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');

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
    if (!name.trim() || !bio.trim()) return;
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
    if (!birthDate || !gender || !interestedIn || !profession.trim() || !height || !education) return;
    setSaving(true);
    const { error } = await profiles.updateOnboarding(userId, {
      birth_date: birthDate,
      gender,
      profession: profession.trim(),
      education: education.trim(),
      height: height ? parseInt(height) : null,
      zodiac_sign: birthDate ? zodiac.getSign(birthDate) : null,
    }, 3);
    setSaving(false);
    if (error) { alert('Erro ao salvar. Tente novamente.'); return; }
    setStep(4);
  };

  // Salvar step 4: Interesses
  const handleStep4Complete = async () => {
    if (selectedInterests.length === 0) return;
    setSaving(true);

    // Salvar interesses
    const { error: interestsError } = await interests.saveUserInterests(userId, selectedInterests);

    if (interestsError) {
      setSaving(false);
      alert('Erro ao salvar interesses. Tente novamente.');
      return;
    }

    // Atualizar step
    const { error } = await profiles.updateOnboarding(userId, {}, 4);
    setSaving(false);
    if (error) { alert('Erro ao salvar. Tente novamente.'); return; }
    setStep(5);
  };

  // Finalizar step 5: Localização e completar onboarding
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
    }, 5);
    setSaving(false);

    if (error) { alert('Erro ao finalizar. Tente novamente.'); return; }
    if (error) { alert('Erro ao finalizar. Tente novamente.'); return; }

    // Pass photos to parent for optimistic update
    onComplete(photoUrls);
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
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
          <MessageSquare size={32} className="text-violet-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-violet-600">Fala tu! 🗣️</h2>

        {/* Name Field First */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-zinc-700">Seu Nome</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como você quer ser chamado?" maxLength={50}
            className="w-full p-4 rounded-xl border-2 border-zinc-200 focus:border-violet-600 bg-zinc-50 text-zinc-900 font-bold text-lg" />
        </div>

        {/* Icebreaker Section */}
        <div className="space-y-2">
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            Nós sabemos que todo mundo já tá de saco cheio das mesmas perguntas. Escreva aí o que você quer que compartilhemos na mensagem assim que você fizer um match:
          </p>
          <div className="relative">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Sua mensagem de quebra-gelo..." maxLength={500}
              className="w-full h-32 p-4 rounded-xl border-2 border-zinc-200 focus:border-violet-600 bg-zinc-50 text-zinc-900 resize-none" />
            <div className="absolute bottom-2 right-2 text-xs text-zinc-400 font-bold bg-white/80 px-2 rounded-full">
              {bio.length}/500
            </div>
          </div>
        </div>
      </div>
      <div className="pb-8 pt-4">
        <Button fullWidth onClick={handleStep1Complete} disabled={!name.trim() || !bio.trim() || saving} className="!bg-violet-600 !bg-none hover:!bg-violet-700 text-white !shadow-lg !shadow-violet-500/30">
          {saving ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
          Próximo <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col gap-6">
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center shadow-lg">
          <Camera size={32} className="text-violet-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-violet-600">Mostra a cara!</h2>
        <p className="text-zinc-500">Adicione pelo menos 1 foto (máximo 6)</p>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
              {photoUrls[i] ? (
                <>
                  <img
                    src={photoUrls[i]}
                    className="w-full h-full object-cover"
                    alt={`Foto ${i + 1}`}
                    loading="eager"
                    onError={(e) => {
                      // If image fails, retry after a short delay (signed URL might need time)
                      const target = e.currentTarget;
                      setTimeout(() => {
                        target.src = photoUrls[i] + '&retry=1';
                      }, 1000);
                    }}
                  />
                  <button onClick={() => handleRemovePhoto(i)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <X size={16} className="text-white" />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-2 left-2 bg-violet-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Principal
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto || i !== photoUrls.length}
                  className={`w-full h-full border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${i === photoUrls.length ? 'border-violet-600 bg-violet-50 hover:bg-violet-100' : 'border-zinc-200 bg-zinc-50'}`}>
                  {uploadingPhoto && i === photoUrls.length ? <Loader2 size={24} className="animate-spin text-violet-600" /> : <Plus size={20} className={i === photoUrls.length ? 'text-violet-600' : 'text-zinc-400'} />}
                </button>
              )}
            </div>
          ))}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
        <p className="text-sm text-zinc-500 text-center">{photoUrls.length}/6 fotos</p>
      </div>
      <div className="pb-8 pt-4">
        <Button fullWidth onClick={handleStep2Complete} disabled={photoUrls.length === 0 || uploadingPhoto || saving} className="!bg-violet-600 !bg-none hover:!bg-violet-700 text-white !shadow-lg !shadow-violet-500/30">
          {saving ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
          Próximo <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col gap-5 pt-4 overflow-y-auto">
        <h2 className="text-3xl font-extrabold text-violet-600">Sobre você</h2>
        <p className="text-zinc-500">Conta mais pra gente te conhecer melhor</p>
        <div className="space-y-2">
          <label className="text-sm font-bold text-violet-600 flex items-center gap-2"><Calendar size={16} />Data de Nascimento</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full p-4 rounded-xl border-2 border-zinc-200 bg-white font-bold text-zinc-900" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-violet-600 flex items-center gap-2"><User size={16} />Você se identifica como</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ id: 'male', label: 'Ele' }, { id: 'female', label: 'Ela' }, { id: 'other', label: 'Elu/Delu' }].map(o => (
              <button key={o.id} onClick={() => setGender(o.id as any)} className={`p-3 rounded-lg border-2 font-bold transition-all ${gender === o.id ? 'border-violet-600 bg-violet-600 text-white' : 'border-zinc-200 text-zinc-400 hover:border-violet-300'}`}>{o.label}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-violet-600 flex items-center gap-2"><Heart size={16} />Interessado em</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ id: 'male', label: 'Eles' }, { id: 'female', label: 'Elas' }, { id: 'both', label: 'Todes' }].map(o => (
              <button key={o.id} onClick={() => setInterestedIn(o.id as any)} className={`p-3 rounded-lg border-2 font-bold transition-all ${interestedIn === o.id ? 'border-violet-600 bg-violet-600 text-white' : 'border-zinc-200 text-zinc-400 hover:border-violet-300'}`}>{o.label}</button>
            ))}
          </div>
        </div>

        {/* New Fields */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-violet-600 flex items-center gap-2"><Briefcase size={16} />Profissão ou Cargo</label>
          <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ex: Designer, Estudante..." maxLength={50} className="w-full p-3 rounded-xl border-2 border-zinc-200 bg-white font-bold text-zinc-900 focus:border-violet-600" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-violet-600 flex items-center gap-2"><Ruler size={16} />Altura (em cm)</label>

          <input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={height} onChange={(e) => setHeight(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ex: 175" className="w-full p-4 rounded-xl border-2 border-zinc-200 bg-zinc-50 font-bold text-zinc-900 focus:border-violet-600 focus:bg-white transition-all" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-violet-600 flex items-center gap-2"><GraduationCap size={16} />Escolaridade</label>
          <div className="relative">
            <select value={education} onChange={(e) => setEducation(e.target.value)} className="w-full p-4 rounded-xl border-2 border-zinc-200 bg-zinc-50 font-bold text-zinc-900 focus:border-violet-600 focus:bg-white appearance-none transition-all">
              <option value="">Selecione...</option>
              <option value="Ensino Médio">Ensino Médio Incompleto</option>
              <option value="Ensino Médio Completo">Ensino Médio Completo</option>
              <option value="Ensino Superior">Ensino Superior Incompleto</option>
              <option value="Ensino Superior Completo">Ensino Superior Completo</option>
              <option value="Pós-graduação">Pós-graduação</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>
      </div>
      <div className="pb-8 pt-4">
        <Button fullWidth onClick={handleStep3Complete} disabled={!birthDate || !gender || !interestedIn || !profession.trim() || !height || !education || saving} className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30">
          {saving ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
          Próximo <ChevronRight size={20} />
        </Button>
      </div>
    </div >
  );

  const renderStep4 = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col gap-6 pt-4 overflow-y-auto">
        <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center shadow-lg">
          <Tag size={32} className="text-violet-600" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-violet-600">Seus Interesses</h2>
          <p className="text-zinc-500">Escolha até 3 coisas que você curte</p>
        </div>

        <InterestSelector
          selectedIds={selectedInterests}
          onChange={setSelectedInterests}
          maxSelection={3}
        />
      </div>
      <div className="pb-8 pt-4">
        <Button fullWidth onClick={handleStep4Complete} disabled={selectedInterests.length === 0 || saving} className="!bg-violet-600 !bg-none hover:!bg-violet-700 text-white !shadow-lg !shadow-violet-500/30">
          {saving ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
          Próximo <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-600/20 rounded-full blur-xl animate-pulse" />
          <div className="w-32 h-32 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center shadow-2xl relative">
            <MapPin size={64} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-violet-600">Onde você está?</h2>
        <p className="text-zinc-600 max-w-xs">Para encontrar pessoas perto de você, precisamos da sua localização.</p>
      </div>
      <div className="pb-8 pt-4">
        <Button fullWidth onClick={handleFinish} disabled={saving} className="!bg-violet-600 !bg-none hover:!bg-violet-700 text-white !shadow-lg !shadow-violet-500/30">
          {saving ? <><Loader2 size={20} className="animate-spin mr-2" />Finalizando...</> : 'Começar a usar!'}
        </Button>
      </div>
      <p className="text-center text-xs text-zinc-400 mt-4">Você pode pular a localização e configurar depois</p>
    </div>
  );

  return (
    <div className="h-full w-full bg-brasil-light flex flex-col">
      <div className="w-full h-1 bg-zinc-200"><div className="h-full bg-violet-600 transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} /></div>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
    </div>
  );
};

export default Onboarding;
