import type { Slots, SlotsPartial } from './schema';
import { isReadyForApproval as schemaIsReady } from './schema';
import { summarize } from './summarizer';

const mergeSlots = (
  base: SlotsPartial,
  incoming: SlotsPartial,
): SlotsPartial => {
  const output: Record<string, unknown> = {
    ...((base as Record<string, unknown>) ?? {}),
  };
  for (const [key, value] of Object.entries(incoming ?? {})) {
    if (Array.isArray(value)) {
      output[key] = value;
    } else if (value && typeof value === 'object') {
      const current = output[key] as SlotsPartial;
      output[key] = mergeSlots(current ?? {}, value as SlotsPartial);
    } else if (value !== undefined) {
      output[key] = value;
    }
  }
  return output as SlotsPartial;
};

export const fillSlotsFromMessage = (
  slots: SlotsPartial,
  message: string,
): SlotsPartial => {
  const trimmed = message.trim();
  if (!trimmed) {
    return { ...(slots ?? {}) };
  }
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        return mergeSlots(slots ?? {}, parsed as SlotsPartial);
      }
    } catch {
      return { ...(slots ?? {}) };
    }
  }
  return { ...(slots ?? {}) };
};

type PhaseKey =
  | 'objetivo'
  | 'gatilho'
  | 'entradas'
  | 'etapas'
  | 'integracoes'
  | 'erros'
  | 'saidas'
  | 'governanca';

const phaseOrder: PhaseKey[] = [
  'objetivo',
  'gatilho',
  'entradas',
  'etapas',
  'integracoes',
  'erros',
  'saidas',
  'governanca',
];

const nextQuestionByPhase: Record<
  PhaseKey,
  (slots: SlotsPartial) => string | null
> = {
  objetivo: (slots) => {
    if (!slots.titulo) {
      return 'Qual é o título do fluxo? Envie JSON como {"titulo":"..."}.';
    }
    if (!slots.objetivo_negocio) {
      return 'Descreva o objetivo de negócio. Ex: {"objetivo_negocio":"reduzir retrabalho"}';
    }
    if (!slots.kpis || slots.kpis.length === 0) {
      return 'Quais KPIs serão acompanhados? Envie {"kpis":[{"nome":"Tempo", "meta":"< 2h"}]}.';
    }
    if (!slots.beneficiarios || slots.beneficiarios.length === 0) {
      return 'Quem se beneficia do fluxo? Ex: {"beneficiarios":["Suporte","Cliente"]}';
    }
    return null;
  },
  gatilho: (slots) => {
    if (!slots.gatilho) {
      return 'Defina o gatilho. Ex: {"gatilho":{"tipo":"cron","detalhe":"diario 8h"}}';
    }
    return null;
  },
  entradas: (slots) => {
    if (!slots.entradas || slots.entradas.length === 0) {
      return 'Liste as entradas obrigatórias. Ex: {"entradas":[{"campo":"email","tipo":"string","obrigatorio":true,"origem":"form"}]}';
    }
    return null;
  },
  etapas: (slots) => {
    if (!slots.etapas || slots.etapas.length < 3) {
      return 'Descreva pelo menos 3 etapas do fluxo. Ex: {"etapas":[{"nome":"Validar","descricao":"Checar dados"}]}';
    }
    if (!slots.validacoes) {
      return 'Existem validações ou regras de negócio adicionais? Ex: {"validacoes":["Verificar duplicidade"]}';
    }
    return null;
  },
  integracoes: (slots) => {
    if (slots.integracoes === undefined) {
      return 'Quais integrações são necessárias? Caso nenhuma, envie {"integracoes":[]}.';
    }
    return null;
  },
  erros: (slots) => {
    if (!slots.tratamento_erros) {
      return 'Como tratar erros e alertas? Ex: {"tratamento_erros":{"alertas":{"canal":"slack","mensagem_base":"Falha"},"reprocesso":"manual"}}';
    }
    if (!slots.excecoes) {
      return 'Liste exceções conhecidas. Ex: {"excecoes":["Cliente sem cadastro"]}';
    }
    return null;
  },
  saidas: (slots) => {
    if (!slots.saidas || slots.saidas.length === 0) {
      return 'Quais são as saídas? Ex: {"saidas":["Ticket atualizado","Email enviado"]}';
    }
    if (!slots.notificacoes) {
      return 'Existem notificações? Informe ou envie {"notificacoes":[]} se não houver.';
    }
    if (!slots.logs) {
      return 'Onde ficam os logs? Ex: {"logs":{"destino":"Sheets","recurso":"workflow_logs"}}';
    }
    return null;
  },
  governanca: (slots) => {
    if (!slots.execucao) {
      return 'Como o fluxo será executado? Ex: {"execucao":{"tipo":"agendado","detalhe":"dias úteis"}}';
    }
    if (slots.execucao?.tipo === 'agendado' && !slots.agendamento?.cron) {
      return 'Defina o cron de agendamento. Ex: {"agendamento":{"cron":"0 8 * * 1-5"}}';
    }
    if (!slots.owner) {
      return 'Quem é o owner do fluxo? Ex: {"owner":"Time Operações"}';
    }
    if (!slots.criticidade) {
      return 'Qual a criticidade (baixa|media|alta)? Ex: {"criticidade":"media"}';
    }
    if (!slots.lgpd) {
      return 'Há dados pessoais? Ex: {"lgpd":{"dados_pessoais":false}}';
    }
    if (
      slots.lgpd?.dados_pessoais &&
      (!slots.lgpd.base_legal || !slots.lgpd.dpo_aprovacao)
    ) {
      return 'Informe base legal LGPD e status de aprovação DPO. Ex: {"lgpd":{"dados_pessoais":true,"tipos_dados":["email"],"base_legal":"consentimento","dpo_aprovacao":"pendente"}}';
    }
    return null;
  },
};

export const nextQuestion = (slots: SlotsPartial): string => {
  for (const phase of phaseOrder) {
    const question = nextQuestionByPhase[phase](slots);
    if (question) {
      return question;
    }
  }
  return 'Revise e responda APROVO para gerar os artefatos.';
};

export const checkpoint = (slots: SlotsPartial) => {
  const { summary, gaps, questions } = summarize(slots);
  return {
    resumo: summary,
    lacunas: gaps,
    perguntas: questions,
  };
};

export const isReadyForApproval = (slots: SlotsPartial): slots is Slots =>
  schemaIsReady(slots);
