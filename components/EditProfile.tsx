import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Plus, X, Briefcase, GraduationCap, Ruler, Sparkles, Settings as SettingsIcon, Tag, ChevronRight } from 'lucide-react';
import Button from './Button';
import { profiles, photos as photosApi, interests } from '../lib/supabase';
import { r2Storage } from '../lib/r2';

import InterestSelector from './InterestSelector';
import { TagSelector } from './TagSelector';

const ZODIAC_SIGNS = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
];

const EDUCATION_OPTIONS = [
  'Ensino Fundamental Incompleto',
  'Ensino Fundamental Completo',
  'Ensino Médio Incompleto',
  'Ensino Médio Completo',
  'Ensino Superior Incompleto',
  'Ensino Superior Completo',
  'Pós-graduação',
  'Mestrado',
  'Doutorado'
];

interface EditProfileProps {
  userId: string;
  onBack: () => void;
  onSave: () => void;
  onLogout: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ userId, onBack, onSave, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profession, setProfession] = useState('');
  const [education, setEducation] = useState('');
  const [height, setHeight] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // New
  const [showTagsModal, setShowTagsModal] = useState(false); // New

  const [photoUrls, setPhotoUrls] = useState<{ id: string, url: string, position: number }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await profiles.getByIdWithRelations(userId);

    if (data) {
      setName(data.name || '');
      setBio(data.bio || '');
      setProfession(data.profession || '');
      setEducation(data.education || '');
      setHeight(data.height ? data.height.toString() : '');
      setZodiacSign(data.zodiac_sign || '');
      setSelectedTags(data.tags || []); // Fetch tags

      if (data.photos) {
        setPhotoUrls(data.photos.sort((a: any, b: any) => a.position - b.position));
      }

      if (data.user_interests) {
        setSelectedInterests(data.user_interests.map((ui: any) => ui.interest_id));
      }
    }
    setLoading(false);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Selecione uma imagem.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Max 5MB.'); return; }

    if (photoUrls.length >= 6) { alert('Máximo de 6 fotos.'); return; }

    setUploadingPhoto(true);
    try {
      // Upload returns URL, but we need to refresh to get ID or handle it better
      // For simplicity, we upload and then re-fetch or manually construct object
      // But photos.upload returns { url, error }
      // We actually need the ID to delete later. 
      // Let's just re-fetch photos after upload for now to be safe and simple
      // R2 Upload
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${photoUrls.length}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      const bucketName = import.meta.env.VITE_R2_BUCKET_PHOTOS || 'photos';

      const { url, error } = await r2Storage.uploadFile(bucketName, filePath, file);

      if (error) {
        alert('Erro no upload R2.');
        console.error(error);
      } else if (url) {
        // Now save metadata to Supabase
        // We need to create the photo object in DB
        const { error: dbError } = await photosApi.create({
          user_id: userId,
          url: url, // R2 Public URL
          position: photoUrls.length
        });

        if (dbError) {
          console.error('DB Error:', dbError);
        }

        // Refresh profile
        const { data } = await profiles.getByIdWithRelations(userId);
        if (data && data.photos) {
          setPhotoUrls(data.photos.sort((a: any, b: any) => a.position - b.position));
        }
      }
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const photo = photoUrls[index];
    if (!photo) return;

    if (!confirm('Deletar esta foto?')) return;

    // Extract filename from URL for storage deletion
    // URL format: .../photos/USER_ID/TIMESTAMP_POS.ext
    const fileName = photo.url.split('/').pop();
    const fullPath = `${userId}/${fileName}`;

    const { error } = await photosApi.delete(userId, photo.id, fullPath);

    if (error) {
      alert('Erro ao deletar foto.');
    } else {
      setPhotoUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Nome é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      // Update profile
      const { error } = await profiles.update(userId, {
        name: name.trim(),
        bio: bio.trim(),
        profession: profession.trim(),
        education: education.trim(),
        height: height ? parseInt(height) : null,
        zodiac_sign: zodiacSign,
        tags: selectedTags // Save tags
      });

      if (error) {
        alert('Erro ao salvar perfil.');
        return;
      }

      // Update interests
      const { error: interestsError } = await interests.saveUserInterests(userId, selectedInterests);
      if (interestsError) {
        alert('Erro ao salvar interesses.');
        return;
      }

      onSave();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <Loader2 className="animate-spin text-brasil-blue" size={32} />
      </div>
    );
  }



  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 animate-in slide-in-from-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-8 bg-white border-b border-zinc-200 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-zinc-900">Editar Perfil</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-brasil-blue font-bold text-sm hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Photos Section */}
        <section>
          <h2 className="text-sm font-bold text-zinc-500 uppercase mb-3 tracking-wider">Fotos</h2>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-200 shadow-sm ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                {photoUrls[i] ? (
                  <>
                    <img src={photoUrls[i].url} className="w-full h-full object-cover" alt={`Foto ${i + 1}`} />
                    <button
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                    >
                      <X size={16} className="text-white" />
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs font-bold backdrop-blur-sm">
                        Principal
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto || i !== photoUrls.length}
                    className={`w-full h-full border-2 border-dashed flex flex-col items-center justify-center transition-colors ${i === photoUrls.length
                      ? 'border-brasil-blue bg-brasil-blue/5 hover:bg-brasil-blue/10 cursor-pointer'
                      : 'border-zinc-300 bg-zinc-100 cursor-not-allowed'
                      }`}
                  >
                    {uploadingPhoto && i === photoUrls.length ? (
                      <Loader2 size={24} className="animate-spin text-brasil-blue" />
                    ) : (
                      <Plus size={24} className={i === photoUrls.length ? 'text-brasil-blue' : 'text-zinc-300'} />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
          <p className="text-xs text-zinc-400 mt-2 text-center">Arraste para reordenar (em breve)</p>
        </section>

        {/* Basic Info */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Sobre Mim</h2>

          <div className="space-y-1">
            <label className="text-sm font-bold text-zinc-700">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-white font-bold text-lg text-zinc-900 outline-none transition-colors"
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-zinc-700">Mensagem de Quebra-Gelo (Match)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-32 p-4 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-white text-zinc-900 resize-none outline-none transition-colors"
              placeholder="Escreva o que você quer que compartilhemos na mensagem assim que você fizer um match..."
            />
          </div>
        </section>



        {/* Details */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Detalhes</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                <Briefcase size={16} className="text-brasil-green" /> Profissão
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-white text-zinc-900 outline-none"
                placeholder="Ex: Designer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                <Ruler size={16} className="text-brasil-green" /> Altura (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-white text-zinc-900 outline-none"
                placeholder="Ex: 175"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
              <GraduationCap size={16} className="text-brasil-green" /> Escolaridade
            </label>
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-white text-zinc-900 outline-none appearance-none"
            >
              <option value="">Selecione...</option>
              {EDUCATION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
              <Sparkles size={16} className="text-brasil-green" /> Signo
            </label>
            <select
              value={zodiacSign}
              onChange={(e) => setZodiacSign(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-zinc-200 focus:border-brasil-blue bg-white text-zinc-900 outline-none appearance-none"
            >
              <option value="">Selecione...</option>
              {ZODIAC_SIGNS.map(sign => (
                <option key={sign} value={sign}>{sign}</option>
              ))}
            </select>
          </div>
        </section>



        {/* Interests Button */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Tag size={16} /> Interesses
          </h2>
          <button
            onClick={() => setShowInterestsModal(true)}
            className="w-full p-4 bg-white rounded-xl border-2 border-zinc-200 flex items-center justify-between group hover:border-brasil-blue transition-all"
          >
            <div className="flex flex-col items-start">
              <span className="font-bold text-zinc-900">Selecionar Interesses</span>
              <span className="text-xs text-zinc-500">
                {selectedInterests.length > 0
                  ? `${selectedInterests.length} selecionados`
                  : 'Adicione seus hobbies e gostos'}
              </span>
            </div>
            <ChevronRight size={20} className="text-zinc-400 group-hover:text-brasil-blue" />
          </button>
        </section>

        {/* Tags Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            🏷️ Minhas Tags
          </h2>
          <button
            onClick={() => setShowTagsModal(true)}
            className="w-full p-4 bg-white rounded-xl border-2 border-zinc-200 flex items-center justify-between group hover:border-brasil-blue transition-all"
          >
            <div className="flex flex-col items-start gap-2">
              <span className="font-bold text-zinc-900">Selecionar Identidade</span>
              {selectedTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-zinc-500">Adicione signos, tribos ou bandeiras</span>
              )}
            </div>
            <ChevronRight size={20} className="text-zinc-400 group-hover:text-brasil-blue" />
          </button>
        </section>

        <div className="pt-4 pb-10">
          <Button fullWidth onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

      </div>

      {/* Interests Modal */}
      {showInterestsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[480px] h-[80vh] rounded-t-3xl sm:rounded-3xl p-6 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2">
                <Tag size={24} className="text-brasil-blue" /> Seus Interesses
              </h2>
              <button
                onClick={() => setShowInterestsModal(false)}
                className="p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <InterestSelector
                selectedIds={selectedInterests}
                onChange={setSelectedInterests}
                maxSelection={5}
              />
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100">
              <Button fullWidth onClick={() => setShowInterestsModal(false)}>
                Concluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Selector Modal */}
      <TagSelector
        isOpen={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        selectedTags={selectedTags}
        onToggleTag={(tag) => {
          setSelectedTags(prev => {
            if (prev.includes(tag)) return prev.filter(t => t !== tag);
            if (prev.length >= 5) {
              alert('Máximo de 5 tags.');
              return prev;
            }
            return [...prev, tag];
          });
        }}
      />
    </div>
  );
};

export default EditProfile;
