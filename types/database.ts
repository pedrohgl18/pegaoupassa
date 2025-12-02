// Types gerados a partir do schema do Supabase
// Baseado nas tabelas definidas em tabelas.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          bio: string | null
          birth_date: string | null
          gender: 'male' | 'female' | 'other' | null
          looking_for: 'male' | 'female' | 'both' | null
          latitude: number | null
          longitude: number | null
          city: string | null
          state: string | null
          profession: string | null
          height: number | null
          education: string | null
          is_vip: boolean
          vip_expires_at: string | null
          is_verified: boolean
          is_active: boolean
          onboarding_step: number
          onboarding_completed: boolean
          filter_min_age: number
          filter_max_age: number
          filter_max_distance: number
          daily_likes_count: number
          daily_likes_reset_at: string
          last_online_at: string
          created_at: string
          updated_at: string
          is_incognito: boolean
          read_receipts_enabled: boolean
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          bio?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          looking_for?: 'male' | 'female' | 'both' | null
          latitude?: number | null
          longitude?: number | null
          city?: string | null
          state?: string | null
          profession?: string | null
          height?: number | null
          education?: string | null
          is_vip?: boolean
          vip_expires_at?: string | null
          is_verified?: boolean
          is_active?: boolean
          onboarding_step?: number
          onboarding_completed?: boolean
          filter_min_age?: number
          filter_max_age?: number
          filter_max_distance?: number
          daily_likes_count?: number
          daily_likes_reset_at?: string
          last_online_at?: string
          created_at?: string
          updated_at?: string
          is_incognito?: boolean
          read_receipts_enabled?: boolean
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          bio?: string | null
          birth_date?: string | null
          gender?: 'male' | 'female' | 'other' | null
          looking_for?: 'male' | 'female' | 'both' | null
          latitude?: number | null
          longitude?: number | null
          city?: string | null
          state?: string | null
          profession?: string | null
          height?: number | null
          education?: string | null
          is_vip?: boolean
          vip_expires_at?: string | null
          is_verified?: boolean
          is_active?: boolean
          onboarding_step?: number
          onboarding_completed?: boolean
          filter_min_age?: number
          filter_max_age?: number
          filter_max_distance?: number
          daily_likes_count?: number
          daily_likes_reset_at?: string
          last_online_at?: string
          created_at?: string
          updated_at?: string
          is_incognito?: boolean
          read_receipts_enabled?: boolean
        }
      }
      photos: {
        Row: {
          id: string
          user_id: string
          url: string
          position: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          position: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          position?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      interests: {
        Row: {
          id: string
          name: string
          emoji: string | null
          category: string | null
        }
        Insert: {
          id?: string
          name: string
          emoji?: string | null
          category?: string | null
        }
        Update: {
          id?: string
          name?: string
          emoji?: string | null
          category?: string | null
        }
      }
      user_interests: {
        Row: {
          id: string
          user_id: string
          interest_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interest_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interest_id?: string
          created_at?: string
        }
      }
      swipes: {
        Row: {
          id: string
          swiper_id: string
          swiped_id: string
          action: 'like' | 'pass' | 'super_like'
          created_at: string
        }
        Insert: {
          id?: string
          swiper_id: string
          swiped_id: string
          action: 'like' | 'pass' | 'super_like'
          created_at?: string
        }
        Update: {
          id?: string
          swiper_id?: string
          swiped_id?: string
          action?: 'like' | 'pass' | 'super_like'
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          match_id: string
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          last_message_at?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          media_url: string | null
          media_type: 'image' | 'audio' | 'gif' | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          media_url?: string | null
          media_type?: 'image' | 'audio' | 'gif' | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string | null
          media_url?: string | null
          media_type?: 'image' | 'audio' | 'gif' | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          reason: 'fake_profile' | 'inappropriate_photos' | 'harassment' | 'spam' | 'underage' | 'other'
          description: string | null
          status: 'pending' | 'reviewed' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          reason: 'fake_profile' | 'inappropriate_photos' | 'harassment' | 'spam' | 'underage' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          reason?: 'fake_profile' | 'inappropriate_photos' | 'harassment' | 'spam' | 'underage' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age: {
        Args: { birth_date: string }
        Returns: number
      }
      increment_like_count: {
        Args: { user_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos úteis derivados
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Photo = Database['public']['Tables']['photos']['Row']
export type Interest = Database['public']['Tables']['interests']['Row']
export type Swipe = Database['public']['Tables']['swipes']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

// Tipos com relacionamentos
export type ProfileWithPhotos = Profile & {
  photos: Photo[]
}

export type ProfileWithAll = Profile & {
  photos: Photo[]
  user_interests: {
    interest: Interest
  }[]
}

export type MatchWithProfiles = Match & {
  user1: ProfileWithPhotos
  user2: ProfileWithPhotos
  conversation: Conversation | null
}

export type MessageWithSender = Message & {
  sender: {
    name: string
    photos: { url: string }[]
  }
}
