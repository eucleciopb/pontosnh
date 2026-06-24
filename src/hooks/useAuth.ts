import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { StaffProfile } from '@/types/database'

interface AuthState {
  session: Session | null
  user: User | null
  profile: StaffProfile | null
  isLoading: boolean
  isStaff: boolean
}

async function fetchAuthState(): Promise<Omit<AuthState, 'isLoading'>> {
  if (!isSupabaseConfigured) {
    return { session: null, user: null, profile: null, isStaff: false }
  }

  const client = getSupabase()
  const {
    data: { session },
  } = await client.auth.getSession()

  if (!session?.user) {
    return { session: null, user: null, profile: null, isStaff: false }
  }

  const { data: profile } = await client
    .from('staff_profiles')
    .select('*')
    .eq('id', session.user.id)
    .eq('is_active', true)
    .maybeSingle()

  return {
    session,
    user: session.user,
    profile,
    isStaff: Boolean(profile),
  }
}

export function useAuth() {
  const queryClient = useQueryClient()
  const [initialized, setInitialized] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: fetchAuthState,
    staleTime: 1000 * 60 * 5,
    enabled: isSupabaseConfigured,
  })

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setInitialized(true)
      return
    }

    const client = getSupabase()
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: ['auth'] })
    })

    setInitialized(true)
    return () => subscription.unsubscribe()
  }, [queryClient])

  const signIn = async (email: string, password: string) => {
    const client = getSupabase()
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: ['auth'] })
  }

  const signOut = async () => {
    const client = getSupabase()
    const { error } = await client.auth.signOut()
    if (error) throw error
    await queryClient.invalidateQueries({ queryKey: ['auth'] })
  }

  return {
    session: data?.session ?? null,
    user: data?.user ?? null,
    profile: data?.profile ?? null,
    isStaff: data?.isStaff ?? false,
    isLoading: isLoading || !initialized,
    signIn,
    signOut,
  }
}
