import type { Slots } from './schema';
import { normalizeCron } from '../utils/cron';
import { toSentence } from '../utils/strings';

export const buildMarkdown = (slots: Slots): string => {
  const lines: string[] = [];
  lines.push(`# ${slots.titulo}`);
  lines.push('');
  lines.push('## Objetivo & KPIs');
  lines.push(`- Objetivo de negócio: ${slots.objetivo_negocio}`);
  lines.push(
    `- KPIs: ${slots.kpis.map((k) => `${k.nome} (${k.meta})`).join(', ')}`,
  );
  if (slots.beneficiarios.length) {
    lines.push(`- Beneficiários: ${toSentence(slots.beneficiarios)}`);
  }
  lines.push('');
  lines.push('## Gatilho');
  lines.push(`- Tipo: ${slots.gatilho.tipo}`);
  if (slots.gatilho.detalhe) {
    lines.push(`- Detalhe: ${slots.gatilho.detalhe}`);
  }
  lines.push('');
  lines.push('## Entradas');
  slots.entradas.forEach((entrada) => {
    lines.push(
      `- ${entrada.campo} (${entrada.tipo}) [${entrada.origem}]${entrada.obrigatorio ? ' - obrigatório' : ''}`,
    );
  });
  lines.push('');
  lines.push('## Passo a passo');
  slots.etapas.forEach((etapa, index) => {
    lines.push(`### ${index + 1}. ${etapa.nome}`);
    lines.push(etapa.descricao);
    if (etapa.regras?.length) {
      lines.push(`Regras: ${toSentence(etapa.regras)}`);
    }
    if (etapa.sistemas_env?.length) {
      lines.push(`Sistemas envolvidos: ${toSentence(etapa.sistemas_env)}`);
    }
    if (etapa.outputs?.length) {
      lines.push(`Outputs: ${toSentence(etapa.outputs)}`);
    }
    lines.push('');
  });
  lines.push('## Integrações & Credenciais');
  if (slots.integracoes.length === 0) {
    lines.push('- Nenhuma integração externa declarada.');
  } else {
    slots.integracoes.forEach((integracao) => {
      lines.push(
        `- ${integracao.tipo} → recurso ${integracao.recurso ?? '<<definir>>'} credencial ${integracao.auth_credencial ?? '<<<credencial>>>'}`,
      );
    });
  }
  lines.push('');
  lines.push('## Regras, Validações e Erros');
  if (slots.validacoes?.length) {
    lines.push(`- Validações: ${toSentence(slots.validacoes)}`);
  }
  if (slots.excecoes?.length) {
    lines.push(`- Exceções mapeadas: ${toSentence(slots.excecoes)}`);
  }
  lines.push(
    `- Tratamento de erros: alertas via ${slots.tratamento_erros.alertas.canal} (${slots.tratamento_erros.alertas.mensagem_base}) com reprocesso ${slots.tratamento_erros.reprocesso}.`,
  );
  lines.push('');
  lines.push('## Testes sugeridos');
  lines.push('- Validar gatilhos, condições IF e integrações com dados reais.');
  lines.push('- Simular falhas e confirmar alertas/logs.');
  lines.push('');
  lines.push('## Operação & Governança');
  lines.push(
    `- Execução: ${slots.execucao.tipo}${slots.execucao.detalhe ? ` (${slots.execucao.detalhe})` : ''}`,
  );
  if (slots.execucao.tipo === 'agendado' && slots.agendamento?.cron) {
    lines.push(`- Cron: ${slots.agendamento.cron}`);
  }
  lines.push(`- Owner: ${slots.owner}`);
  if (slots.stakeholders?.length) {
    lines.push(`- Stakeholders: ${toSentence(slots.stakeholders)}`);
  }
  lines.push(`- Criticidade: ${slots.criticidade}`);
  if (slots.logs) {
    lines.push(`- Logs: ${slots.logs.destino} (${slots.logs.recurso})`);
  }
  lines.push('');
  lines.push('## LGPD');
  lines.push(`- Dados pessoais: ${slots.lgpd.dados_pessoais ? 'Sim' : 'Não'}`);
  if (slots.lgpd.dados_pessoais) {
    lines.push(
      `- Tipos: ${toSentence(slots.lgpd.tipos_dados ?? ['<<definir>>'])}`,
    );
    lines.push(`- Base legal: ${slots.lgpd.base_legal ?? '<<definir>>'}`);
    lines.push(`- Status DPO: ${slots.lgpd.dpo_aprovacao ?? 'pendente'}`);
  }
  return lines.join('\n');
};

