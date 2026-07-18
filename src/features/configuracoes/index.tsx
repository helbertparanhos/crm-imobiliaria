import { PageHeader } from '@/components/shared/page-header'
import { PhasePlaceholder } from '@/components/shared/phase-placeholder'

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Conta, usuários e papéis, campos personalizados e etapas do funil."
      />
      <PhasePlaceholder />
    </>
  )
}
