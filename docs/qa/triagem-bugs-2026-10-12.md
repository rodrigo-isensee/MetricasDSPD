---
contrato: 0
---
# Triagem de bugs ligados a métricas e telas (2026-10-12)

Base: develop atual (a6012e8). Método: leitura de código, `e2e/scripts/verificar-fronteiras.mjs` (leve) e histórico git. Nenhum E2E rodado; "corrigido" abaixo significa corrigido no código, não revalidado em navegador.

## Bug 001 (regra inviolável): CORRIGIDO
- O bug original apontava `web/src/mock/acelerato/gerador.ts:31`, caminho que não existe mais. O mock foi movido para `packages/mock`.
- `CRITERIOS_MOCK` agora está em arquivo neutro: `packages/mock/src/criterios.ts`, importado em `packages/mock/src/acelerato/gerador.ts:31` e `packages/mock/src/businessmap/gerador.ts`.
- Busca por imports cruzados em `packages/metricas/src/{acelerato,businessmap}` e `packages/mock/src/{acelerato,businessmap}`: nenhum import cruzado (fora de testes).
- `e2e/scripts/verificar-fronteiras.mjs` retorna "OK: nenhuma violação de fronteira".
- Lint de fronteira presente: `eslint.config.js` linhas ~260-355 (no-restricted-imports bloqueia `**/acelerato`, `**/businessmap`, `@metricas-dspd/{metricas,mock}/{acelerato,businessmap}` entre os dois lados; `amostra.ts` com regra própria).
- Ressalva: `packages/metricas/src/core/*` cita "acelerato" em `regras.ts`, `amostra.ts`, `calibracao.ts` (e testes). Não é import cruzado; vale o tech-lead olhar se `core` precisa conhecer a fonte. Não é violação detectada.

## Por bug
| Bug | Reproduz? | Evidência | Sev. | Resp. |
|---|---|---|---|---|
| 001 | Não | acima | média | (node-backend) |
| 002 | Não | commit 3d65829 (K-039): `CartaoO4.tsx:52-53` só usa `insuficiente` com `faixa.n > 0` | média | - |
| 003 | Não (provável) | 3d65829; `BarraFiltros.tsx:147-152` (`contents` + `md:sticky top-[var(--h-cabecalho)]`); revalidar em navegador | média | react-frontend |
| 004 | Não | `filters/codec.ts:46-47, 240-249`: todos = lista vazia, parâmetro omitido. Vírgula `%2C` na URL não verificada | baixa | - |
| 005 | Não (provável) | `AppShell.tsx:101` usa a classe `alvo` no link da marca (3d65829); medir 44 px a 375 px | baixa | react-frontend |
| B12-001 | Não | `CartaoO2.tsx:39-52`: usa `maisAcima` (item acima do P95), não o mais velho geral | média | - |
| B12-003 | Não | `CartaoBloqueados.tsx:38` `codigo="BLOQUEADOS"` -> `metrica-BLOQUEADOS` (`CartaoMetrica.tsx:155`) | baixa | - |
| B3-001 | Não | `SustentacaoPage.tsx:43` renderiza `FaixaAtencao` (S2/S1) | média | - |
| B3-002 | Não | `VisaoGeralPage.tsx:34-37` `destinoAlerta` acrescenta `?cadencia=semanal` para O10/O12 | média | - |
| B3-003 | Parcial | `fmtData` (`lib/formatar.ts:15`) já mostra o ano, então a ambiguidade acabou. Resta decisão de UX: o texto "Recorte fixo, igual ao dos painéis..." (`VisaoGeralPage.tsx:235`) difere do plano VG-11 | baixa | react-frontend (após decisão) |
| 009 | Parcial | Lighthouse já lista `/preferencias` e `/dados` (`lighthouserc.cjs:7`); CLS de `/` corrigido em e7080e1; C6 passou a usar a mediana. Flakiness da C6 sob carga não confirmada | média | react-frontend |
| IR-001 | Não | fechado por K-061 (no próprio bug) | média | - |
| IR-002 | NÃO CONFIRMADO | `FrescorFonte.tsx:42` tem o ramo `isError`, com retry:false em `App.tsx:17`; `simulacao.ts:112,140` lança o erro. Só o CT-34 (`integracao-real.spec.ts`) confirma, e não foi rodado. Último registro: aberto após K-061/K-062 | média | react-frontend |
| MC-001 | Não | corrigido em 51dc4b5 | média | - |

## Cartões propostos
1. `[bug]` Revalidar em navegador e fechar o lote K-039/K-061 (003, 005, 004 com `%2C`, B12-001, B12-003, B3-001, B3-002): tarefa de QA, sem código. Rodar `responsivo`, `filtros`, `estados`, `b3-sust-ei-vg` e `b12` num único ciclo e atualizar os arquivos de bug com "corrigido".
2. `[bug]` IR-002 (react-frontend, média): rodar CT-34; se ainda falhar, corrigir o ramo `isError` do estado de coleta com `?mock=coleta-erro:bm`.
3. `[bug]` B3-003 + 009 (react-frontend, baixa/média): decidir o texto do recorte da Visão Geral (aceitar o atual e atualizar VG-11) e confirmar a estabilidade da C6 em 3 execuções isoladas; fecha o resíduo.

Nenhum bug aberto é bloqueante pela regra de "BusinessMap e Acelerato nunca se misturam".
