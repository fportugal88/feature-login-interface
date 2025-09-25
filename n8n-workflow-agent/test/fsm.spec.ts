import { describe, expect, it } from 'vitest';
import exampleSlots from '../src/agent/examples/slots.example.json';
import {
  fillSlotsFromMessage,
  nextQuestion,
  checkpoint,
  isReadyForApproval,
} from '../src/agent/fsm';

describe('FSM', () => {
  it('sugere a primeira pergunta quando slots estão vazios', () => {
    const question = nextQuestion({});
    expect(question).toContain('título');
  });

  it('atualiza slots a partir de JSON simples', () => {
    const initial = {};
    const updated = fillSlotsFromMessage(initial, '{"titulo":"Workflow"}');
    expect(updated).toHaveProperty('titulo', 'Workflow');
  });

  it('produz checkpoint quando pronto para aprovação', () => {
    expect(isReadyForApproval(exampleSlots)).toBe(true);
    const summary = checkpoint(exampleSlots);
    expect(summary.resumo).toContain('Fluxo');
    expect(summary.lacunas.length).toBe(0);
  });
});
