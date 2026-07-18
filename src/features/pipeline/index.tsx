import { useState } from 'react'
import { Plus } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'

import { Board } from './components/board'
import { NewLeadDialog } from './components/new-lead-dialog'

export default function PipelinePage() {
  const [newLeadOpen, setNewLeadOpen] = useState(false)

  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Funil kanban de leads. Arraste os cards entre as etapas."
        actions={
          <Button onClick={() => setNewLeadOpen(true)}>
            <Plus />
            Novo lead
          </Button>
        }
      />
      <Board />
      <NewLeadDialog open={newLeadOpen} onOpenChange={setNewLeadOpen} />
    </>
  )
}
