import { Navigate, Outlet } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { signOut, useAuthStatus, useAuthStore } from '@/lib/auth'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
    </div>
  )
}

/** E-mail autenticado sem perfil no CRM (ver profile-bridge / Fase 3). */
function NoProfileScreen() {
  const email = useAuthStore((s) => s.session?.user.email)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <ShieldAlert className="h-8 w-8 text-amber-500" aria-hidden />
      <h1 className="text-lg font-semibold">Conta sem perfil no CRM</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        O e-mail <span className="font-medium">{email}</span> autenticou, mas não tem
        um perfil associado. Nesta fase (2), use um dos usuários de exemplo
        (ana@, gustavo@, carla@, caio@horizonte.com.br). Os perfis reais entram na Fase 3.
      </p>
      <Button variant="outline" onClick={() => void signOut()}>
        Sair
      </Button>
    </div>
  )
}

/** Protege as rotas do app: sem sessão → login; sem perfil → aviso. */
export function RequireAuth() {
  const status = useAuthStatus()

  if (status === 'loading') return <FullScreenLoader />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  if (status === 'no-profile') return <NoProfileScreen />
  return <Outlet />
}
