import { PageHeader } from '@/components/shared/page-header'
import { PhasePlaceholder } from '@/components/shared/phase-placeholder'

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Métricas de leads, etapas do funil e tarefas."
      />
      <PhasePlaceholder />
    </>
  )
}
