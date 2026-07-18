import { PageHeader } from '@/components/shared/page-header'
import { PhasePlaceholder } from '@/components/shared/phase-placeholder'

export default function PipelinePage() {
  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Funil kanban de leads, com etapas configuráveis e arrastar-e-soltar."
      />
      <PhasePlaceholder />
    </>
  )
}
