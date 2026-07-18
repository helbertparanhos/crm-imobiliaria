import { CreditCard, KeyRound, Network } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const ITEMS = [
  {
    icon: CreditCard,
    title: 'Cobrança e plano',
    description:
      'Assinatura, faturas e limites de uso da conta. Exclusivo do administrador.',
  },
  {
    icon: KeyRound,
    title: 'Chaves de integração',
    description:
      'Tokens de API e webhooks para integrações externas. Exclusivo do administrador.',
  },
  {
    icon: Network,
    title: 'Acesso entre contas',
    description:
      'Compartilhamento e permissões cross-conta da organização. Exclusivo do administrador.',
  },
] as const

/** Aba "Avançado" — apenas Admin. Placeholder (sem implementação real na Fase 1). */
export function AdvancedTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Avançado</CardTitle>
        <CardDescription>
          Configurações críticas exclusivas do administrador. A implementação
          chega em fases futuras.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-2 rounded-lg border border-dashed p-4"
          >
            <item.icon className="h-5 w-5 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
