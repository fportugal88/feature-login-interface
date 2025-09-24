# Subtexto Monorepo Bootstrap

Este repositório inicia do zero a organização dos trabalhos dos três times principais do Subtexto: Frontend Mobile, API-Contracts e Backend Supabase. Ele é uma base vazia, pronta para receber implementações seguindo o fluxo contract-first descrito no guia operacional.

## Estrutura inicial

- `app-civic-mobile/`: código do aplicativo Flutter (MVVC) e seus testes.
- `api-contracts/`: fonte da verdade dos contratos OpenAPI e testes de contrato automatizados.
- `backend-supabase/`: migrations SQL, políticas RLS e Edge Functions.
- `docs/`: decisões arquiteturais (ADRs), changelog compartilhado e documentação de processos.

## Próximos passos recomendados

1. Preparar o repositório `api-contracts` com um `openapi.yaml` inicial, política de versionamento (SemVer) e automação de testes de contrato.
2. Definir as migrations e políticas básicas no Supabase dentro de `backend-supabase/`, incluindo pipelines de testes (RLS, unitários e integração).
3. Gerar o projeto Flutter em `app-civic-mobile/` alinhado ao padrão MVVC, com geração de clientes a partir do OpenAPI e configuração de testes.
4. Registrar decisões relevantes no diretório `docs/` (por exemplo, ADRs) e manter changelogs sincronizados entre os três escopos.

Esta base atende ao pedido de recomeçar o repositório, deixando-o pronto para receber novas implementações com clareza de responsabilidades e artefatos esperados.
