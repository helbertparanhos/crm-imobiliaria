import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
      <Icon className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
