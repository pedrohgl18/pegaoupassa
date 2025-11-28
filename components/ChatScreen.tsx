import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MoreVertical, Image as ImageIcon, Mic, Trash2, AlertTriangle, Crown, Loader2, StopCircle, X, ZoomIn, Flag, Reply, Smile } from 'lucide-react';
import { messages as messagesApi, matches as matchesApi, supabase, pushNotifications, reports, messageReactions } from '../lib/supabase';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  media_url?: string;
  media_type?: 'image' | 'audio' | 'gif';
  reply_to_id?: string;
  reply_to?: Message;
  reactions?: { reaction: string; user_id: string }[];
}

interface ChatScreenProps {
  conversationId: string;
  matchId: string;
  currentUserId: string;
  currentUserIsVip?: boolean;
  currentUserName?: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhoto: string;
  otherUserIsVip?: boolean;
  onBack: () => void;
  onUnmatch: () => void;
}

// Componente Lightbox para visualização em tela cheia
const ImageLightbox: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        style={{ top: 'calc(env(safe-area-inset-top, 16px) + 16px)' }}
      >
        <X size={28} />
      </button>
      <img 
        src={imageUrl} 
        alt="Imagem em tela cheia"
        className="max-w-full max-h-full object-contain p-4"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

const ChatScreen: React.FC<ChatScreenProps> = ({ 
  conversationId, 
  matchId,
  currentUserId, 
  currentUserIsVip = false,
  currentUserName = 'Alguém',
  otherUserId,
  otherUserName, 
  otherUserPhoto, 
  otherUserIsVip = false,
  onBack,
  onUnmatch
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Presence State
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Media State
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reply/Reactions State
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<any>(null);

  const REACTIONS = ['❤️', '😂', '😮', '😢', '👍'];

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputFocus = () => {
    textareaRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Typing indicator logic
    if (!isTyping) {
      setIsTyping(true);
      channelRef.current?.track({ online_at: new Date().toISOString(), typing: true });
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      channelRef.current?.track({ online_at: new Date().toISOString(), typing: false });
    }, 2000);

    // Auto resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  const handleUnmatch = async () => {
    if (!matchId) return;
    
    const { error } = await matchesApi.unmatch(matchId);
    if (error) {
      alert('Erro ao desfazer match');
      console.error(error);
    } else {
      onUnmatch();
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to real-time changes (Messages + Presence)
    const channel = supabase.channel(`chat:${conversationId}`);
    channelRef.current = channel;

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Flatten all presence entries and filter out current user
        const allPresences: any[] = [];
        Object.values(state).forEach((presenceList: any) => {
          if (Array.isArray(presenceList)) {
            presenceList.forEach(p => allPresences.push(p));
          }
        });
        
        // Filter to get only OTHER user's presence (not mine)
        const otherUserPresences = allPresences.filter((p: any) => p.user_id === otherUserId);
        
        if (otherUserPresences.length > 0) {
          setOtherUserOnline(true);
          // Check if the OTHER user is typing
          const otherIsTyping = otherUserPresences.some((p: any) => p.typing === true);
          setOtherUserTyping(otherIsTyping);
        } else {
          setOtherUserOnline(false);
          setOtherUserTyping(false);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            user_id: currentUserId,
            online_at: new Date().toISOString(), 
            typing: false 
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await messagesApi.getByConversation(conversationId);
    if (data) {
      // Buscar reações para todas as mensagens
      const messagesWithReactions = await Promise.all(
        (data as any[]).map(async (msg) => {
          const { data: reactions } = await messageReactions.getByMessage(msg.id);
          // Buscar reply_to se existir
          let replyTo = null;
          if (msg.reply_to_id) {
            const { data: replyData } = await supabase
              .from('messages')
              .select('id, content, sender_id')
              .eq('id', msg.reply_to_id)
              .single();
            replyTo = replyData;
          }
          return { ...msg, reactions: reactions || [], reply_to: replyTo };
        })
      );
      setMessages(messagesWithReactions);
    }
    setLoading(false);
  };

  // Reaction Handlers
  const handleAddReaction = async (messageId: string, reaction: string) => {
    const { error } = await messageReactions.add(messageId, currentUserId, reaction);
    if (error) {
      showToast('Erro ao adicionar reação', 'error');
    } else {
      // Atualizar localmente
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const existingReactions = msg.reactions || [];
          // Remover reação anterior do mesmo usuário se existir
          const filtered = existingReactions.filter(r => r.user_id !== currentUserId);
          return { ...msg, reactions: [...filtered, { reaction, user_id: currentUserId }] };
        }
        return msg;
      }));
    }
    setShowReactionPicker(false);
    setSelectedMessage(null);
  };

  const handleRemoveReaction = async (messageId: string) => {
    const { error } = await messageReactions.remove(messageId, currentUserId);
    if (!error) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return { 
            ...msg, 
            reactions: (msg.reactions || []).filter(r => r.user_id !== currentUserId) 
          };
        }
        return msg;
      }));
    }
  };

  // Reply Handler
  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setShowReactionPicker(false);
    setSelectedMessage(null);
    textareaRef.current?.focus();
  };

  // Delete Message Handler
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Apagar esta mensagem para todos?')) return;
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', currentUserId); // Só pode deletar próprias mensagens
    
    if (error) {
      showToast('Erro ao apagar mensagem', 'error');
    } else {
      setMessages(prev => prev.filter(m => m.id !== messageId));
      showToast('Mensagem apagada', 'success');
    }
    setSelectedMessage(null);
  };

  // Report Handler
  const handleReport = async () => {
    if (!reportReason.trim()) {
      showToast('Selecione um motivo', 'error');
      return;
    }
    
    const { error } = await reports.create(currentUserId, otherUserId, reportReason);
    if (error) {
      showToast('Erro ao enviar denúncia', 'error');
    } else {
      showToast('Denúncia enviada. Vamos analisar.', 'success');
      setShowReportModal(false);
      setReportReason('');
    }
  };

  // Long press handler for messages
  const handleMessageLongPress = (message: Message) => {
    setSelectedMessage(message);
    setShowReactionPicker(true);
  };

  const handleSend = async (content: string = newMessage, mediaUrl?: string, mediaType?: 'image' | 'audio') => {
    if (!content.trim() && !mediaUrl) return;

    const msgContent = content.trim();
    if (!mediaUrl) setNewMessage(''); // Clear input if text only
    
    const replyToId = replyingTo?.id;
    setReplyingTo(null); // Clear reply state
    
    // Optimistic UI Update
    const tempId = 'temp-' + Date.now();
    const tempMessage: Message = {
      id: tempId,
      content: msgContent,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      is_read: false,
      media_url: mediaUrl,
      media_type: mediaType,
      reply_to_id: replyToId,
      reply_to: replyingTo ? { id: replyingTo.id, content: replyingTo.content, sender_id: replyingTo.sender_id } as Message : undefined
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: msgContent,
        media_url: mediaUrl,
        media_type: mediaType,
        reply_to_id: replyToId
      })
      .select()
      .single();
    
    if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      showToast('Erro ao enviar mensagem', 'error');
    } else if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...data as any, reply_to: tempMessage.reply_to } : m));
      
      // Enviar push notification para o outro usuário (não bloqueia a UI)
      const preview = mediaType === 'image' ? '📷 Foto' : mediaType === 'audio' ? '🎤 Áudio' : (msgContent.length > 50 ? msgContent.substring(0, 50) + '...' : msgContent);
      pushNotifications.notifyMessage(otherUserId, currentUserName, preview, conversationId, currentUserId).catch(console.error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Media Handlers
  const handlePhotoClick = () => {
    if (!currentUserIsVip) {
      alert('Recurso exclusivo para VIPs! Assine para enviar fotos.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande (Max 10MB)');
      return;
    }

    setUploadingMedia(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
      
      console.log('Iniciando upload:', fileName, 'Tipo:', file.type, 'Tamanho:', file.size);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Erro no upload storage:', uploadError);
        throw uploadError;
      }

      console.log('Upload concluído:', uploadData);

      // Verificar se o upload foi bem-sucedido
      if (!uploadData?.path) {
        throw new Error('Upload falhou - caminho não retornado');
      }

      // Usar URL assinada (bucket com RLS, não público)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('chat-media')
        .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365); // 1 ano

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('Erro ao gerar URL assinada:', signedUrlError);
        throw new Error('Não foi possível obter a URL da imagem');
      }

      console.log('Foto enviada - URL assinada:', signedUrlData.signedUrl);
      
      // Enviar com texto "📷 Foto" para aparecer na lista de conversas
      await handleSend('📷 Foto', signedUrlData.signedUrl, 'image');
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar foto.');
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMicClick = async () => {
    if (!currentUserIsVip) {
      alert('Recurso exclusivo para VIPs! Assine para enviar áudio.');
      return;
    }

    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await uploadAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        
        const interval = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        (mediaRecorder as any).timerInterval = interval;
        mediaRecorder.addEventListener('stop', () => clearInterval(interval));

      } catch (err) {
        console.error('Erro ao acessar microfone:', err);
        alert('Permissão de microfone negada.');
      }
    }
  };

  const uploadAudio = async (blob: Blob) => {
    setUploadingMedia(true);
    try {
      const fileName = `${currentUserId}/${Date.now()}.webm`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('chat-media')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'audio/webm'
        });

      if (uploadError) throw uploadError;

      if (!uploadData?.path) {
        throw new Error('Upload falhou - caminho não retornado');
      }

      // Usar URL assinada (bucket com RLS, não público)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('chat-media')
        .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365); // 1 ano

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('Erro ao gerar URL assinada:', signedUrlError);
        throw new Error('Não foi possível obter a URL do áudio');
      }

      console.log('Áudio enviado - URL assinada:', signedUrlData.signedUrl);
      await handleSend('🎤 Áudio', signedUrlData.signedUrl, 'audio');
    } catch (error) {
      console.error('Erro no upload de áudio:', error);
      alert('Erro ao enviar áudio.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showUnmatchConfirm) {
    return (
      <div className="flex flex-col h-full w-full bg-white items-center justify-center p-8 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Desfazer Match?</h2>
        <p className="text-zinc-500 mb-8">
          Isso removerá {otherUserName} dos seus matches e apagará a conversa. 
          Essa pessoa poderá aparecer novamente no seu feed.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={handleUnmatch}
            className="w-full py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
          >
            Sim, desfazer match
          </button>
          <button 
            onClick={() => setShowUnmatchConfirm(false)}
            className="w-full py-4 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white animate-in slide-in-from-right duration-300 relative">
      {/* Lightbox para visualização de imagem em tela cheia */}
      {lightboxImage && (
        <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}

      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-white shadow-sm z-10"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-full flex-shrink-0 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="relative flex-shrink-0">
            <img src={otherUserPhoto} alt={otherUserName} className="w-11 h-11 rounded-full object-cover border-2 border-zinc-100" />
            {otherUserOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-zinc-900 flex items-center gap-1.5 truncate">
              {otherUserName}
              {otherUserIsVip && <Crown size={14} className="text-brasil-yellow fill-brasil-yellow flex-shrink-0" />}
            </h3>
            <span className={`text-xs font-medium ${otherUserOnline ? 'text-green-600' : 'text-zinc-400'}`}>
              {otherUserTyping ? 'Digitando...' : (otherUserOnline ? 'Online agora' : 'Offline')}
            </span>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2.5 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"
          >
            <MoreVertical size={22} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => {
                  setShowMenu(false);
                  setShowReportModal(true);
                }}
                className="w-full px-4 py-3 text-left text-amber-600 hover:bg-amber-50 flex items-center gap-3 font-medium text-sm border-b border-zinc-100"
              >
                <Flag size={18} />
                Denunciar
              </button>
              <button 
                onClick={() => {
                  setShowMenu(false);
                  setShowUnmatchConfirm(true);
                }}
                className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 flex items-center gap-3 font-medium text-sm"
              >
                <Trash2 size={18} />
                Desfazer Match
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 space-y-4" onClick={() => { setShowMenu(false); setSelectedMessage(null); setShowReactionPicker(false); }}>
        {loading ? (
          <div className="flex justify-center pt-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brasil-blue"></div></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-2">
               <span className="text-4xl"></span>
            </div>
            <p>Diga oi para {otherUserName}!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const hasMedia = msg.media_url && msg.media_type;
            const isImageMessage = msg.media_type === 'image';
            const isAudioMessage = msg.media_type === 'audio';
            const timestamp = new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const isSelected = selectedMessage?.id === msg.id;
            const messageReactionsList = msg.reactions || [];
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Reply Quote */}
                {msg.reply_to && (
                  <div className={`text-xs mb-1 px-3 py-1.5 rounded-lg max-w-[70%] ${
                    isMe ? 'bg-blue-900/30 text-blue-200 mr-2' : 'bg-zinc-200 text-zinc-600 ml-2'
                  }`}>
                    <span className="font-medium block text-[10px] opacity-70">
                      {msg.reply_to.sender_id === currentUserId ? 'Você' : otherUserName}
                    </span>
                    <span className="line-clamp-1">{msg.reply_to.content || '📷 Mídia'}</span>
                  </div>
                )}
                
                <div 
                  className={`relative max-w-[75%] rounded-2xl shadow-sm overflow-hidden ${
                    isMe 
                      ? 'bg-brasil-blue text-white' 
                      : 'bg-white text-zinc-800 border border-zinc-200'
                  } ${isSelected ? 'ring-2 ring-brasil-yellow' : ''}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleMessageLongPress(msg);
                  }}
                  onTouchStart={() => {
                    const timeout = setTimeout(() => handleMessageLongPress(msg), 500);
                    const clear = () => clearTimeout(timeout);
                    document.addEventListener('touchend', clear, { once: true });
                    document.addEventListener('touchmove', clear, { once: true });
                  }}
                >
                  {/* Image Content - Thumbnail com altura máxima e clicável para lightbox */}
                  {isImageMessage && msg.media_url && (
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => setLightboxImage(msg.media_url!)}
                    >
                      <img 
                        src={msg.media_url} 
                        alt="Foto enviada" 
                        className="w-full max-h-[200px] object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.onerror = null;
                          img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect fill="%23e5e7eb" width="200" height="150"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="14">Imagem indisponível</text></svg>';
                          img.className = 'w-full h-auto opacity-60';
                        }}
                      />
                      {/* Indicador de zoom */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-2">
                          <ZoomIn size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Audio Content */}
                  {isAudioMessage && msg.media_url && (
                    <div className="p-3">
                      <audio controls src={msg.media_url} className="max-w-[200px]" />
                    </div>
                  )}

                  {/* Text Content ou Timestamp para mídia */}
                  <div className={`px-3 py-2 ${isImageMessage ? 'pt-1.5' : ''}`}>
                    {/* Texto - só mostra se tiver conteúdo E não for apenas mídia */}
                    {msg.content && !hasMedia && (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                    
                    {/* Timestamp - sempre fora da imagem, no fundo da bolha */}
                    <span className={`text-[10px] block text-right ${
                      isMe ? 'text-blue-200' : 'text-zinc-400'
                    } ${msg.content && !hasMedia ? 'mt-1' : ''}`}>
                      {timestamp}
                    </span>
                  </div>
                </div>

                {/* Reactions Display */}
                {messageReactionsList.length > 0 && (
                  <div className={`flex gap-0.5 mt-1 ${isMe ? 'mr-2' : 'ml-2'}`}>
                    {messageReactionsList.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={() => r.user_id === currentUserId ? handleRemoveReaction(msg.id) : null}
                        className={`text-sm px-1.5 py-0.5 rounded-full bg-white shadow-sm border border-zinc-100 ${
                          r.user_id === currentUserId ? 'cursor-pointer hover:bg-zinc-100' : 'cursor-default'
                        }`}
                        title={r.user_id === currentUserId ? 'Clique para remover' : ''}
                      >
                        {r.reaction}
                      </button>
                    ))}
                  </div>
                )}

                {/* Reaction Picker - appears when message is selected */}
                {isSelected && showReactionPicker && (
                  <div 
                    className={`flex gap-1 mt-2 p-2 bg-white rounded-2xl shadow-xl border border-zinc-200 animate-in zoom-in-95 duration-200 ${isMe ? 'mr-2' : 'ml-2'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddReaction(msg.id, emoji)}
                        className="text-xl p-1.5 hover:bg-zinc-100 rounded-full transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="w-px bg-zinc-200 mx-1" />
                    <button
                      onClick={() => handleReply(msg)}
                      className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors text-zinc-600"
                      title="Responder"
                    >
                      <Reply size={18} />
                    </button>
                    {isMe && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1.5 hover:bg-red-100 rounded-full transition-colors text-red-500"
                        title="Apagar"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        {otherUserTyping && (
          <div className="flex justify-start">
             <div className="bg-white border border-zinc-200 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Bar */}
      {replyingTo && (
        <div className="bg-zinc-100 px-4 py-2 flex items-center justify-between border-t border-zinc-200">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Reply size={16} className="text-brasil-blue flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs text-brasil-blue font-medium block">
                Respondendo a {replyingTo.sender_id === currentUserId ? 'você mesmo' : otherUserName}
              </span>
              <span className="text-xs text-zinc-500 truncate block">
                {replyingTo.content || '📷 Mídia'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-zinc-200 rounded-full text-zinc-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Area - com safe-area para evitar sobreposição com barra de navegação */}
      <div 
        className="bg-white border-t border-zinc-100 px-3 pt-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 12px) + 12px)' }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handlePhotoSelect}
        />
        
        <div className="flex items-end gap-2">
          {/* Botão de Foto - com fundo distinto */}
          <button 
            onClick={handlePhotoClick}
            disabled={uploadingMedia || isRecording}
            className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
              currentUserIsVip 
                ? 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200' 
                : 'text-zinc-300 bg-zinc-50'
            }`}
          >
            {uploadingMedia ? <Loader2 size={22} className="animate-spin" /> : <ImageIcon size={22} />}
          </button>

          {/* Campo de texto */}
          <div 
            className="flex-1 bg-zinc-100 rounded-2xl flex items-center min-h-[48px] px-4 py-2 cursor-text"
            onClick={handleInputFocus}
          >
            {isRecording ? (
              <div className="flex items-center gap-2 w-full text-red-500 font-bold animate-pulse">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                Gravando... {formatTime(recordingTime)}
              </div>
            ) : (
              <textarea 
                ref={textareaRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Digite uma mensagem..."
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none max-h-24 text-sm text-zinc-800 placeholder-zinc-400 p-0"
                rows={1}
                style={{ minHeight: '24px' }}
              />
            )}
          </div>

          {/* Botão de enviar ou microfone - com fundo distinto */}
          {newMessage.trim() ? (
            <button 
              onClick={() => handleSend()}
              className="p-2.5 bg-brasil-blue text-white rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-90 flex-shrink-0"
            >
              <Send size={22} />
            </button>
          ) : (
            <button 
              onClick={handleMicClick}
              className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
                isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg animate-pulse' 
                  : (currentUserIsVip 
                      ? 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200' 
                      : 'text-zinc-300 bg-zinc-50')
              }`}
            >
              {isRecording ? <StopCircle size={22} /> : <Mic size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Flag size={32} className="text-amber-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-zinc-900 mb-2">Denunciar {otherUserName}</h3>
            <p className="text-sm text-zinc-500 text-center mb-6">Por que você quer denunciar esta pessoa?</p>
            
            <div className="space-y-2 mb-6">
              {[
                'Perfil falso',
                'Comportamento inadequado',
                'Spam ou golpe',
                'Conteúdo ofensivo',
                'Menor de idade',
                'Outro'
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition-colors ${
                    reportReason === reason
                      ? 'bg-amber-100 text-amber-700 border-2 border-amber-400'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReportModal(false); setReportReason(''); }}
                className="flex-1 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-5 duration-300 z-50 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
