import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { LeadStatusBadge, StageBadge } from '@/components/shared/badges'
import { formatBRL, formatDateTime } from '@/lib/format'

import { useLead } from '../hooks/use-lead'

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

/** Dialog de leitura do lead (contato, valor, etapa, status, datas). */
export function LeadDetailDialog({
  leadId,
  onOpenChange,
}: {
  leadId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const { data, isLoading } = useLead(leadId)

  return (
    <Dialog open={leadId !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data?.titulo ?? 'Detalhe do lead'}</DialogTitle>
          <DialogDescription>Informações do lead no funil.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Carregando…</p>
        ) : !data ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Lead não encontrado.
          </p>
        ) : (
          <div className="divide-y">
            <Row label="Contato">{data.contatoNome}</Row>
            <Row label="Valor estimado">{formatBRL(data.valorEstimado)}</Row>
            <Row label="Etapa atual">
              {data.stage ? <StageBadge stage={data.stage} /> : '—'}
            </Row>
            <Row label="Status">
              <LeadStatusBadge status={data.status} />
            </Row>
            <Row label="Responsável">{data.responsavelNome}</Row>
            <Separator className="my-1" />
            <Row label="Criado em">{formatDateTime(data.criadoEm)}</Row>
            <Row label="Atualizado em">{formatDateTime(data.atualizadoEm)}</Row>
            <Row label="Fechado em">
              {data.fechadoEm ? formatDateTime(data.fechadoEm) : '—'}
            </Row>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
