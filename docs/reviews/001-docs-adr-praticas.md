---
contrato: 0
---
# Code review — 001 · documentação: ADR 0002, ADR 0003, ADR 0001 (rev.), plano rev. 3 e práticas (K-018, K-015)

- Data: 2026-10-09 · Revisor: tech-lead · Autores: software-architect (ADRs, plano), tech-lead (práticas; revisado pelo arquiteto)
- Referências: ata `docs/alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md` (D1–D10, D13, D15), `docs/engineering/praticas.md`
- Escopo: `docs/architecture/adr/0002-monorepo-pacotes-compartilhados.md`, `docs/architecture/adr/0003-orcamento-de-performance.md`, `docs/architecture/adr/0001-stack-front-dashboard-mock.md` (marcação de substituição), `docs/architecture/features/dashboard-mock.md` (rev. 3), `docs/engineering/praticas.md` (v1 → v2)

## Parecer
**Aprovado**, com 3 ajustes recomendados (não bloqueiam) nas regras de lint da ADR 0002, que são mudança de decisão e por isso ficam com o arquiteto (via Jarvis). Não alterei as ADRs.

## Conferência contra a ata
| Ponto | Ata | ADRs / plano | Situação |
|---|---|---|---|
| Nomes de pacote | D2: `contratos`, `metricas` (`core`, `businessmap`, `acelerato`), `mock`, `server`, `web`, `e2e`, escopo `@metricas-dspd/*`, TS-fonte | ADR 0002, plano 2.1, ADR 0001 rev. | consistente |
| Momento e critério da extração | D3: após review e QA da fase A, antes da fase B; `git mv` + imports; testes verdes e mesmo hash | ADR 0002 "Procedimento" (linha de base, correção prévia de `CRITERIOS_MOCK`, commit mecânico, aceite) | consistente; mais detalhado que a ata |
| Branches | D4 | ADR 0002 contexto e procedimento | consistente |
| Spec movida | D10: `docs/ux/dashboard-metricas/especificacao.md` | ADR 0002 passo 5 | consistente |
| Orçamento | D1 + números da ata: inicial < 200 KB gz, LCP < 2,0 s, métrica < 50 ms p95, painel < 300 ms, filtro < 100 ms / painel < 500 ms, geração < 500 ms | ADR 0003 F1, F4–F6, C1, C3, C4 | consistente |
| D6 (lint, build, laço, gerador 1,5 s, `VISAO_GERAL`, frio) | ata | ADR 0003 "Itens fora do orçamento" e C2; plano seção 6/8 | consistente |
| Medições | ata seção 2 | ADR 0003 "Medições reais" | mesmos números (C1 309–422 ms, O1 a frio 554 ms, `VISAO_GERAL` 655 ms, 64 testes) |
| Paridade mock × MySQL, container | D15 | ADR 0002 forças; ADR 0003 condições de medição | consistente |

## Export raiz `.` de `@metricas-dspd/metricas` e a regra "BusinessMap e Acelerato nunca se misturam"
**Posição do tech-lead: aceitável, com condições.**

Li `web/src/lib/metrics/calcular.ts` e `visaoGeral.ts` (estado atual da fase A). `calcularMetrica` só despacha por `MetricaId` para o domínio certo. `calcularVisaoGeral` chama as funções de BM com `ContextoBM` e as de AC com `ContextoAC`, em chamadas separadas, e monta os níveis em blocos com `fonte: 'BusinessMap'` / `fonte: 'Acelerato'`; `statusNivel` agrega só indicadores do mesmo nível; a Espera invisível devolve quatro estatísticas lado a lado (FL1, FL2, FL3 do BM e SUST do Acelerato), cada uma calculada no seu domínio. Nenhuma amostra, percentil, histograma ou previsão combina dados das duas fontes. É orquestração e composição, não cálculo misto: não fere a regra.

Condições (já incorporadas ao `praticas.md`, seção 1):
1. A raiz é o **único** código que conhece os dois domínios, e só pode despachar e compor resultados já calculados, cada bloco com sua `fonte`.
2. Proibido na raiz: criar amostra, concatenar valores, calcular estatística, ou derivar indicador (soma, média, status) a partir de resultados das duas fontes juntos. Exemplo do que seria violação: um "status geral" único somando alertas de BM e AC, ou uma Espera invisível "consolidada".
3. Como o lint não enxerga o conteúdo das funções, isto é item obrigatório do review (checklist 3) em qualquer mudança em `calcular.ts`/`visaoGeral.ts`.

