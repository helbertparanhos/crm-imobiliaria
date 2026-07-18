import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/format'
import { useCurrentUser } from '@/lib/dev-session'
import { isAdmin } from '@/lib/permissions'

import { useOrg, useUpdateOrg } from '../hooks/use-org'
import { accountSchema, type AccountFormValues } from '../types'

/** Aba "Conta" — Admin edita o nome da organização; demais papéis só leem. */
export function AccountTab() {
  const user = useCurrentUser()
  const canEdit = isAdmin(user)
  const { data: org, isLoading } = useOrg()
  const updateOrg = useUpdateOrg()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { nome: '' },
  })

  useEffect(() => {
    if (org) reset({ nome: org.nome })
  }, [org, reset])

  const onSubmit = handleSubmit((values) => {
    updateOrg.mutate(values, { onSuccess: () => reset(values) })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Conta</CardTitle>
        <CardDescription>
          {canEdit
            ? 'Dados da organização. Alterações valem para todos os usuários.'
            : 'Dados da organização (somente leitura). Apenas o administrador pode editar.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !org ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <form onSubmit={onSubmit} className="grid max-w-lg gap-4">
            <div className="grid gap-2">
              <Label htmlFor="org-nome">Nome da organização</Label>
              <Input id="org-nome" {...register('nome')} disabled={!canEdit} />
              {errors.nome ? (
                <p className="text-sm text-destructive">{errors.nome.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label>Criada em</Label>
              <p className="text-sm text-muted-foreground">
                {formatDate(org.criadoEm)}
              </p>
            </div>
            {canEdit ? (
              <div>
                <Button
                  type="submit"
                  disabled={!isDirty || updateOrg.isPending}
                >
                  Salvar alterações
                </Button>
              </div>
            ) : null}
          </form>
        )}
      </CardContent>
    </Card>
  )
}
