'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BuilderProvider } from '@/lib/store'
import { ContentProvider } from '@/lib/contentStore'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <BuilderProvider>
        <ContentProvider>{children}</ContentProvider>
      </BuilderProvider>
    </QueryClientProvider>
  )
}
