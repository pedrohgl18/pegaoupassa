import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

// Detectar se está rodando no app nativo
export const isNative = Capacitor.isNativePlatform()

const capacitorStorageAdapter = {
    getItem: async (key: string) => {
        try {
            const { value } = await Preferences.get({ key })
            return value
        } catch (e) {
            return null
        }
    },
    setItem: async (key: string, value: string) => {
        try {
            await Preferences.set({ key, value })
        } catch (e) {
        }
    },
    removeItem: async (key: string) => {
        try {
            await Preferences.remove({ key })
        } catch (e) {
        }
    },
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: !isNative, // Desabilitar no nativo pois usamos deep links
        flowType: isNative ? 'implicit' : 'pkce', // Usar implicit no nativo para evitar problemas com PKCE
        storage: capacitorStorageAdapter,
    },
})
