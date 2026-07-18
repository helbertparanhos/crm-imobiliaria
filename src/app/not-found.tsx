import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-muted-foreground">Erro 404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Página não encontrada
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A página que você procura não existe ou foi movida.
      </p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.dashboard}>Voltar ao Dashboard</Link>
      </Button>
    </div>
  )
}
