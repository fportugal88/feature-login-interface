import { describe, expect, it } from 'vitest';
import exampleSlots from '../src/agent/examples/slots.example.json';
import {
  buildMarkdown,
  buildGovernance,
  generateN8NWorkflow,
} from '../src/agent/generator';

describe('generator', () => {
  it('gera markdown com seções principais', () => {
    const md = buildMarkdown(exampleSlots);
    expect(md).toContain('# Atualização semanal de indicadores');
    expect(md).toContain('## LGPD');
  });

  it('monta tabela de governança', () => {
    const gov = buildGovernance(exampleSlots);
    expect(gov).toContain('| Owner | Operações |');
  });

  it('gera workflow n8n com nodes obrigatórios', () => {
    const workflow = generateN8NWorkflow(exampleSlots);
    expect(workflow.nodes.length).toBeGreaterThan(2);
    const nodeNames = workflow.nodes.map((node) => node.name);
    expect(nodeNames).toContain('Validar entrada');
    expect(workflow.connections).toHaveProperty('Cron');
  });
});
