import { NavLink } from 'react-router-dom'
import {
  Building2,
  CheckSquare,
  KanbanSquare,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { UserMenu } from './user-menu'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** `end` para casar exatamente a rota raiz (Dashboard). */
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: ROUTES.contatos, label: 'Contatos', icon: Users },
  { to: ROUTES.pipeline, label: 'Pipeline', icon: KanbanSquare },
  { to: ROUTES.tarefas, label: 'Tarefas', icon: CheckSquare },
  { to: ROUTES.configuracoes, label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Building2 className="h-5 w-5 text-primary" aria-hidden />
        <span className="font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <UserMenu />
      </div>
    </aside>
  )
}
