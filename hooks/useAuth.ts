import { useState, useEffect, useCallback, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, profiles } from '../lib/supabase'
import { initPushNotifications, removePushToken, removePushListeners } from '../lib/pushNotifications'
import { Capacitor } from '@capacitor/core'
import type { Profile, ProfileWithAll } from '../types/database'

interface AuthState {
  user: User | null
  profile: ProfileWithAll | null
  session: Session | null
  loading: boolean
  error: string | null
}

// Detectar plataforma
const isNative = Capacitor.isNativePlatform()

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  const isMountedRef = useRef(true)
  const profileLoadingRef = useRef(false)

  // Buscar perfil usando fetch direto (bypass do cliente Supabase no Android)
  const fetchProfileDirect = useCallback(async (userId: string, accessToken: string): Promise<ProfileWithAll | null> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*,photos(*),user_interests(interest:interests(*))`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })

      if (!response.ok) return null

      const data = await response.json()
      return data.length > 0 ? data[0] as unknown as ProfileWithAll : null
    } catch (err: any) {
      console.error('fetchProfileDirect error:', err)
      return null
    }
  }, [])

  // Criar perfil usando fetch direto (Android)
  const createProfileDirect = useCallback(async (userId: string, email: string, accessToken: string): Promise<ProfileWithAll | null> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const url = `${supabaseUrl}/rest/v1/profiles`

    const body = {
      id: userId,
      email: email,
      onboarding_step: 0,
      onboarding_completed: false,
      is_active: false,
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        // Se erro 409 (duplicado), buscar o existente
        if (response.status === 409) {
          return await fetchProfileDirect(userId, accessToken)
        }
        return null
      }

      const data = await response.json()
      return data.length > 0 ? data[0] as unknown as ProfileWithAll : data as unknown as ProfileWithAll
    } catch (err: any) {
      console.error('createProfileDirect error:', err)
      return null
    }
  }, [fetchProfileDirect])

  // Carregar perfil (com fallback para fetch direto no Android)
  const loadProfile = useCallback(async (user: User, accessToken: string): Promise<ProfileWithAll | null> => {
    if (profileLoadingRef.current) return null

    profileLoadingRef.current = true

    try {
      // No Android, usar fetch direto para evitar problemas com o cliente Supabase
      if (isNative) {
        let profile = await fetchProfileDirect(user.id, accessToken)
        if (!profile) {
          profile = await createProfileDirect(user.id, user.email || '', accessToken)
        }
        return profile
      }

      // No web, usar cliente Supabase normalmente
      const { data: existingProfile, error } = await profiles.getByIdWithRelations(user.id)

      // Se houver erro, verificamos se é porque o perfil não existe (PGRST116 ou 406)
      // Se for erro real de conexão ou permissão, retornamos null
      if (error) {
        // Códigos comuns para "não encontrado" no Supabase/PostgREST
        const isNotFound = error.code === 'PGRST116' || error.code === '406' || error.message?.includes('rows returned');

        if (!isNotFound) {
          console.error('Erro ao buscar perfil:', error)
          return null
        }
      }

      if (existingProfile) return existingProfile as unknown as ProfileWithAll

      // Criar se não existe
      const { data: newProfile, error: createError } = await profiles.upsertInitial(user.id, user.email || '')
      if (createError) return null

      return newProfile as unknown as ProfileWithAll
    } catch (err: any) {
      console.error('loadProfile error:', err)
      return null
    } finally {
      profileLoadingRef.current = false
    }
  }, [fetchProfileDirect, createProfileDirect])

  // Processar callback OAuth
  const handleOAuthCallback = useCallback(async (url: string) => {
    // Extrair tokens
    let hashPart = ''
    if (url.includes('#')) {
      hashPart = url.split('#')[1] || ''
    } else if (url.includes('?')) {
      hashPart = url.split('?')[1] || ''
    }

    if (!hashPart) return

    const params = new URLSearchParams(hashPart)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const error = params.get('error')

    if (error) {
      setState(prev => ({ ...prev, loading: false, error }))
      return
    }

    if (!accessToken || !refreshToken) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Definir sessão no cliente Supabase
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        setState(prev => ({ ...prev, loading: false, error: sessionError.message }))
        return
      }

      if (!data.session || !data.user) {
        setState(prev => ({ ...prev, loading: false, error: 'Sessão inválida' }))
        return
      }

      // Carregar perfil usando o accessToken diretamente
      const profile = await loadProfile(data.user, accessToken)

      // Inicializar push se onboarding completo
      if (profile?.onboarding_completed) {
        initPushNotifications(data.user.id).catch(() => { })
      }

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          user: data.user,
          profile,
          session: data.session,
          loading: false,
          error: profile ? null : 'Erro ao carregar perfil',
        }))
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }))
    }
  }, [loadProfile])

  // Setup inicial
  useEffect(() => {
    isMountedRef.current = true
    let appUrlListener: any = null

    const init = async () => {
      // Configurar deep link handler para Android
      if (isNative) {
        try {
          const { App } = await import('@capacitor/app')
          const { Browser } = await import('@capacitor/browser')

          // Listener para URLs quando app está aberto
          appUrlListener = await App.addListener('appUrlOpen', async ({ url }) => {
            try { await Browser.close() } catch { }

            if (url.includes('callback') || url.includes('access_token')) {
              await handleOAuthCallback(url)
            }
          })

          // Verificar cold start
          const launchUrl = await App.getLaunchUrl()
          if (launchUrl?.url) {
            if (launchUrl.url.includes('callback') || launchUrl.url.includes('access_token')) {
              await handleOAuthCallback(launchUrl.url)
              return // Não continuar com getSession
            }
          }
        } catch (err: any) {
          console.error('Deep link setup error:', err)
        }
      }

      // Verificar sessão existente
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          setState(prev => ({ ...prev, loading: false, error: error.message }))
          return
        }

        if (session?.user && session.access_token) {
          const profile = await loadProfile(session.user, session.access_token)

          if (profile?.onboarding_completed) {
            initPushNotifications(session.user.id).catch(() => { })
          }

          if (isMountedRef.current) {
            setState(prev => ({
              ...prev,
              user: session.user,
              profile,
              session,
              loading: false,
              error: null,
            }))
          }
        } else {
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (err: any) {
        setState(prev => ({ ...prev, loading: false, error: err.message }))
      }
    }

    init()

    // Auth state change listener (principalmente para web e token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) return

        if (event === 'SIGNED_OUT') {
          setState(prev => ({
            ...prev,
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          }))
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({ ...prev, session }))
        }
        // SIGNED_IN e INITIAL_SESSION são tratados em init() e handleOAuthCallback()
      }
    )

    return () => {
      isMountedRef.current = false
      subscription.unsubscribe()
      if (appUrlListener) appUrlListener.remove()
    }
  }, [handleOAuthCallback, loadProfile])

  // Login com Google
  const signInWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const redirectUrl = isNative
        ? 'com.pegaoupassa.app://callback/'
        : window.location.origin + '/auth/callback'

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
          skipBrowserRedirect: isNative,
        },
      })

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }))
        return { error }
      }

      // No Android, abrir browser manualmente
      if (isNative && data?.url) {
        const { Browser } = await import('@capacitor/browser')
        await Browser.open({
          url: data.url,
          presentationStyle: 'popover',
        })
      }

      // Parar loading (usuário pode cancelar)
      setState(prev => ({ ...prev, loading: false }))
      return { error: null }
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }))
      return { error: err }
    }
  }, [])

  // Logout
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))

    if (state.user) {
      await removePushToken(state.user.id).catch(() => { })
      await removePushListeners().catch(() => { })
    }

    const { error } = await supabase.auth.signOut()

    setState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: error?.message || null,
    })

    return { error }
  }, [state.user])

  // Atualizar perfil
  const updateProfile = useCallback(async (updates: Partial<ProfileWithAll>) => {
    if (!state.user) {
      return { error: new Error('Usuário não autenticado') }
    }

    const { data, error } = await profiles.update(state.user.id, updates)

    if (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { error }
    }

    // Mesclar dados atualizados com perfil existente para preservar relações (photos, user_interests)
    // A API retorna apenas campos da tabela, sem relações
    setState(prev => ({
      ...prev,
      profile: prev.profile
        ? { ...prev.profile, ...data }  // Mantém photos/interests do estado anterior
        : data,
    }))

    return { data, error: null }
  }, [state.user])

  // Recarregar perfil
  const refreshProfile = useCallback(async () => {
    if (!state.user || !state.session?.access_token) return

    const profile = await loadProfile(state.user, state.session.access_token)
    if (profile) {
      setState(prev => ({ ...prev, profile }))
    }
  }, [state.user, state.session, loadProfile])


  return {
    // Estado
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    error: state.error,

    // Computed
    isAuthenticated: !!state.user,
    hasProfile: !!state.profile,
    hasCompletedOnboarding: state.profile?.onboarding_completed || false,
    onboardingStep: state.profile?.onboarding_step || 0,
    isVip: state.profile?.is_vip || false,

    // Actions
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
    loadProfile: async () => {
      if (state.user && state.session?.access_token) {
        const profile = await loadProfile(state.user, state.session.access_token)
        if (profile) {
          setState(prev => ({ ...prev, profile }))
        }
      }
    },
  }
}