Observação menor para o review de K-004 (não é desta revisão): `dataCorte` vem de `bm.hojeIso`. Correto enquanto os dois contextos recebem o mesmo `hoje`; vale um teste que garanta `bm.hojeIso === ac.hojeIso` na montagem do contexto.

## Ajustes recomendados (ADR 0002 — decisão do arquiteto)
| # | Arquivo:linha | Problema | Sugestão | Severidade |
|---|---|---|---|---|
| 1 | `docs/architecture/adr/0002-monorepo-pacotes-compartilhados.md:58` | Diz que a restrição da orquestração é garantida por "regra de lint abaixo e revisão de código", mas nenhuma linha da tabela de lint cobre `packages/metricas/src/*.ts` (raiz). Na prática só o review garante. | Ou trocar o texto para "revisão de código", ou adicionar regra: `core`, `businessmap` e `acelerato` não importam a raiz (`../index`, `../calcular`, `../visaoGeral`, `@metricas-dspd/metricas`), evitando ciclo e cruzamento via raiz. Prefiro a regra. | recomendado |
| 2 | `docs/architecture/adr/0002-monorepo-pacotes-compartilhados.md:103` | `core` proíbe `@metricas-dspd/metricas/*`, mas o padrão não pega o export raiz `@metricas-dspd/metricas`. | Usar o padrão `@metricas-dspd/metricas` e `@metricas-dspd/metricas/*` (ou `@metricas-dspd/metricas*`). | recomendado |
| 3 | `docs/architecture/adr/0002-monorepo-pacotes-compartilhados.md:106` | No mock, a regra BM × AC cobre só import entre as pastas do próprio mock. `mock/src/acelerato/**` ainda poderia importar `@metricas-dspd/metricas/businessmap` (e vice-versa), o que é o mesmo cruzamento por outro caminho. | Estender: `mock/src/businessmap/**` não importa `@metricas-dspd/metricas/acelerato`; `mock/src/acelerato/**` não importa `@metricas-dspd/metricas/businessmap`. | recomendado |

Nenhum item bloqueia: as regras valem a partir da extração (D3) e podem entrar na própria criação do `eslint.config.js` da raiz.

## Ajustes feitos pelo tech-lead
`docs/engineering/praticas.md` v2 (sem mudança de decisão; só alinhamento às ADRs aceitas):
- Seção 1: tabela de pacotes com os nomes `@metricas-dspd/*` e dependências iguais à ADR 0002 (corrigido: `mock` depende de `contratos` e `metricas`; `web` usa `metricas`/`mock` só em `web/src/data/mock/**` por `import()` dinâmico; `server` usa `mock` só no seed e na paridade); regra da orquestração na raiz; import entre pacotes pelo nome; links para ADR 0001 e 0002.
- Seção 2: opções do `tsconfig.base.json` (inclui `erasableSyntaxOnly`: sem `enum`/`namespace`); getters locais de `Date` e `Math.min/max` com spread como **[lint]**; calendário como parâmetro explícito.
- Seção 4: limites de CI dos testes de tempo (C2, 3× C3/C4); memoização sem mudar resultado.
- Seção 5: orçamento aponta para a ADR 0003 com os números reais (removido o texto provisório "até ser aceita" e o "200 KB por rota", que estava errado: 200 KB é o bundle inicial; rota é 60 KB, alerta); regra de exceção da ADR.
- Seção 7: `check` na raiz após a extração; bundle e testes de tempo na definição de pronto.
- Seção 9: procedimento de extração resumido e apontando para a ADR 0002.
- Seção 10: script `size` (F6–F9), Lighthouse CI e projeto `perf` (F10, F1–F5, C5, C6).

## Pendências para o Jarvis
- Levar os ajustes 1 a 3 ao arquiteto (decidir antes da extração, para entrarem no `eslint.config.js` da raiz).
- Nenhuma decisão de produto nova.
