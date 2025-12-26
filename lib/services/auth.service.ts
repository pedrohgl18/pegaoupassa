import { supabase, isNative } from './supabase.client'

// ============================================
// AUTH HELPERS
// ============================================

export const auth = {
    // Login com Google
    signInWithGoogle: async () => {
        // No app nativo, usar custom scheme para redirect
        // IMPORTANTE: A URL deve terminar com / ou /callback para funcionar corretamente
        const redirectUrl = isNative
            ? 'com.pegaoupassa.app://callback/'
            : window.location.origin + '/auth/callback'

        console.log('=== SIGN IN WITH GOOGLE ===')
        console.log('isNative:', isNative)
        console.log('redirectUrl:', redirectUrl)

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account',
                },
                skipBrowserRedirect: isNative, // No nativo, abrimos manualmente
            },
        })

        console.log('signInWithOAuth resultado:')
        console.log('- url:', data?.url)
        console.log('- error:', error)

        // No app nativo, abrir o browser manualmente
        if (isNative && data?.url) {
            console.log('Abrindo browser com URL:', data.url)
            const { Browser } = await import('@capacitor/browser')
            await Browser.open({
                url: data.url,
                presentationStyle: 'popover', // Melhor UX no Android
            })
        }

        return { data, error }
    },

    // Logout
    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    // Pegar sessão atual
    getSession: async () => {
        const { data, error } = await supabase.auth.getSession()
        return { session: data.session, error }
    },

    // Pegar usuário atual
    getUser: async () => {
        const { data, error } = await supabase.auth.getUser()
        return { user: data.user, error }
    },

    // Listener para mudanças de auth
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
        return supabase.auth.onAuthStateChange(callback)
    },
}
