import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { APP_NAME } from '@/lib/constants'
import { signIn, useAuthStatus } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

type LoginValues = z.infer<typeof loginSchema>

/** Traduz os erros mais comuns do Supabase Auth para pt-BR. */
function mensagemErro(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.'
  if (/email not confirmed/i.test(message)) return 'E-mail ainda não confirmado.'
  if (/rate limit/i.test(message)) return 'Muitas tentativas. Aguarde um instante.'
  return 'Não foi possível entrar. Tente novamente.'
}

export function LoginPage() {
  const status = useAuthStatus()
  const [erro, setErro] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  // Já autenticado → manda para o app.
  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  async function onSubmit(values: LoginValues) {
    setErro(null)
    try {
      await signIn(values.email, values.password)
    } catch (e) {
      setErro(mensagemErro(e instanceof Error ? e.message : ''))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <CardTitle className="text-xl">{APP_NAME}</CardTitle>
          <CardDescription>Entre com seu e-mail e senha.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@imobiliaria.com.br"
                {...register('email')}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            {erro ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {erro}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
