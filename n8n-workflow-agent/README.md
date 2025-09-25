# n8n-workflow-agent

PoC de agente que entrevista usuários de negócio para coletar requisitos de workflows n8n, validar governança/LGPD e gerar artefatos executáveis.

## Visão geral

1. `POST /interview/start` abre uma sessão e retorna a primeira pergunta.
2. `POST /interview/reply` recebe respostas em JSON, alimenta a máquina de estados e retorna a próxima pergunta ou um resumo executivo.
3. Quando todos os slots obrigatórios são preenchidos o agente pede a aprovação explícita com a palavra **APROVO**.
4. `POST /interview/approve` valida que a aprovação foi registrada e devolve:
   - Documentação em Markdown;
   - Registro de governança (tabela Markdown);
   - JSON importável no n8n (nós e conexões principais).

Sessões ficam em memória com TTL configurável via `SESSION_TTL_MINUTES`.

## Requisitos

- Node.js 20+
- npm 10+

## Instalação e execução

```bash
npm install
npm run dev
```

Variáveis de ambiente disponíveis (`.env.example`):

```
PORT=3000
SESSION_TTL_MINUTES=60
```

Para produção:

```bash
npm run build
npm start
```

### Docker

```bash
docker compose up --build
```

O serviço ficará exposto em `http://localhost:3000`.

## Rotas da API

### `GET /health`

Retorna `{ "status": "ok" }` para verificação simples.

### `POST /interview/start`

Cria sessão e retorna a primeira pergunta.

```bash
curl -X POST http://localhost:3000/interview/start \
  -H 'Content-Type: application/json'
```

Resposta:

```json
{
  "sessionId": "<uuid>",
  "question": "Qual é o título do fluxo? Envie JSON como {\"titulo\":\"...\"}."
}
```

### `POST /interview/reply`

Envia respostas em JSON literal para preencher slots.

```bash
curl -X POST http://localhost:3000/interview/reply \
  -H 'Content-Type: application/json' \
  -d '{
    "sessionId": "<uuid>",
    "message": "{\"titulo\":\"Atualização semanal\",\"objetivo_negocio\":\"Consolidar métricas\"}"
  }'
```

Quando todos os campos obrigatórios forem preenchidos o serviço retorna um resumo executivo e orienta a responder `APROVO`.

### `POST /interview/approve`

Gera os artefatos após a aprovação explícita.

```bash
curl -X POST http://localhost:3000/interview/approve \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"<uuid>"}'
```

Resposta:

```json
{
  "documentationMd": "# <...>",
  "governanceMd": "| Item | Descrição |\n| --- | --- |\n...",
  "n8nJson": {
    "name": "...",
    "nodes": [ ... ],
    "connections": { ... }
  }
}
```

> Importante: o endpoint `/interview/approve` só funciona após uma resposta `"APROVO"` em `/interview/reply`.

## Estrutura

```
src/
  agent/           # Schemas, FSM, planner, summarizer e generators
  routes/          # Rotas Express (entrevista e health)
  services/        # Stubs de serviços externos (ex.: LLM)
  utils/           # Helpers de string e cron
  app.ts           # Instancia o Express
  server.ts        # Bootstrap do servidor
```

O arquivo `src/agent/examples/slots.example.json` demonstra um preenchimento completo.

## Scripts npm

- `npm run dev` – modo desenvolvimento com recarregamento (`tsx`).
- `npm run build` – transpila TypeScript para `dist/`.
- `npm start` – executa a versão compilada.
- `npm run lint` – ESLint + Prettier.
- `npm run format` – formata arquivos `.ts` e `README.md`.
- `npm test` – Vitest em modo `run`.
- `npm run test:watch` – Vitest observando arquivos.

## Testes

Vitest cobre três áreas principais:

- `schema.spec.ts` valida o schema Zod e a regra LGPD;
- `fsm.spec.ts` testa perguntas e preenchimento de slots;
- `generator.spec.ts` garante que Markdown e workflow n8n sejam gerados.

Execute localmente com:

```bash
npm run build
npm test
```

## CI

O repositório inclui pipeline GitHub Actions (`.github/workflows/ci.yml`) com `npm ci`, lint e testes automatizados.
