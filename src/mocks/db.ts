/**
 * "Banco de dados" em memória da Fase 1 (SPEC §4).
 * Arrays mutáveis, semeados uma vez por carga de página. Os `repo.ts` de cada
 * feature leem/escrevem aqui e aplicam o escopo por papel (lib/permissions),
 * espelhando o que a RLS fará no Postgres na Fase 3.
 */
import { addDays, subDays } from 'date-fns'
import type {
  Contact,
  CustomFieldDef,
  Lead,
  Organization,
  PipelineStage,
  Profile,
  Task,
} from '@/types'

const now = new Date()
const iso = (d: Date) => d.toISOString()
const daysFromNow = (n: number) => iso(n >= 0 ? addDays(now, n) : subDays(now, -n))

// --- IDs estáveis do seed -------------------------------------------------
export const ORG_ID = 'org-horizonte'

export const USERS = {
  admin: 'u-admin',
  gestor: 'u-gestor',
  corretor1: 'u-carla',
  corretor2: 'u-caio',
} as const

const STAGE = {
  novo: 'stage-novo',
  contato: 'stage-contato',
  visita: 'stage-visita',
  proposta: 'stage-proposta',
  fechado: 'stage-fechado',
  perdido: 'stage-perdido',
} as const

// --- Organização ----------------------------------------------------------
export const organizations: Organization[] = [
  { id: ORG_ID, nome: 'Imobiliária Horizonte', criadoEm: daysFromNow(-320) },
]

// --- Perfis (usuários) ----------------------------------------------------
export const profiles: Profile[] = [
  { id: USERS.admin, organizationId: ORG_ID, nome: 'Ana Admin', email: 'ana@horizonte.com.br', papel: 'admin', ativo: true, criadoEm: daysFromNow(-320) },
  { id: USERS.gestor, organizationId: ORG_ID, nome: 'Gustavo Gestor', email: 'gustavo@horizonte.com.br', papel: 'gestor', ativo: true, criadoEm: daysFromNow(-300) },
  { id: USERS.corretor1, organizationId: ORG_ID, nome: 'Carla Corretora', email: 'carla@horizonte.com.br', papel: 'corretor', ativo: true, criadoEm: daysFromNow(-260) },
  { id: USERS.corretor2, organizationId: ORG_ID, nome: 'Caio Corretor', email: 'caio@horizonte.com.br', papel: 'corretor', ativo: true, criadoEm: daysFromNow(-180) },
]

// --- Etapas do funil ------------------------------------------------------
export const pipelineStages: PipelineStage[] = [
  { id: STAGE.novo, organizationId: ORG_ID, nome: 'Novo', ordem: 1, cor: '#64748b', isGanho: false, isPerdido: false },
  { id: STAGE.contato, organizationId: ORG_ID, nome: 'Contato feito', ordem: 2, cor: '#0ea5e9', isGanho: false, isPerdido: false },
  { id: STAGE.visita, organizationId: ORG_ID, nome: 'Visita', ordem: 3, cor: '#6366f1', isGanho: false, isPerdido: false },
  { id: STAGE.proposta, organizationId: ORG_ID, nome: 'Proposta', ordem: 4, cor: '#f59e0b', isGanho: false, isPerdido: false },
  { id: STAGE.fechado, organizationId: ORG_ID, nome: 'Fechado', ordem: 5, cor: '#22c55e', isGanho: true, isPerdido: false },
  { id: STAGE.perdido, organizationId: ORG_ID, nome: 'Perdido', ordem: 6, cor: '#ef4444', isGanho: false, isPerdido: true },
]

// --- Definições de campos personalizados de contato -----------------------
export const customFieldDefs: CustomFieldDef[] = [
  { id: 'cf-tipo', organizationId: ORG_ID, entidade: 'contact', chave: 'tipo_imovel', label: 'Tipo de imóvel', tipo: 'select', opcoes: ['Apartamento', 'Casa', 'Terreno', 'Comercial'], ordem: 1 },
  { id: 'cf-interesse', organizationId: ORG_ID, entidade: 'contact', chave: 'interesse', label: 'Interesse', tipo: 'select', opcoes: ['Compra', 'Aluguel'], ordem: 2 },
  { id: 'cf-orcamento', organizationId: ORG_ID, entidade: 'contact', chave: 'orcamento', label: 'Orçamento (R$)', tipo: 'number', ordem: 3 },
  { id: 'cf-newsletter', organizationId: ORG_ID, entidade: 'contact', chave: 'newsletter', label: 'Aceita newsletter', tipo: 'bool', ordem: 4 },
]

