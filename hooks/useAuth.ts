import { useState, useEffect, useCallback, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, profiles } from '../lib/supabase'
import { initPushNotifications, removePushToken, removePushListeners } from '../lib/pushNotifications'
import { Capacitor } from '@capacitor/core'
import type { Profile } from '../types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
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
  const fetchProfileDirect = useCallback(async (userId: string, accessToken: string): Promise<Profile | null> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) return null
      
      const data = await response.json()
      return data.length > 0 ? data[0] as Profile : null
    } catch (err: any) {
      console.error('fetchProfileDirect error:', err)
      return null
    }
  }, [])

  // Criar perfil usando fetch direto (Android)
  const createProfileDirect = useCallback(async (userId: string, email: string, accessToken: string): Promise<Profile | null> => {
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
      return data.length > 0 ? data[0] as Profile : data as Profile
    } catch (err: any) {
      console.error('createProfileDirect error:', err)
      return null
    }
  }, [fetchProfileDirect])

  // Carregar perfil (com fallback para fetch direto no Android)
  const loadProfile = useCallback(async (user: User, accessToken: string): Promise<Profile | null> => {
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
      const { data: existingProfile, error } = await profiles.getById(user.id)
      
      if (error) return null
      if (existingProfile) return existingProfile as Profile
      
      // Criar se não existe
      const { data: newProfile, error: createError } = await profiles.upsertInitial(user.id, user.email || '')
      if (createError) return null
      
      return newProfile as Profile
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
        initPushNotifications(data.user.id).catch(() => {})
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
            try { await Browser.close() } catch {}
            
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
            initPushNotifications(session.user.id).catch(() => {})
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
      await removePushToken(state.user.id).catch(() => {})
      await removePushListeners().catch(() => {})
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

  // Atualizar step do onboarding
  const updateOnboardingStep = useCallback(async (step: number, data: Record<string, any>) => {
    if (!state.user) {
      return { error: new Error('Usuário não autenticado') }
    }

    const { data: updatedProfile, error } = await profiles.updateOnboarding(
      state.user.id,
      data,
      step
    )

    if (error) {
      console.error('Erro ao atualizar onboarding:', error)
      return { error }
    }

    setState(prev => ({
      ...prev,
      profile: updatedProfile,
    }))

    return { data: updatedProfile, error: null }
  }, [state.user])

  // Atualizar perfil
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user) {
      return { error: new Error('Usuário não autenticado') }
    }

    const { data, error } = await profiles.update(state.user.id, updates)

    if (error) {
      console.error('Erro ao atualizar perfil:', error)
      return { error }
    }

    setState(prev => ({
      ...prev,
      profile: data,
    }))

    return { data, error: null }
  }, [state.user])

  // Recarregar perfil
  const refreshProfile = useCallback(async () => {
    if (!state.user || !state.session?.access_token) return

    const profile = await loadProfile(state.user, state.session.access_token)
    setState(prev => ({ ...prev, profile }))
  }, [state.user, state.session, loadProfile])

  // Criar perfil (legacy)
  const createProfile = useCallback(async (profileData: {
    name: string
    bio?: string
    birth_date: string
    gender: 'male' | 'female' | 'other'
    looking_for: 'male' | 'female' | 'both'
  }) => {
    if (!state.user) {
      return { error: new Error('Usuário não autenticado') }
    }

    const { data, error } = await profiles.create({
      id: state.user.id,
      email: state.user.email || '',
      ...profileData,
    })

    if (error) return { error }

    setState(prev => ({ ...prev, profile: data }))
    return { data, error: null }
  }, [state.user])

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
    createProfile,
    updateProfile,
    updateOnboardingStep,
    refreshProfile,
  }
}
