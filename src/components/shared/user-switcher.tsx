import { Check, ChevronsUpDown, FlaskConical } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/permissions'
import { availableUsers, useCurrentUser, useSessionStore } from '@/lib/dev-session'

/**
 * Seletor de usuário de DESENVOLVIMENTO (SPEC §10 / Fase 1).
 * Troca o "usuário logado" para validar as visões por papel na UI.
 * Some na Fase 2, quando entra a Supabase Auth real.
 */
export function UserSwitcher() {
  const current = useCurrentUser()
  const setCurrentUserId = useSessionStore((s) => s.setCurrentUserId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md border bg-background p-2 text-left text-sm transition-colors hover:bg-muted"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {current.nome
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{current.nome}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {ROLE_LABELS[current.papel]}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden />
          Usuário de teste (Fase 1)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableUsers.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onSelect={() => setCurrentUserId(user.id)}
            className="flex items-center gap-2"
          >
            <Check
              className={cn(
                'h-4 w-4',
                user.id === current.id ? 'opacity-100' : 'opacity-0',
              )}
            />
            <span className="min-w-0 flex-1 truncate">{user.nome}</span>
            <Badge variant="outline" className="text-[10px]">
              {ROLE_LABELS[user.papel]}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