// --- Contatos -------------------------------------------------------------
const base = (owner: string) => ({
  organizationId: ORG_ID,
  ownerId: owner,
  criadoPor: owner,
  atualizadoEm: daysFromNow(-3),
})

export const contacts: Contact[] = [
  { id: 'c-01', ...base(USERS.corretor1), nome: 'Marcos Almeida', telefone: '(11) 98888-1010', email: 'marcos.almeida@email.com', origem: 'site', tags: ['quente'], camposCustomizados: { tipo_imovel: 'Apartamento', interesse: 'Compra', orcamento: 650000, newsletter: true }, criadoEm: daysFromNow(-40) },
  { id: 'c-02', ...base(USERS.corretor1), nome: 'Fernanda Lima', telefone: '(11) 97777-2020', email: 'fernanda.lima@email.com', origem: 'indicacao', tags: ['investidor'], camposCustomizados: { tipo_imovel: 'Comercial', interesse: 'Compra', orcamento: 1200000, newsletter: false }, criadoEm: daysFromNow(-33) },
  { id: 'c-03', ...base(USERS.corretor1), nome: 'Roberto Souza', telefone: '(11) 96666-3030', email: 'roberto.souza@email.com', origem: 'portal', tags: ['morno'], camposCustomizados: { tipo_imovel: 'Casa', interesse: 'Compra', orcamento: 850000, newsletter: true }, criadoEm: daysFromNow(-28) },
  { id: 'c-04', ...base(USERS.corretor1), nome: 'Juliana Prado', telefone: '(11) 95555-4040', email: 'juliana.prado@email.com', origem: 'whatsapp', tags: ['aluguel'], camposCustomizados: { tipo_imovel: 'Apartamento', interesse: 'Aluguel', orcamento: 3500, newsletter: true }, criadoEm: daysFromNow(-21) },
  { id: 'c-05', ...base(USERS.corretor1), nome: 'Pedro Nunes', telefone: '(11) 94444-5050', email: 'pedro.nunes@email.com', origem: 'telefone', tags: ['frio'], camposCustomizados: { tipo_imovel: 'Terreno', interesse: 'Compra', orcamento: 400000, newsletter: false }, criadoEm: daysFromNow(-14) },
  { id: 'c-06', ...base(USERS.corretor2), nome: 'Camila Rocha', telefone: '(21) 98888-6060', email: 'camila.rocha@email.com', origem: 'site', tags: ['quente'], camposCustomizados: { tipo_imovel: 'Apartamento', interesse: 'Compra', orcamento: 720000, newsletter: true }, criadoEm: daysFromNow(-38) },
  { id: 'c-07', ...base(USERS.corretor2), nome: 'Bruno Carvalho', telefone: '(21) 97777-7070', email: 'bruno.carvalho@email.com', origem: 'indicacao', tags: ['investidor', 'quente'], camposCustomizados: { tipo_imovel: 'Comercial', interesse: 'Compra', orcamento: 2100000, newsletter: false }, criadoEm: daysFromNow(-30) },
  { id: 'c-08', ...base(USERS.corretor2), nome: 'Aline Ferreira', telefone: '(21) 96666-8080', email: 'aline.ferreira@email.com', origem: 'portal', tags: ['morno'], camposCustomizados: { tipo_imovel: 'Casa', interesse: 'Aluguel', orcamento: 5000, newsletter: true }, criadoEm: daysFromNow(-24) },
  { id: 'c-09', ...base(USERS.corretor2), nome: 'Diego Martins', telefone: '(21) 95555-9090', email: 'diego.martins@email.com', origem: 'whatsapp', tags: ['frio'], camposCustomizados: { tipo_imovel: 'Apartamento', interesse: 'Compra', orcamento: 560000, newsletter: false }, criadoEm: daysFromNow(-16) },
  { id: 'c-10', ...base(USERS.corretor2), nome: 'Patrícia Gomes', telefone: '(21) 94444-1112', email: 'patricia.gomes@email.com', origem: 'site', tags: ['morno'], camposCustomizados: { tipo_imovel: 'Casa', interesse: 'Compra', orcamento: 980000, newsletter: true }, criadoEm: daysFromNow(-9) },
  { id: 'c-11', ...base(USERS.gestor), nome: 'Ricardo Teixeira', telefone: '(11) 93333-2223', email: 'ricardo.teixeira@email.com', origem: 'indicacao', tags: ['vip'], camposCustomizados: { tipo_imovel: 'Comercial', interesse: 'Compra', orcamento: 3500000, newsletter: false }, criadoEm: daysFromNow(-6) },
  { id: 'c-12', ...base(USERS.gestor), nome: 'Sônia Barros', telefone: '(11) 92222-3334', email: 'sonia.barros@email.com', origem: 'telefone', tags: ['morno'], camposCustomizados: { tipo_imovel: 'Apartamento', interesse: 'Aluguel', orcamento: 2800, newsletter: true }, criadoEm: daysFromNow(-2) },
]

