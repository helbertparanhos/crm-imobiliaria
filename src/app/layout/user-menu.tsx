import { LogOut } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrentUser, signOut } from '@/lib/auth'
import { ROLE_LABELS } from '@/lib/permissions'

/** Menu do usuário logado (nome, papel e logout). Substitui o seletor de dev da Fase 1. */
export function UserMenu() {
  const user = useCurrentUser()

  const initials = user.nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md border bg-background p-2 text-left text-sm transition-colors hover:bg-muted"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{user.nome}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {ROLE_LABELS[user.papel]}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
