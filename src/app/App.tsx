import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'

import { Toaster } from '@/components/ui/sonner'
import { initAuth } from '@/lib/auth'
import { AppProviders } from './providers'
import { router } from './router'

export function App() {
  // Inicializa a sessão do Supabase Auth uma vez (idempotente).
  useEffect(() => {
    initAuth()
  }, [])

  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AppProviders>
  )
}
