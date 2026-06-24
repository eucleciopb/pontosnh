import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase/client'

export interface SupabaseHealthStatus {
  configured: boolean
  connected: boolean
  levelsCount?: number
  error?: string
}

async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      connected: false,
      error: 'Variáveis de ambiente não configuradas',
    }
  }

  try {
    const client = getSupabase()
    const { count, error } = await client
      .from('levels')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return {
        configured: true,
        connected: false,
        error: error.message,
      }
    }

    return {
      configured: true,
      connected: true,
      levelsCount: count ?? 0,
    }
  } catch (err) {
    return {
      configured: true,
      connected: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    }
  }
}

export function useSupabaseHealth() {
  return useQuery({
    queryKey: ['supabase-health'],
    queryFn: checkSupabaseHealth,
    staleTime: 1000 * 30,
  })
}
