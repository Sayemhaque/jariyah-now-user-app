import { useCallback, useEffect, useState } from 'react'
import { disconnectTikTok, fetchCreator, TikTokClientError, tiktokAuthKey } from '@/lib/tiktok/client'
import type { CreatorInfo } from '@/lib/tiktok/rules'

export type ConnectionStatus = 'loading' | 'disconnected' | 'ready' | 'blocked' | 'unavailable'

interface ConnectionState {
  status: ConnectionStatus
  creator: CreatorInfo | null
  message: string | null
}

const statusFor = (code: string): ConnectionStatus =>
  code === 'not_connected' ? 'disconnected' : code === 'not_configured' ? 'unavailable' : 'blocked'

export function useTikTokConnection(open: boolean) {
  const [state, setState] = useState<ConnectionState>({ status: 'loading', creator: null, message: null })

  const refresh = useCallback(async () => {
    try {
      setState({ status: 'ready', creator: await fetchCreator(), message: null })
    } catch (error) {
      const code = error instanceof TikTokClientError ? error.code : 'unknown'
      setState({ status: statusFor(code), creator: null, message: error instanceof Error ? error.message : null })
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const firstLoad = setTimeout(refresh, 0)
    const onStorage = (event: StorageEvent) => event.key === tiktokAuthKey && refresh()
    window.addEventListener('storage', onStorage)
    return () => {
      clearTimeout(firstLoad)
      window.removeEventListener('storage', onStorage)
    }
  }, [open, refresh])

  const connect = () => {
    const popup = window.open('/api/tiktok/login', 'tiktok-login', 'width=520,height=760')
    if (!popup) window.location.href = '/api/tiktok/login'
  }

  const disconnect = async () => {
    await disconnectTikTok().catch(() => undefined)
    setState({ status: 'disconnected', creator: null, message: null })
  }

  return { ...state, connect, disconnect, refresh }
}
