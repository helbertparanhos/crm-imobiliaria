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
import { RoleBadge } from '@/components/shared/badges'
import { useCurrentUser } from '@/lib/auth'

import { useUpdateProfile } from '../hooks/use-users'
import { profileSchema, type ProfileFormValues } from '../types'

/** Aba "Meu perfil" — visível a todos; edita nome/e-mail do usuário atual. */
export function ProfileTab() {
  const user = useCurrentUser()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nome: user.nome, email: user.email },
  })

  useEffect(() => {
    reset({ nome: user.nome, email: user.email })
  }, [user.id, user.nome, user.email, reset])

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(values, { onSuccess: () => reset(values) })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Meu perfil</CardTitle>
        <CardDescription>
          Atualize seus dados pessoais. Seu papel atual é{' '}
          <RoleBadge role={user.papel} />.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid max-w-lg gap-4">
          <div className="grid gap-2">
            <Label htmlFor="profile-nome">Nome</Label>
            <Input id="profile-nome" {...register('nome')} />
            {errors.nome ? (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-email">E-mail</Label>
            <Input id="profile-email" type="email" {...register('email')} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
