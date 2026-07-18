/** Hooks de metadados da feature Contatos (dados de apoio ao formulário/tabela). */
import { useQuery } from '@tanstack/react-query'

import { listCustomFieldDefs, listOrgUsers, listStages } from '../repo'

/** Etapas do funil (para exibir a etapa dos leads no detalhe). */
export function useStages() {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: () => listStages(),
  })
}

/** Usuários da organização (responsáveis). */
export function useOrgUsers() {
  return useQuery({
    queryKey: ['org-users'],
    queryFn: () => listOrgUsers(),
  })
}

/** Definições de campos personalizados de contato. */
export function useCustomFieldDefs() {
  return useQuery({
    queryKey: ['contact-custom-field-defs'],
    queryFn: () => listCustomFieldDefs(),
  })
}