// --- Leads (cards do funil) ----------------------------------------------
const leadBase = (assigned: string) => ({ organizationId: ORG_ID, assignedTo: assigned, atualizadoEm: daysFromNow(-2) })

export const leads: Lead[] = [
  { id: 'l-01', ...leadBase(USERS.corretor1), contactId: 'c-01', stageId: STAGE.proposta, titulo: 'Apartamento Vila Mariana', valorEstimado: 650000, status: 'aberto', posicao: 1, criadoEm: daysFromNow(-38), fechadoEm: null },
  { id: 'l-02', ...leadBase(USERS.corretor1), contactId: 'c-02', stageId: STAGE.visita, titulo: 'Sala comercial Berrini', valorEstimado: 1200000, status: 'aberto', posicao: 1, criadoEm: daysFromNow(-31), fechadoEm: null },
  { id: 'l-03', ...leadBase(USERS.corretor1), contactId: 'c-03', stageId: STAGE.contato, titulo: 'Casa Tatuapé', valorEstimado: 850000, status: 'aberto', posicao: 1, criadoEm: daysFromNow(-26), fechadoEm: null },
  { id: 'l-04', ...leadBase(USERS.corretor1), contactId: 'c-04', stageId: STAGE.novo, titulo: 'Aluguel apto Moema', valorEstimado: 3500, status: 'aberto', posicao: 1, criadoEm: daysFromNow(-19), fechadoEm: null },
  { id: 'l-05', ...leadBase(USERS.corretor1), contactId: 'c-05', stageId: STAGE.fechado, titulo: 'Terreno Cotia', valorEstimado: 400000, status: 'ganho', posicao: 1, criadoEm: daysFromNow(-45), fechadoEm: daysFromNow(-5) },
  { id: 'l-06', ...leadBase(USERS.corretor2), contactId: 'c-06', stageId: STAGE.proposta, titulo: 'Apto Barra da Tijuca', valorEstimado: 720000, status: 'aberto', posicao: 2, criadoEm: daysFromNow(-36), fechadoEm: null },
  { id: 'l-07', ...leadBase(USERS.corretor2), contactId: 'c-07', stageId: STAGE.visita, titulo: 'Prédio comercial Centro', valorEstimado: 2100000, status: 'aberto', posicao: 2, criadoEm: daysFromNow(-29), fechadoEm: null },
  { id: 'l-08', ...leadBase(USERS.corretor2), contactId: 'c-08', stageId: STAGE.novo, titulo: 'Aluguel casa Tijuca', valorEstimado: 5000, status: 'aberto', posicao: 2, criadoEm: daysFromNow(-22), fechadoEm: null },
  { id: 'l-09', ...leadBase(USERS.corretor2), contactId: 'c-09', stageId: STAGE.perdido, titulo: 'Apto Copacabana', valorEstimado: 560000, status: 'perdido', posicao: 1, criadoEm: daysFromNow(-40), fechadoEm: daysFromNow(-8) },
  { id: 'l-10', ...leadBase(USERS.corretor2), contactId: 'c-10', stageId: STAGE.contato, titulo: 'Casa Recreio', valorEstimado: 980000, status: 'aberto', posicao: 2, criadoEm: daysFromNow(-8), fechadoEm: null },
  { id: 'l-11', ...leadBase(USERS.gestor), contactId: 'c-11', stageId: STAGE.proposta, titulo: 'Laje corporativa Faria Lima', valorEstimado: 3500000, status: 'aberto', posicao: 3, criadoEm: daysFromNow(-5), fechadoEm: null },
]

