import { z } from 'zod';

const kpiSchema = z.object({
  nome: z.string().min(1),
  meta: z.string().min(1),
});

const gatilhoSchema = z.object({
  tipo: z.enum(['cron', 'webhook', 'evento', 'manual']),
  detalhe: z.string().optional(),
});

const entradaSchema = z.object({
  campo: z.string().min(1),
  tipo: z.string().min(1),
  obrigatorio: z.boolean(),
  origem: z.enum(['form', 'api', 'sheet', 'db', 'email', 'outro']),
});

const etapaSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().min(1),
  regras: z.array(z.string().min(1)).optional(),
  sistemas_env: z.array(z.string().min(1)).optional(),
  outputs: z.array(z.string().min(1)).optional(),
});

const integracaoSchema = z.object({
  tipo: z.enum(['google_sheets', 'slack', 'email', 'http', 'db']),
  recurso: z.string().optional(),
  metodo: z.string().optional(),
  endpoint_ou_referencia: z.string().optional(),
  auth_credencial: z.string().optional(),
});

const notificacaoSchema = z.object({
  canal: z.enum(['slack', 'email']),
  mensagem: z.string().min(1),
  destino: z.string().optional(),
});

const logsSchema = z.object({
  destino: z.enum(['Sheets', 'DB']),
  recurso: z.string().min(1),
});

const tratamentoErrosSchema = z.object({
  alertas: z.object({
    canal: z.string().min(1),
    mensagem_base: z.string().min(1),
  }),
  reprocesso: z.enum(['manual', 'automatico', 'instrucoes']),
});

const execucaoSchema = z.object({
  tipo: z.enum(['agendado', 'sob-demanda', 'event-driven']),
  detalhe: z.string().optional(),
});

const agendamentoSchema = z.object({
  cron: z.string().optional(),
});

const lgpdSchema = z.object({
  dados_pessoais: z.boolean(),
  tipos_dados: z.array(z.string().min(1)).optional(),
  base_legal: z.string().optional(),
  dpo_aprovacao: z.enum(['pendente', 'aprovado']).optional(),
});

export const slotsSchema = z.object({
  titulo: z.string().min(1),
  objetivo_negocio: z.string().min(1),
  beneficiarios: z.array(z.string().min(1)).default([]),
  kpis: z.array(kpiSchema).min(1),
  gatilho: gatilhoSchema,
  entradas: z.array(entradaSchema).min(1),
  etapas: z.array(etapaSchema).min(3),
  integracoes: z.array(integracaoSchema).default([]),
  validacoes: z.array(z.string().min(1)).optional(),
  excecoes: z.array(z.string().min(1)).optional(),
  tratamento_erros: tratamentoErrosSchema,
  saidas: z.array(z.string().min(1)).min(1),
  notificacoes: z.array(notificacaoSchema).optional(),
  logs: logsSchema.optional(),
  execucao: execucaoSchema,
  agendamento: agendamentoSchema.optional(),
  owner: z.string().min(1),
  stakeholders: z.array(z.string().min(1)).optional(),
  criticidade: z.enum(['baixa', 'media', 'alta']),
  risco: z.array(z.string().min(1)).optional(),
  lgpd: lgpdSchema,
});

export type Slots = z.infer<typeof slotsSchema>;
export type SlotsPartial = Partial<Slots>;

const hasLgpdApproval = (slots: Slots): boolean => {
  if (!slots.lgpd.dados_pessoais) {
    return true;
  }
  return (
    Boolean(slots.lgpd.base_legal) && slots.lgpd.dpo_aprovacao !== undefined
  );
};

const hasScheduling = (slots: Slots): boolean => {
  if (slots.execucao.tipo !== 'agendado') {
    return true;
  }
  return Boolean(slots.agendamento?.cron);
};

export const isReadyForApproval = (slots: SlotsPartial): slots is Slots => {
  const result = slotsSchema.safeParse(slots);
  if (!result.success) {
    return false;
  }
  const value = result.data;
  if (value.integracoes.length === 0) {
    // Integrations can be absent, but keep array.
  }
  return (
    value.titulo.trim().length > 0 &&
    value.objetivo_negocio.trim().length > 0 &&
    value.kpis.length > 0 &&
    value.entradas.length > 0 &&
    value.etapas.length >= 3 &&
    value.saidas.length > 0 &&
    hasScheduling(value) &&
    hasLgpdApproval(value)
  );
};
