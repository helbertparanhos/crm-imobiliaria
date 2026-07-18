import { useState } from 'react'
import { UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RoleBadge } from '@/components/shared/badges'
import { useCurrentUser } from '@/lib/dev-session'
import { ROLE_LABELS } from '@/lib/permissions'
import type { Role } from '@/types'

import { useUpdateUser, useUsers } from '../hooks/use-users'
import { InviteUserDialog } from './invite-user-dialog'

/** Aba "Usuários & papéis" — apenas admin/gestor (canManageUsers). */
export function UsersTab() {
  const currentUser = useCurrentUser()
  const { data: users, isLoading } = useUsers()
  const updateUser = useUpdateUser()
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-xl">Usuários e papéis</CardTitle>
          <CardDescription>
            Gerencie quem acessa a organização e o papel de cada pessoa.
          </CardDescription>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus />
          Convidar usuário
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading || !users ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead className="w-[120px]">Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === currentUser.id
                const roleLocked = isSelf || u.papel === 'admin'
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.nome}
                      {isSelf ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (você)
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      {roleLocked ? (
                        <RoleBadge role={u.papel} />
                      ) : (
                        <Select
                          value={u.papel}
                          onValueChange={(value) =>
                            updateUser.mutate({
                              id: u.id,
                              patch: { papel: value as Role },
                            })
                          }
                        >
                          <SelectTrigger className="h-9 w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gestor">
                              {ROLE_LABELS.gestor}
                            </SelectItem>
                            <SelectItem value="corretor">
                              {ROLE_LABELS.corretor}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={u.ativo}
                        disabled={isSelf}
                        aria-label={`Ativar ${u.nome}`}
                        onCheckedChange={(checked) =>
                          updateUser.mutate({
                            id: u.id,
                            patch: { ativo: checked },
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </Card>
  )
}
