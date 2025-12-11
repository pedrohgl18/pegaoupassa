import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

// Tipos de notificação
export type NotificationType = 'match' | 'message' | 'like' | 'super_like';

interface PushNotificationData {
  type: NotificationType;
  senderId?: string;
  senderName?: string;
  senderPhoto?: string;
  matchId?: string;
  conversationId?: string;
  message?: string;
}

// Verificar se está rodando em plataforma nativa
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

// Inicializar Push Notifications
export const initPushNotifications = async (userId: string) => {
  if (!isNativePlatform()) {
    console.log('Push Notifications: Ignorado (não é plataforma nativa)');
    return { success: false, reason: 'not-native' };
  }

  try {
    // Remover listeners antigos para evitar duplicação
    await PushNotifications.removeAllListeners();

    // Verificar permissões
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      // Solicitar permissão
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      return { success: false, reason: 'permission-denied' };
    }

    // Listener: Token recebido - ADICIONAR ANTES de register()
    PushNotifications.addListener('registration', async (token) => {
      // Salvar token no Supabase
      await saveTokenToDatabase(userId, token.value);
    });

    // Listener: Erro no registro
    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push Notifications: Erro no registro:', err.error);
    });

    // Listener: Notificação recebida (app em primeiro plano)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      handleForegroundNotification(notification);
    });

    // Listener: Usuário clicou na notificação
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      handleNotificationTap(notification.notification.data as PushNotificationData);
    });

    // Registrar para receber notificações - DEPOIS de configurar listeners
    await PushNotifications.register();

    // Criar canais de notificação (Android)
    if (Capacitor.getPlatform() === 'android') {
      await createNotificationChannels();
    }

    return { success: true };
  } catch (error) {
    console.error('Push Notifications: Erro na inicialização:', error);
    return { success: false, reason: 'error', error };
  }
};

// Criar canais de notificação (Android)
const createNotificationChannels = async () => {
  try {
    await PushNotifications.createChannel({
      id: 'messages',
      name: 'Mensagens',
      description: 'Receba notificações de novas mensagens',
      importance: 5, // High
      visibility: 1, // Public
      sound: 'default',
      vibration: true,
    });

    await PushNotifications.createChannel({
      id: 'matches',
      name: 'Matches',
      description: 'Receba notificações de novos matches',
      importance: 5, // High
      visibility: 1, // Public
      sound: 'default',
      vibration: true,
    });

    await PushNotifications.createChannel({
      id: 'likes',
      name: 'Curtidas',
      description: 'Receba notificações quando alguém te curtir',
      importance: 3, // Default
      visibility: 1, // Public
      sound: 'default',
      vibration: false, // Menos intrusivo
    });

    console.log('Push Notifications: Canais criados com sucesso');
  } catch (error) {
    console.error('Push Notifications: Erro ao criar canais:', error);
  }
};

// Salvar token FCM no banco de dados
const saveTokenToDatabase = async (userId: string, token: string) => {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .upsert({
        user_id: userId,
        token: token,
        platform: 'android',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Push Notifications: Erro ao salvar token:', error);
    }
  } catch (err) {
    console.error('Push Notifications: Exceção ao salvar token:', err);
  }
};

// Handler para notificações em foreground
const handleForegroundNotification = (notification: any) => {
  const data = notification.data as PushNotificationData;

  // Disparar evento customizado para o React ouvir
  window.dispatchEvent(new CustomEvent('push-notification', {
    detail: {
      title: notification.title,
      body: notification.body,
      data: data,
    }
  }));
};

// Handler para quando usuário clica na notificação
const handleNotificationTap = (data: PushNotificationData) => {
  // Disparar evento customizado para navegação
  window.dispatchEvent(new CustomEvent('push-notification-tap', {
    detail: data,
  }));
};

// Remover token (logout)
export const removePushToken = async (userId: string) => {
  if (!isNativePlatform()) return;

  try {
    await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId);

    console.log('Push Notifications: Token removido');
  } catch (err) {
    console.error('Push Notifications: Erro ao remover token:', err);
  }
};

// Remover todos os listeners (cleanup)
export const removePushListeners = async () => {
  if (!isNativePlatform()) return;

  await PushNotifications.removeAllListeners();
  console.log('Push Notifications: Listeners removidos');
};
