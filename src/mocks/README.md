# src/mocks — dados falsos (Fase 1)

Fixtures em memória que alimentam a camada de dados enquanto não há backend.
Arquivos previstos (o Cursor cria na Fase 1): `users.ts`, `contacts.ts`, `leads.ts`,
`stages.ts`, `tasks.ts`, `customFields.ts`.

Regra: os mocks devem ter o MESMO formato dos tipos em `src/types`, para que a troca
para Supabase (Fase 3) não exija mudar componentes. Inclua dados de 1 admin, 1 gestor
e 2 corretores para validar visibilidade por papel.
