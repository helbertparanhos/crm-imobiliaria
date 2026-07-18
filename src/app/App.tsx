import { RouterProvider } from 'react-router-dom'

import { Toaster } from '@/components/ui/sonner'
import { AppProviders } from './providers'
import { router } from './router'

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AppProviders>
  )
}
