# src/features — uma pasta por tela

Cada feature é autocontida:

  <feature>/
    components/   # componentes só desta feature
    hooks/        # hooks (TanStack Query) que chamam o repo
    repo.ts       # funções de dados (mock na Fase 1, Supabase na Fase 3)
    types.ts      # tipos locais da feature
    index.tsx     # entrada/rota da tela

Não importe componentes internos de uma feature em outra: o compartilhável sobe para
`src/components/shared`. Ver `docs/SPEC.md` §3 e §4.