export const buildGovernance = (slots: Slots): string => {
  const rows = [
    ['Item', 'Descrição'],
    ['Owner', slots.owner],
    ['Criticidade', slots.criticidade],
    [
      'Execução',
      `${slots.execucao.tipo}${slots.execucao.detalhe ? ` (${slots.execucao.detalhe})` : ''}`,
    ],
    ['Agendamento', slots.agendamento?.cron ?? 'N/A'],
    [
      'LGPD',
      slots.lgpd.dados_pessoais
        ? 'Dados pessoais presentes'
        : 'Sem dados pessoais',
    ],
    ['Base legal', slots.lgpd.base_legal ?? 'N/A'],
    ['DPO', slots.lgpd.dpo_aprovacao ?? 'N/A'],
  ];
  const header = `| ${rows[0][0]} | ${rows[0][1]} |`;
  const separator = '| --- | --- |';
  const body = rows
    .slice(1)
    .map((row) => `| ${row[0]} | ${row[1]} |`)
    .join('\n');
  return `${header}\n${separator}\n${body}`;
};

type N8NNode = {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: { x: number; y: number };
  parameters?: Record<string, unknown>;
};

type N8NWorkflow = {
  name: string;
  nodes: N8NNode[];
  connections: Record<
    string,
    { main: { node: string; type: string; index: number }[][] }
  >;
  settings: Record<string, unknown>;
  pinData: Record<string, unknown>;
};

const buildTriggerNode = (slots: Slots): N8NNode => {
  switch (slots.gatilho.tipo) {
    case 'cron': {
      const cron = normalizeCron(
        slots.agendamento?.cron ?? slots.gatilho.detalhe ?? '0 8 * * *',
      );
      const [minute, hour, dayOfMonth = '*', month = '*', dayOfWeek = '*'] =
        cron.split(' ');
      return {
        id: '1',
        name: 'Cron',
        type: 'n8n-nodes-base.cron',
        typeVersion: 1,
        position: { x: 200, y: 200 },
        parameters: {
          rule: {
            minute,
            hour: hour ?? '*',
            dayOfMonth,
            month,
            dayOfWeek,
          },
        },
      };
    }
    case 'webhook':
      return {
        id: '1',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: { x: 200, y: 200 },
        parameters: {
          httpMethod: 'POST',
          path: slots.gatilho.detalhe ?? 'workflow-hook',
        },
      };
    case 'evento':
      return {
        id: '1',
        name: 'Event Trigger',
        type: 'n8n-nodes-base.eventTrigger',
        typeVersion: 1,
        position: { x: 200, y: 200 },
      };
    default:
      return {
        id: '1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: { x: 200, y: 200 },
      };
  }
};

const buildValidationNode = (slots: Slots): N8NNode => {
  const primeiroCampo = slots.entradas[0];
  return {
    id: '2',
    name: 'Validar entrada',
    type: 'n8n-nodes-base.if',
    typeVersion: 1,
    position: { x: 460, y: 200 },
    parameters: {
      conditions: {
        string: [
          {
            value1: `={{$json["${primeiroCampo.campo}"]}}`,
            operation: 'isNotEmpty',
          },
        ],
      },
    },
  };
};

const integrationTypeMap: Record<
  Slots['integracoes'][number]['tipo'],
  { type: string; name: string }
> = {
  google_sheets: { type: 'n8n-nodes-base.googleSheets', name: 'Google Sheets' },
  slack: { type: 'n8n-nodes-base.slack', name: 'Slack' },
  email: { type: 'n8n-nodes-base.emailSend', name: 'Email' },
  http: { type: 'n8n-nodes-base.httpRequest', name: 'HTTP Request' },
  db: { type: 'n8n-nodes-base.postgres', name: 'Database' },
};

