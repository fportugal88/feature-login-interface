import type { SlotsPartial } from './schema';
import { nextQuestion } from './fsm';

const hintByKeyword: { keyword: string; options: string[] }[] = [
  {
    keyword: 'gatilho',
    options: ['cron', 'webhook', 'evento', 'manual'],
  },
  {
    keyword: 'obrigatórias',
    options: ['form', 'api', 'sheet', 'db', 'email', 'outro'],
  },
  {
    keyword: 'integra',
    options: ['google_sheets', 'slack', 'email', 'http', 'db'],
  },
  {
    keyword: 'criticidade',
    options: ['baixa', 'media', 'alta'],
  },
];

const appendOptions = (question: string): string => {
  for (const hint of hintByKeyword) {
    if (question.toLowerCase().includes(hint.keyword.toLowerCase())) {
      return `${question} Opções: ${hint.options.join(', ')}.`;
    }
  }
  return question;
};

export const planNextQuestion = (slots: SlotsPartial): string => {
  const question = nextQuestion(slots);
  return appendOptions(question);
};
