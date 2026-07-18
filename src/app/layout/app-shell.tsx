import { Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'

import { APP_NAME } from '@/lib/constants'
import { Sidebar } from './sidebar'

/** Shell da aplicação: navegação lateral (desktop) + área de conteúdo com <Outlet />. */
export function AppShell() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabeçalho para telas pequenas (sidebar fica oculta em mobile) */}
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <Building2 className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-semibold">{APP_NAME}</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