const buildIntegrationNode = (
  index: number,
  integracao: Slots['integracoes'][number],
): N8NNode => {
  const meta = integrationTypeMap[integracao.tipo];
  return {
    id: `${index + 3}`,
    name: `${meta.name} ${index + 1}`,
    type: meta.type,
    typeVersion: 1,
    position: { x: 720 + index * 200, y: 200 },
    parameters: {
      ...(integracao.tipo === 'google_sheets' && {
        operation: 'append',
        sheetId: integracao.recurso ?? '<<sheetId>>',
      }),
      ...(integracao.tipo === 'slack' && {
        channel: integracao.recurso ?? '#canal',
        text: 'Atualização do fluxo',
      }),
      ...(integracao.tipo === 'email' && {
        toEmail: integracao.recurso ?? 'destinatario@example.com',
        subject: 'Atualização workflow',
      }),
      ...(integracao.tipo === 'http' && {
        url: integracao.endpoint_ou_referencia ?? 'https://api.exemplo.com',
        method: integracao.metodo ?? 'POST',
      }),
      ...(integracao.tipo === 'db' && {
        operation: 'executeQuery',
        query: integracao.endpoint_ou_referencia ?? 'SELECT 1;',
      }),
    },
  };
};

const buildLogNode = (slots: Slots): N8NNode | null => {
  if (!slots.logs) {
    return null;
  }
  return {
    id: `${slots.integracoes.length + 3}`,
    name: 'Registrar Log',
    type:
      slots.logs.destino === 'Sheets'
        ? 'n8n-nodes-base.googleSheets'
        : 'n8n-nodes-base.postgres',
    typeVersion: 1,
    position: { x: 720 + slots.integracoes.length * 200, y: 200 },
    parameters: {
      ...(slots.logs.destino === 'Sheets'
        ? { operation: 'append', sheetId: slots.logs.recurso }
        : {
            operation: 'executeQuery',
            query: `INSERT INTO ${slots.logs.recurso} (...) VALUES (...)`,
          }),
    },
  };
};

const buildSuccessNode = (slots: Slots, offset: number): N8NNode => ({
  id: `${offset}`,
  name: 'Sucesso',
  type: 'n8n-nodes-base.set',
  typeVersion: 1,
  position: { x: 720 + offset * 200, y: 200 },
  parameters: {
    values: {
      string: [
        {
          name: 'status',
          value: 'concluido',
        },
        {
          name: 'workflow',
          value: slots.titulo,
        },
      ],
    },
  },
});

const buildErrorNode = (): N8NNode => ({
  id: '99',
  name: 'Error Trigger',
  type: 'n8n-nodes-base.errorTrigger',
  typeVersion: 1,
  position: { x: 460, y: 420 },
});

export const generateN8NWorkflow = (slots: Slots): N8NWorkflow => {
  const triggerNode = buildTriggerNode(slots);
  const validationNode = buildValidationNode(slots);
  const integrationNodes = slots.integracoes.map((integracao, index) =>
    buildIntegrationNode(index, integracao),
  );
  const logNode = buildLogNode(slots);
  const successNodeId = logNode
    ? slots.integracoes.length + 4
    : slots.integracoes.length + 3;
  const successNode = buildSuccessNode(slots, successNodeId);
  const errorNode = buildErrorNode();

  const nodes: N8NNode[] = [
    triggerNode,
    validationNode,
    ...integrationNodes,
    successNode,
    errorNode,
  ];
  if (logNode) {
    nodes.splice(2 + integrationNodes.length, 0, logNode);
  }

  const connections: N8NWorkflow['connections'] = {
    [triggerNode.name]: {
      main: [[{ node: validationNode.name, type: 'main', index: 0 }]],
    },
    [validationNode.name]: {
      main: [
        [
          {
            node:
              integrationNodes[0]?.name ?? logNode?.name ?? successNode.name,
            type: 'main',
            index: 0,
          },
        ],
        [{ node: errorNode.name, type: 'main', index: 0 }],
      ],
    },
  };

  const chainNodes = [...integrationNodes];
  if (logNode) {
    chainNodes.push(logNode);
  }
  chainNodes.push(successNode);

  for (let i = 0; i < chainNodes.length - 1; i += 1) {
    const current = chainNodes[i];
    const next = chainNodes[i + 1];
    connections[current.name] = {
      main: [[{ node: next.name, type: 'main', index: 0 }]],
    };
  }

  return {
    name: slots.titulo,
    nodes,
    connections,
    settings: { executionTimeout: 600 },
    pinData: {},
  };
};
