import { PageHeader } from '@/components/shared/page-header'
import { PhasePlaceholder } from '@/components/shared/phase-placeholder'

export default function TarefasPage() {
  return (
    <>
      <PageHeader
        title="Tarefas"
        description="Lista e timeline de tarefas vinculadas a contatos, por prioridade e prazo."
      />
      <PhasePlaceholder />
    </>
  )
}
