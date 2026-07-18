import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchInput } from '@/components/shared/search-input'
import { ORIGIN_OPTIONS } from '@/lib/constants'
import type { Profile } from '@/types'

import type { ContactFilters } from '../types'
import { ALL } from '../types'

interface ContactsFiltersProps {
  filters: ContactFilters
  onChange: (filters: ContactFilters) => void
  /** Usuários para o filtro de responsável (só admin/gestor recebem). */
  owners: Profile[]
  /** Exibe o filtro de responsável (admin/gestor). */
  showOwnerFilter: boolean
  /** Tags disponíveis nos contatos visíveis. */
  tags: string[]
}

export function ContactsFilters({
  filters,
  onChange,
  owners,
  showOwnerFilter,
  tags,
}: ContactsFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
        placeholder="Buscar por nome, e-mail ou telefone"
        className="sm:w-72"
      />

      {showOwnerFilter ? (
        <Select
          value={filters.ownerId}
          onValueChange={(ownerId) => onChange({ ...filters, ownerId })}
        >
          <SelectTrigger className="sm:w-48" aria-label="Filtrar por responsável">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os responsáveis</SelectItem>
            {owners.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Select
        value={filters.origem}
        onValueChange={(origem) =>
          onChange({ ...filters, origem: origem as ContactFilters['origem'] })
        }
      >
        <SelectTrigger className="sm:w-44" aria-label="Filtrar por origem">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as origens</SelectItem>
          {ORIGIN_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tag}
        onValueChange={(tag) => onChange({ ...filters, tag })}
      >
        <SelectTrigger className="sm:w-44" aria-label="Filtrar por tag">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