// --- Tarefas --------------------------------------------------------------
const taskBase = (assigned: string) => ({ organizationId: ORG_ID, assignedTo: assigned, criadoPor: assigned })

export const tasks: Task[] = [
  { id: 't-01', ...taskBase(USERS.corretor1), contactId: 'c-01', leadId: 'l-01', titulo: 'Enviar proposta revisada', descricao: 'Cliente pediu ajuste no valor de entrada.', prioridade: 'alta', status: 'pendente', dueDate: daysFromNow(-1), criadoEm: daysFromNow(-4), concluidaEm: null },
  { id: 't-02', ...taskBase(USERS.corretor1), contactId: 'c-02', leadId: 'l-02', titulo: 'Agendar visita à sala', descricao: 'Confirmar disponibilidade da portaria.', prioridade: 'media', status: 'pendente', dueDate: daysFromNow(0), criadoEm: daysFromNow(-3), concluidaEm: null },
  { id: 't-03', ...taskBase(USERS.corretor1), contactId: 'c-03', leadId: 'l-03', titulo: 'Ligar para retomar contato', descricao: '', prioridade: 'media', status: 'pendente', dueDate: daysFromNow(2), criadoEm: daysFromNow(-2), concluidaEm: null },
  { id: 't-04', ...taskBase(USERS.corretor1), contactId: 'c-04', leadId: null, titulo: 'Enviar documentação do aluguel', descricao: 'Contrato e ficha cadastral.', prioridade: 'baixa', status: 'pendente', dueDate: daysFromNow(5), criadoEm: daysFromNow(-1), concluidaEm: null },
  { id: 't-05', ...taskBase(USERS.corretor1), contactId: 'c-05', leadId: 'l-05', titulo: 'Coletar assinatura', descricao: 'Fechamento do terreno.', prioridade: 'alta', status: 'concluida', dueDate: daysFromNow(-6), criadoEm: daysFromNow(-9), concluidaEm: daysFromNow(-5) },
  { id: 't-06', ...taskBase(USERS.corretor2), contactId: 'c-06', leadId: 'l-06', titulo: 'Preparar contraproposta', descricao: 'Comprador quer negociar 5%.', prioridade: 'alta', status: 'pendente', dueDate: daysFromNow(-2), criadoEm: daysFromNow(-4), concluidaEm: null },
  { id: 't-07', ...taskBase(USERS.corretor2), contactId: 'c-07', leadId: 'l-07', titulo: 'Enviar plantas do prédio', descricao: '', prioridade: 'media', status: 'pendente', dueDate: daysFromNow(0), criadoEm: daysFromNow(-3), concluidaEm: null },
  { id: 't-08', ...taskBase(USERS.corretor2), contactId: 'c-08', leadId: 'l-08', titulo: 'Confirmar vistoria', descricao: 'Agendar com o proprietário.', prioridade: 'baixa', status: 'pendente', dueDate: daysFromNow(3), criadoEm: daysFromNow(-2), concluidaEm: null },
  { id: 't-09', ...taskBase(USERS.corretor2), contactId: 'c-10', leadId: 'l-10', titulo: 'Retornar ligação', descricao: '', prioridade: 'media', status: 'pendente', dueDate: daysFromNow(1), criadoEm: daysFromNow(-1), concluidaEm: null },
  { id: 't-10', ...taskBase(USERS.corretor2), contactId: 'c-09', leadId: 'l-09', titulo: 'Registrar motivo da perda', descricao: 'Cliente fechou com concorrente.', prioridade: 'baixa', status: 'concluida', dueDate: daysFromNow(-9), criadoEm: daysFromNow(-10), concluidaEm: daysFromNow(-8) },
  { id: 't-11', ...taskBase(USERS.gestor), contactId: 'c-11', leadId: 'l-11', titulo: 'Revisar proposta corporativa', descricao: 'Validar condições com o jurídico.', prioridade: 'alta', status: 'pendente', dueDate: daysFromNow(1), criadoEm: daysFromNow(-2), concluidaEm: null },
  { id: 't-12', ...taskBase(USERS.gestor), contactId: 'c-12', leadId: null, titulo: 'Cadastrar imóvel para locação', descricao: '', prioridade: 'baixa', status: 'pendente', dueDate: daysFromNow(4), criadoEm: daysFromNow(-1), concluidaEm: null },
]
