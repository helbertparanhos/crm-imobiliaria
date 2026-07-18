import { ShieldAlert } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'

interface PermissionNoticeProps {
  description?: string
}

/** Aviso exibido quando o papel atual não pode acessar uma configuração. */
export function PermissionNotice({ description }: PermissionNoticeProps) {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="Acesso restrito"
      description={
        description ??
        'Seu papel não tem permissão para acessar esta configuração.'
      }
    />
  )
}
