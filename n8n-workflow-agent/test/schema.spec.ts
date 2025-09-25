import { describe, expect, it } from 'vitest';
import exampleSlots from '../src/agent/examples/slots.example.json';
import { slotsSchema, isReadyForApproval } from '../src/agent/schema';

describe('slots schema', () => {
  it('valida slots de exemplo', () => {
    const parsed = slotsSchema.parse(exampleSlots);
    expect(parsed.titulo).toBe('Atualização semanal de indicadores');
    expect(parsed.etapas.length).toBeGreaterThanOrEqual(3);
  });

  it('detecta lacunas obrigatórias', () => {
    const partial = { titulo: 'Fluxo' };
    expect(isReadyForApproval(partial)).toBe(false);
  });
});
