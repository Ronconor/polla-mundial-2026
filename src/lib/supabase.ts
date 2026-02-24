import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
    id: string
    nickname: string
    email: string
    phone?: string
    location?: string
    role: 'admin' | 'user'
    created_at: string
}

export type Community = {
    id: string
    name: string
    admin_id: string
    created_at: string
}

export type Match = {
    id: string
    community_id: string
    local_team: string
    visitor_team: string
    match_date: string
    phase: string
    local_score?: number
    visitor_score?: number
    status: 'scheduled' | 'finished'
}
