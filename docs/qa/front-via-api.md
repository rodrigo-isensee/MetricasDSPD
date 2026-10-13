# Plano de testes - front via API (FA-4 paridade, FA-5 E2E e desempenho)
Links: plano técnico `docs/architecture/features/front-via-api.md`, contrato `docs/api/`, orçamento `docs/architecture/adr/0003-orcamento-de-performance.md` (F1 a F5, A1). Bugs: `docs/qa/bugs/FA-001` a `FA-005`.

## Escopo
Coberto: resultado de cada métrica (47 ids) do `MockFonteMetricas` x `HttpFonteMetricas` contra a API real local (`DADOS_FONTE=mock`), após o parse e no corpo bruto; SPA em `VITE_FONTE=api` nos quatro painéis e na Visão geral; erros por `page.route`; desempenho dos painéis pela API. Fora: SSO (D6), `compose` da homologação (proposta D2 abaixo), a11y nova (a interface não mudou; a suíte de axe segue no grupo mock).

## Como rodar (sempre sob `flock /tmp/metricas-pesado.lock`, um por vez)
- Paridade: `bash scripts/com-api-mock.sh pnpm --dir web run test:paridade`.
- E2E em `api`: `bash scripts/com-api-mock.sh bash -c 'cd e2e && E2E_API_URL=$API_URL pnpm run test:api'`.
- Desempenho: o mesmo, com `pnpm run test:perf:api` (grava `e2e/perf-results/resultado-api.json`).
- `scripts/com-api-mock.sh` usa o Postgres local já de pé (não o recria), migra schemas temporários com prefixo no banco `metricas_test`, semeia o mesmo mock do front (`server/tests/pg/servidor-api-mock.ts`), sobe a API na porta 3100 e remove tudo ao terminar. Ajuste de fixture: insere uma `coleta_incremental` por fonte (ver FA-002). Sem `E2E_API_URL` o Playwright roda só o grupo mock (projetos `chromium`, `perf`, `chromium-semente-alt`), como antes.
- Chromium sem bibliotecas do sistema: `export LD_LIBRARY_PATH=$HOME/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu:$HOME/.local/chromium-libs/root/lib/x86_64-linux-gnu`.

## Cenários
| ID | Cenário | Tipo | Prio | Automatizado |
|---|---|---|---|---|
| PA-01 | Data de referência, critérios e opções de filtro iguais | contrato | Alta | sim (`web/paridade`) |
| PA-02 | Para cada métrica: 9 conjuntos de filtros (12s, 4s, 6m, 12m, tipo, todos os tipos, equipe+sistema, personalizado, combinado; sustentação: equipe, duas equipes, prioridade) iguais após o parse | contrato | Alta | sim |
| PA-03 | Mesmo conjunto, corpo bruto da API x resultado do mock (pega campo que o parse descarta) | contrato | Média | sim |
| PA-04 | O2 paginado: `itensMeta` e `itens` (200) iguais | contrato | Alta | sim (dentro de PA-02) |
| FA5-01 | Quatro painéis em `api`: cartões prontos, nenhuma resposta não 2xx, sem "Dados fictícios", sem erro de console | E2E | Alta | sim |
| FA5-02 | Visão geral abre pela API sem erro | E2E | Alta | sim |
| FA5-03 | Só tráfego de mesma origem e nenhuma resposta com `Access-Control-Allow-Origin` | E2E | Alta | sim |
| FA5-04/05 | Troca de filtro gera a query do contrato (`tipo=incidente`); O2 pede `pageSize=200` | E2E | Média | sim |
| FA5-10 | 400, 500, 503 e corpo não JSON em O4: erro só no cartão, "Tentar de novo", 1 chamada (sem retry), texto do servidor não aparece | E2E | Alta | sim |
| FA5-11/12 | Conexão abortada vira erro no cartão; "Tentar de novo" recupera | E2E | Alta | sim |
| FA5-13/14 | 200 fora do schema e 200 não JSON viram erro, sem exibir o corpo; console registra "Resposta fora do contrato" sem o corpo | E2E | Alta | sim |
| FA5-15 | Falha em `/filtros/*` não derruba a página | E2E | Média | sim |
| FA5-16 | Troca rápida de filtro com resposta lenta do filtro antigo: painel termina consistente | E2E | Média | sim |
| PF-01 | F1 a F5 e C6 da SPA em `api` (perf.spec.ts no projeto `perf-api`) | perf | Alta | sim |
| PF-02 | A1: p95 dos GET de métrica por painel, no navegador e isolados (fria/quente) | perf | Alta | sim |

## Dados de teste
Mock padrão do front (semente e escala padrão), semeado em schemas temporários; data de referência 2026-10-09. Nenhum dado real.

