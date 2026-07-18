/** Formatadores pt-BR (moeda, datas). Ver CLAUDE.md: datas com date-fns. */
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

/** R$ 650.000 */
export function formatBRL(value: number): string {
  return brl.format(value)
}

/** 12.345 (número pt-BR). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/** 18/07/2026 */
export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), 'dd/MM/yyyy', { locale: ptBR })
}

/** 18/07/2026 às 14:30 */
export function formatDateTime(isoDate: string): string {
  return format(parseISO(isoDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

/** "há 3 dias" */
export function fromNow(isoDate: string): string {
  return formatDistanceToNow(parseISO(isoDate), { addSuffix: true, locale: ptBR })
}

/** Valor de input date (yyyy-MM-dd) a partir de ISO, ou '' se nulo. */
export function toDateInputValue(isoDate: string | null): string {
  if (!isoDate) return ''
  return format(parseISO(isoDate), 'yyyy-MM-dd')
}
