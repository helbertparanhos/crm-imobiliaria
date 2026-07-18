import { createBrowserRouter } from 'react-router-dom'

import { AppShell } from './layout/app-shell'
import { NotFound } from './not-found'
import { LoginPage } from './auth/login-page'
import { RequireAuth } from './auth/require-auth'
import { ROUTES } from '@/lib/constants'

import DashboardPage from '@/features/dashboard'
import ContatosPage from '@/features/contatos'
import PipelinePage from '@/features/pipeline'
import TarefasPage from '@/features/tarefas'
import ConfiguracoesPage from '@/features/configuracoes'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: ROUTES.contatos.slice(1), element: <ContatosPage /> },
          { path: ROUTES.pipeline.slice(1), element: <PipelinePage /> },
          { path: ROUTES.tarefas.slice(1), element: <TarefasPage /> },
          { path: ROUTES.configuracoes.slice(1), element: <ConfiguracoesPage /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])