## Resultado da execução (2026-10-12, WSL2, Chromium headless, API e Postgres locais)
| Suíte | Resultado |
|---|---|
| Paridade (51 testes: 1 de referência + 47 métricas + extras) | 16 aprovados, 35 reprovados (todos por defeitos reais; nenhum teste pulado) |
| E2E `chromium-api` (18) | 16 aprovados, 2 reprovados: FA5-01 `/sustentacao` e FA5-02 Visão geral (FA-001) |
| Perf `perf-api` (F1 a F5, C6, CLS 375, A1) | F1 a F5/C6/CLS aprovados; A1 isolada reprovada só por S1 503 (FA-001), A1 no navegador reprovada só em `/` (503, sem 200 para medir) |
| Unitários web (`pnpm --dir web test`) | 728/728 |
| Unitários server (`vitest --project unit`) | 279/279 |
| E2E grupo mock (`chromium` + `semente-alt`) | 322 aprovados, 1 falha (`filtros.spec.ts FIL-04`) que passa isolada (instável sob carga; a 4173 pode ter sido reaproveitada de outro worktree). Reportar, sem skip |

### Paridade: o que passa e o que não
Passam (iguais após o parse e no corpo bruto): BLOQUEADOS, O11, O13 a O18, T4, T5, T8, T9, E4, S8, S11, S12 (inclui O2 só no filtro padrão; com equipe+sistema as etapas divergem, FA-002).
Falham por categoria:
1. Referência não semeada, 503 `REFERENCIA_AUSENTE`: S1, S2, S3, S5, EI_SUST, VISAO_GERAL (FA-001).
2. Referências do fluxo e critérios não semeados, valores diferentes: O1, O2 (equipe+sistema), T2, T3, T7, E2, E3, opções de filtro e critérios; `criterios.serie/janela` ausentes em O7, O9, T1, S4, S6, EI_* (FA-002).
3. Contagens diferentes de causa a investigar: O10, O12, S7 (FA-003).
4. Só no corpo bruto (`janela.unidade/quantidade` descartados): O2, O4, O6, O8, O9, T1, T6, E1, E5, S4, S9, S10, EI_FL2, EI_FL3, EI_SUST (FA-004).
O2: `itensMeta` e a primeira página de 200 itens iguais nos filtros sem referência (R3 do plano confirmada).

### Desempenho (ADR 0003), SPA em `api`, 1366x768
- F1 LCP da `/` em carga fria: p95 176 ms (limite 2000). F2 CLS: 0,003 a 0,086 (limite 0,1; `/operacional` 0,086 perto do limite). C6 tarefa longa: mediana 0 a 68 ms (limite 200). F3 INP: 64 ms (200). F4 resposta visual: p95 80 ms (100).
- F5 painel atualizado na troca de filtro: p95 184 ms (limite 500). O rótulo do teste diz "COM latência simulada" por herança do mock; em `api` não há latência simulada (cosmético, só do teste).
- A1 no navegador (carga fria, 6 conexões, ~12 GET em paralelo, só respostas 200): p95 geral 59 a 83 ms entre execuções; por painel: Operacional 118 a 302 ms (uma execução de 20 ficou em 302 ms, acima de 300; outras duas em 118 e 202: instável, p95 de poucas amostras e primeira chamada fria do servidor), Tático 28 a 56, Estratégico 12 a 23, Sustentação 117 a 136 (sem os 503), Espera invisível 30 a 32. Isolada: fria p95 34 ms, quente p95 13 ms.
- Ressalvas: dados no volume do mock, máquina local sem rede; Sustentação e Visão geral medidas com respostas 503 excluídas (FA-001), então a medição de Sustentação só vale depois da correção. C5 (heap) devolveu NaN (problema antigo do `Performance.getMetrics`, fora do escopo).
- Risco R2 (6 conexões, ~12 GET): não se materializou nestes números; reavaliar com o volume real.

## Lacunas do FA-3 e como foram tratadas
- Compare após o parse: feito em PA-02; PA-03 compara também o corpo bruto (acha `janela.*`, FA-004).
- Schemas de resultado não `.strict()`: o corpo bruto é o único detector hoje; recomendação em FA-004.
- `data-*` com o código de erro: ausente (FA-005); os E2E de erro provam o efeito (cartão em erro, sem retry, sem texto do servidor), não a causa.

## Proposta D2 (homologação em `VITE_FONTE=api`), sem implementar
1. `docker-compose` da homologação: `web` com build arg `VITE_FONTE: api` e `depends_on: api (service_healthy)`; nginx encaminhando `/api/` para `api:3000` (mesma origem, sem CORS) e CSP com `connect-src 'self'`.
2. Pré-condições (bloqueiam a adoção): corrigir FA-001 e FA-002 (seed de referência e `coleta_incremental`) e FA-003; só então a paridade deve ficar 100% verde (0 falhas) e entrar na CI de `homolog`, ao lado do `chromium-api`.
3. Smoke novo em `pnpm run homolog:smoke`: `GET /api/v1/metricas/O3` e `/S1` pela origem do web (200) e verificação de que o título não tem "Dados fictícios".
4. PR e dev continuam em `mock`; o E2E padrão fica no grupo mock e o `chromium-api` roda em `homolog`.
