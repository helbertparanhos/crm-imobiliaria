import { PageHeader } from '@/components/shared/page-header'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useCurrentUser } from '@/lib/auth'
import {
  canConfigure,
  canManageCriticalSettings,
  canManageUsers,
} from '@/lib/permissions'

import { AccountTab } from './components/account-tab'
import { AdvancedTab } from './components/advanced-tab'
import { CustomFieldsTab } from './components/custom-fields-tab'
import { PermissionNotice } from './components/permission-notice'
import { ProfileTab } from './components/profile-tab'
import { StagesTab } from './components/stages-tab'
import { UsersTab } from './components/users-tab'

export default function ConfiguracoesPage() {
  const user = useCurrentUser()

  const showUsers = canManageUsers(user)
  const showConfig = canConfigure(user)
  const showAdvanced = canManageCriticalSettings(user)

  const tabs: { value: string; label: string; visible: boolean }[] = [
    { value: 'perfil', label: 'Meu perfil', visible: true },
    { value: 'conta', label: 'Conta', visible: true },
    { value: 'usuarios', label: 'Usuários & papéis', visible: showUsers },
    { value: 'campos', label: 'Campos personalizados', visible: showConfig },
    { value: 'etapas', label: 'Etapas do funil', visible: showConfig },
    { value: 'avancado', label: 'Avançado', visible: showAdvanced },
  ]

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Conta, usuários e papéis, campos personalizados e etapas do funil."
      />

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start">
          {tabs
            .filter((t) => t.visible)
            .map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
        </TabsList>

        <TabsContent value="perfil">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="conta">
          <AccountTab />
        </TabsContent>

        <TabsContent value="usuarios">
          {showUsers ? <UsersTab /> : <PermissionNotice />}
        </TabsContent>

        <TabsContent value="campos">
          {showConfig ? <CustomFieldsTab /> : <PermissionNotice />}
        </TabsContent>

        <TabsContent value="etapas">
          {showConfig ? <StagesTab /> : <PermissionNotice />}
        </TabsContent>

        <TabsContent value="avancado">
          {showAdvanced ? <AdvancedTab /> : <PermissionNotice />}
        </TabsContent>
      </Tabs>
    </>
  )
}
