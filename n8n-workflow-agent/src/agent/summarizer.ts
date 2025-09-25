import type { SlotsPartial } from './schema';
import { toSentence } from '../utils/strings';

const ensureLines = (lines: string[]): string => {
  const filled = lines.filter(Boolean);
  while (filled.length < 4) {
    filled.push('Detalhes adicionais serão coletados nas próximas respostas.');
  }
  return filled.slice(0, 6).join('\n');
};

const missingFields = (slots: SlotsPartial): string[] => {
  const gaps: string[] = [];
  if (!slots.titulo) gaps.push('titulo');
  if (!slots.objetivo_negocio) gaps.push('objetivo_negocio');
  if (!slots.kpis || slots.kpis.length === 0) gaps.push('kpis');
  if (!slots.gatilho) gaps.push('gatilho');
  if (!slots.entradas || slots.entradas.length === 0) gaps.push('entradas');
  if (!slots.etapas || slots.etapas.length < 3) gaps.push('etapas');
  if (slots.integracoes === undefined) gaps.push('integracoes');
  if (!slots.tratamento_erros) gaps.push('tratamento_erros');
  if (!slots.saidas || slots.saidas.length === 0) gaps.push('saidas');
  if (!slots.execucao) gaps.push('execucao');
  if (slots.execucao?.tipo === 'agendado' && !slots.agendamento?.cron)
    gaps.push('agendamento.cron');
  if (!slots.owner) gaps.push('owner');
  if (!slots.criticidade) gaps.push('criticidade');
  if (!slots.lgpd) gaps.push('lgpd');
  if (
    slots.lgpd?.dados_pessoais &&
    (!slots.lgpd.base_legal || !slots.lgpd.dpo_aprovacao)
  ) {
    gaps.push('lgpd.base_legal/dpo_aprovacao');
  }
  return gaps;
};

export const summarize = (slots: SlotsPartial) => {
  const lines: string[] = [];
  if (slots.titulo && slots.objetivo_negocio) {
    lines.push(`Fluxo **${slots.titulo}** busca ${slots.objetivo_negocio}.`);
  }
  if (slots.kpis && slots.kpis.length > 0) {
    const kpiNames = toSentence(slots.kpis.map((k) => `${k.nome} (${k.meta})`));
    lines.push(`KPIs alvo: ${kpiNames}.`);
  }
  if (slots.gatilho) {
    lines.push(
      `Gatilho ${slots.gatilho.tipo}${slots.gatilho.detalhe ? ` (${slots.gatilho.detalhe})` : ''}.`,
    );
  }
  if (slots.entradas && slots.entradas.length > 0) {
    lines.push(
      `Entradas principais: ${toSentence(slots.entradas.map((e) => e.campo))}.`,
    );
  }
  if (slots.etapas && slots.etapas.length > 0) {
    lines.push(`Etapas mapeadas: ${slots.etapas.length}.`);
  }
  if (slots.saidas && slots.saidas.length > 0) {
    lines.push(`Saídas esperadas: ${toSentence(slots.saidas)}.`);
  }

  const gaps = missingFields(slots);
  const questions = gaps.slice(0, 3).map((gap) => `Poderia detalhar ${gap}?`);

  return {
    summary: ensureLines(lines),
    gaps,
    questions,
  };
};
