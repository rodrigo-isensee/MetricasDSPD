# Plano de testes - Dashboard de métricas com dados mockados

Links: especificação de UX `docs/ux/dashboard-metricas/especificacao.md` (seção 10 = critérios de aceite C1 a C104) · plano técnico `docs/architecture/features/dashboard-mock.md` · ADR `docs/architecture/adr/0001-stack-front-dashboard-mock.md` · pedido `docs/pedidos/001-dashboard-mock.md` · regras invioláveis `CLAUDE.md`. Não há contrato de API (só front-end; a "API" é a interface `FonteMetricas` em `web/src/contracts`).

Versão 2 (ver "Revisão 2 — mudanças" abaixo) · 2026-10-09 · autor: `qa-engineer` · status: plano; ferramentas de medição prontas; nenhum E2E de tela executado (o app está na fase A).

## Revisão 2 — mudanças

Versão 2 · 2026-10-09 · autor: `qa-engineer` · cobre a spec rev. 2 (critérios C1 a C111), a ata `docs/alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md` (D1 a D15), os ADRs 0002 (monorepo) e 0003 (orçamento de performance) e `docs/engineering/praticas.md`. Onde esta seção diverge do restante do documento, **esta seção vale**. O restante (seções 1 a 12) segue como a versão 1, com as substituições listadas em R2.2.

### R2.1 Resumo
- QA entra **por cartão** da fase B (D11, D12): a matriz R2.5 diz exatamente o que o Jarvis aciona em cada cartão. Cada acionamento roda os casos específicos do cartão + o **portão transversal G** (16 casos) na rota do cartão.
- Performance deixa de ser "plano" e vira suíte executável: casos PERF-01 a PERF-16 (R2.6), com os itens que bloqueiam a entrega marcados.
- Extração para pacotes (D3): casos EXT-01 a EXT-08 (R2.7), incluindo a igualdade do hash da base mock.
- Regra BM x AC: casos FRONT-01 a FRONT-06 (R2.8). **Achado imediato:** `web/src/mock/acelerato/gerador.ts:31` importa `../businessmap/catalogos` (bug `docs/qa/bugs/001-gerador-acelerato-importa-businessmap.md`).
- Casos novos: 8 de funcionalidade (NAV-13, FIL-23, FIL-24, TAT-15, EST-07, SUS-18, ST-14, A11Y-20), mais PERF, EXT e FRONT à parte. Casos substituídos: FIL-21 (por FIL-23) e INV-09 (por TAT-15). Casos reescritos: 15 (R2.2); FIL-21 e INV-09 ficam no texto da v1 só como histórico e não são executados.
- Total de casos do plano após a rev. 2: 207 da v1 -> 213 de funcionalidade (+8 novos, -2 substituídos) + 16 PERF + 8 EXT + 6 FRONT = **243**.

### R2.2 Critérios novos (105 a 111) e editados, e os casos que os cobrem
| Crit. | Mudança na spec rev. 2 | Caso (novo ou reescrito) | Nível | Prio |
|---|---|---|---|---|
| 6 | Links entre painéis usam filtros de fluxo **da sessão** (memória, não `localStorage`); Estratégico remove `equipe`, `tipo` e `periodo` fora de `6m`/`12m`; voltar ao fluxo restaura | **NAV-06 (reescrito):** Operacional `equipe=fluig&tipo=melhoria&periodo=4s` -> Estratégico (URL limpa dos três) -> Operacional (`equipe`, `tipo`, `periodo` voltam); `/sustentacao` e `/` saem limpos; recarregar zera a memória; `localStorage` não guarda filtros | E2E | P1 |
| 24 | Inválido avisa; **não aplicável** é removido em silêncio | **FIL-09 (reescrito)** só o inválido (`equipe=xyz`, `equipe=totvs` no fluxo, `equipe=erp-protheus` em `/sustentacao`) + **FIL-24 (novo):** não aplicável (`tipo=` em `/sustentacao`, `s3=` no fluxo, `cadencia=` fora do Operacional, `o3=` em outro painel, `prioridade=` no fluxo) some da URL via `replaceState`, sem `aviso-filtros-invalidos` e sem nova entrada de histórico | E2E+U | P1 |
| 25 | Aviso de consolidação sempre que o resultado soma 2 ou mais equipes (inclui "Todas" e todas marcadas), com N real (6 no fluxo, 3 na Sustentação); não aparece com 1 equipe nem no Estratégico | **FIL-10 (reescrito):** N confere com `opcoesFiltro`; casos 0 filtro (N=6), 2 marcadas, todas marcadas, 1 (ausente), Estratégico (ausente), `/sustentacao` (N=3 e N=1), `/espera-invisivel` (3 blocos de fluxo + bloco próprio da Sustentação) | E2E | P1 |
| 26 | Início do histórico vem da fonte | **FIL-11 (reescrito):** o limite inferior e a data da mensagem são lidos de `opcoesFiltro` (via UI e `useOpcoesFiltro`), nunca fixos no teste; a mensagem "Há dados a partir de {data}" traz a data da fonte; fronteiras (início-1, início, intervalo de 6 e 7 dias, `ate` = corte e corte+1) | E2E+U | P1 |
| 31 | 5 seções com `h2` e id (`tempo`, `fluxo`, `compromissos`, `backlog`, `qualidade`); "Ir para" leva ao `h2` e foca nele; O12 só em Compromissos; EI-FL1 na seção Tempo | **OP-02 e OP-22 (reescritos):** ordem de DOM O3, O9, EI-FL1, O4, O12, O10, O7, O15, O18; O12 fora de Fluxo; foco no `h2` | E2E | P1 |
| 52 | T7 publica percentis só com 20+ frentes **na janela de 12 semanas** | **TAT-09 (reescrito):** consolidado padrão publica (mock garante 20+ frentes, GER-05); filtro estreito cai em 6.3.1 | E2E+U | P1 |
| 55 | E1 com menos de 20 projetos nas últimas 12 semanas: texto 6.3.1, pontos mantidos | **EST-02 (reescrito)**, ver EST-07 | E2E+U | P1 |
| 62 | S1 em "h úteis" (P1 a P3) e "dias úteis" (P4, P5); alvos da tabela do cartão (P1 0,25 e 4 h; P2 0,5 e 8; P3 2 e 16; P4 0,5 e 5 dias; P5 1 e 10 dias) | **SUS-05 (reescrito)**: unidade fixa por prioridade, formato (vírgula, até 2 casas em horas, 1 em dias, "dia útil" singular até 1,0) | E2E+U | P1 |
| 66 | S6 = exatamente os 5 valores do briefing 3.4 | **SUS-09 (reescrito):** conjunto exato lido do domínio de `contratos/comum` (`MOTIVOS_ENCERRAMENTO`), 5 valores, rótulos e ordem | E2E | P1 |
| 72 | Unidades: dias úteis no fluxo; h úteis (P1-P3, S4, EI-SUST) e dias úteis (P4, P5) na Sustentação; nunca minutos nem horas corridas | **CALC-01 e SUS-14 (reescritos)** + SUS-18 | E2E | P1 |
| 78 | Janela de 12 semanas em todas as granularidades; sem "12 meses (provisória)" | **CALC-07 (reescrito)** + EST-07 | E2E+U | P1 |
| 94 | axe: zero sérias/críticas bloqueiam; moderadas e leves são relatadas | **A11Y-01 a A11Y-04 (reescritos)** + A11Y-20 | A11Y | P1 |
| 105 | Texto 6.3.1 em E1, T7, EI-FL2, EI-FL3 (e Visão geral), visual informativo, sem `role="alert"`; idêntico no painel, em `/espera-invisivel` e na Visão geral; sem "provisória" | **EST-07 (novo):** compara o texto dos 3 lugares; verifica ícone "i" (não triângulo), `role="meter"` presente, ausência de `role="alert"`, ausência de sugestão de mudar janela/período, linhas 1 a 3 com `{n}` e `{projetos\|frentes}` corretos; "Remover filtro" só com filtro ativo; Visão geral mostra "Amostra insuficiente ({n} de 20 projetos)" e não conta como "Atenção"; `grep` do DOM por "provisória" nas 8 rotas | E2E | P1 |
| 106 | Sustentação sem "min" nem horas corridas | **SUS-18 (novo):** varredura regex de `\bmin\b\|minutos?\|horas corridas\|h corridas` em `/sustentacao`, EI-SUST em `/espera-invisivel` e Visão geral (bloco Sustentação), + unidades por cartão (S1 P1-P3 "h úteis", P4-P5 "dias úteis"; S4 e EI-SUST "h úteis"); alvos de S1 iguais à tabela do cartão | E2E | P1 |
| 107 | Estratégico com `equipe=`/`tipo=`: sem quebrar, sem chip, sem aviso de erro, URL limpa, `aviso-filtros-nao-aplicaveis` só com valores guardados; ao voltar, valores reaparecem; `prioridade=` e `cadencia=` fora de seus painéis removidos em silêncio | **FIL-23 (novo, substitui FIL-21):** (a) link direto com `equipe=fluig&tipo=melhoria` -> sem aviso de erro, URL limpa, aviso "não aplicam" aparece (valores guardados por link compartilhado); (b) abrir o Estratégico sem passar pelo fluxo e sem valores -> sem o aviso; (c) ida e volta preserva; (d) `periodo=4s` vindo do Operacional -> Estratégico usa 12m e a volta restaura 4s; `periodo=6m` vale | E2E | P1 |
| 108 | T5 ordena por volume (desempate alfabético) em ambas as abas; texto "Ordem por volume de demanda. Não é um ranking."; "Por área" sem selo, destaque nem ordem por parcela de falha; "Foco da meta" só em "Por sistema" | **TAT-15 (novo, substitui INV-09):** ordem das linhas = ordem decrescente do volume lido da tabela; empate alfabético; texto exato; "Por área" sem `Foco da meta` | E2E | P1 |
| 109 | `mock=` conforme 6.6 | **ST-14 (novo)**, tabela abaixo; ST-12 e ST-03 ajustados (erro do cartão falha em toda tentativa) | E2E | P1 |
| 110 | testids, ids e chaves da convenção L5 existem | **NAV-13 (novo)**, lista abaixo | E2E | P1 |
| 111 | Relatório de axe com violações moderadas/leves por tela e tema; cada uma corrigida ou justificada | **A11Y-20 (novo):** o spec de axe grava `e2e/test-results/axe-relatorio.json` (tela, tema, id, impacto, nós) e anexa ao relatório; o QA copia as informativas para `docs/qa/` com status (corrigida/justificada). Falha se existir informativa sem registro de justificativa em `docs/qa/axe-justificativas.md` | A11Y | P2 |

**ST-14 (mock, critério 109)** — um teste por linha da tabela 6.6, todos por URL:
| Subcaso | Verificação |
|---|---|
| `mock=carregando` | todos os cartões em `estado-carregando-*`; permanecem assim depois de aguardar um período sem polling (o teste espera um evento de rede ocioso, não tempo) e após mudar filtro; esqueleto só após 150 ms (caso de componente com relógio falso, ST-11) |
| `mock=erro` | erro de painel (ST-04) |
| `mock=vazio` | todos os cartões em `estado-vazio-*` e aviso único no topo |
| `mock=erro:o3` e lista `erro:o3,t1` | só os cartões da lista falham; "Tentar de novo" falha de novo em todas as tentativas (3 tentativas) |
| `mock=erro-uma-vez:o3` | falha na primeira carga; "Tentar de novo" recupera; lista por vírgula; recarregar a página falha de novo (estado é por carga) |
| ids inexistentes (`erro:zzz`, `erro:s1` em `/operacional`) e `mock=xyz` | ignorados sem aviso, sem `aviso-filtros-invalidos`, sem erro no console |
| Persistência | mudar filtro com `mock` na URL mantém `mock`; links da navegação e "Copiar link" **não** o incluem; `mock` nunca aparece em chips/avisos |
| Ids válidos da Visão geral | `erro:atencao`, `erro:nivel-tatico`... afetam só o bloco |
| Domínio de ids | cada id de `IDS_MOCK` (`e2e/fixtures/constantes.ts`) provoca erro no cartão de mesmo código na rota correta (parametrizado) |

**NAV-13 (critério 110):** existem `metrica-BLOQUEADOS`, `base-BLOQUEADOS`, `tabela-BLOQUEADOS` e `estado-vazio-BLOQUEADOS` (quando vazio); `metrica-EI-FL1` a `EI-SUST` com `base-*` e `amostra-insuficiente-*` quando aplicável; `ei-cliente-{fl1|fl2|fl3|sust}`, `ei-time-*`, `ei-indice-*` com os 4 níveis em `/espera-invisivel` e só o do nível nos painéis; `painel-{slug}` dos 7 slugs; `nivel-{operacional|tatico|estrategico|sustentacao}`, `faixa-atencao`, `ei-resumo`; `aviso-consolidado`, `aviso-filtros-invalidos`, `aviso-filtros-nao-aplicaveis`, `aviso-criterio`; âncoras `#bloqueados`, `#ei-fl1` a `#ei-sust`, `#tempo` a `#qualidade` rolam e focam; `seletor-tema` com nome acessível "Tema" e opções Claro/Escuro/Sistema; `localStorage['metricas-dspd:tema']` recebe `claro|escuro|sistema`.

**FIL-12 (ajuste L9):** tabela 2.2 completa, incluindo EI por nível (EI-FL2 "não afetado por Tipo"; EI-FL3 "não afetado por Equipe e Tipo"; EI-SUST "Não afetado por: Prioridade"), BLOQUEADOS e S1 a S7 (equipe SSSC recorta; Prioridade é dimensão em S1 a S3). Parametrizado a partir de uma tabela de fixture `e2e/fixtures/aplicabilidade.ts` (a ser escrita junto do cartão K-006, derivada da tabela 2.2).

### R2.3 Lacunas L1 a L16 (resolução na spec rev. 2)
| # | Resolução na spec rev. 2 | Efeito no plano | Estado |
|---|---|---|---|
| L1 | J1: 12 semanas em tudo; seção 6.3.1 | CALC-07, EST-02, TAT-09, EI-01, EI-06, VG-05 reescritos; E1/EI-FL3 em "insuficiente" é **esperado**; caminho feliz de E1 só por unitário com fixture de 20 projetos | fechada (pergunta 2 segue com o usuário) |
| L2 | J2: horas úteis; 8 h = 1 dia útil; exibição por prioridade | SUS-05, SUS-13, SUS-14, CALC-01, SUS-18 | fechada (pergunta 11, P1 em plantão, segue com o usuário) |
| L3 | S6 = 5 valores do briefing 3.4 | SUS-09 lê do domínio | fechada |
| L4 | O12 só em Compromissos; 5 seções com `h2` e id | OP-02, OP-22 | fechada |
| L5 | Convenção completa (spec 10) | NAV-13; constantes em `e2e/fixtures/constantes.ts` e page objects `e2e/pages/` | fechada |
| L6 | Aviso de consolidação com 2+ equipes, inclusive "Todas" | FIL-10 | fechada |
| L7 | Memória de sessão dos filtros de fluxo; Estratégico remove o não aplicável | NAV-06, FIL-23 (FIL-21 removido) | fechada |
| L8 | Não aplicável = silencioso | FIL-24, FIL-23 | fechada |
| L9 | Tabela 2.2 cobre EI, BLOQUEADOS, S1-S7 | FIL-12 | fechada |
| L10 | T5 sem ranking | TAT-15 (INV-09 removido) | fechada |
| L11 | Requisito 9.2: tipo < 20 no consolidado padrão (12 semanas) | GER-05 (U) e CALC-05 (E2E) viram pré-requisito do cartão K-006; se GER-05 falhar, bug do gerador, não da UI | fechada na spec; **depende de verificação no gerador** |
| L12 | T4: soma de chegadas e saídas | TAT-07 | fechada (alternativa conservadora segue como pergunta 20) |
| L13 | `mock` definido (6.6) | ST-14, ST-03, ST-09, ST-12 | fechada |
| L14 | Texto de que Incidente/Requisição do BM não têm relação com chamados do Acelerato | INV-11 + FIL-20 verificam o texto da dica e do glossário da `/ajuda` | fechada |
| L15 | Início do histórico vem da fonte | FIL-11 | fechada |
| L16 | axe: sérias/críticas bloqueiam; demais relatadas | A11Y-01 a A11Y-04, A11Y-20 | fechada |

### R2.4 Outros ajustes
- **Estados e atributos para medição e teste (R2.9):** o plano passa a exigir `data-estado` em cada `metrica-*`.
- **ST-01 (rev.):** CLS do esqueleto medido por PERF-02, não por contagem manual. **ST-03 (rev.):** use `erro-uma-vez:o3` para provar a recuperação e `erro:o3` para provar que a falha persiste.
- **CALC-14 / CALC-13:** continuam; o hash da base também é conferido em `TZ=UTC` e `Asia/Tokyo` (EXT-06).
- **A11Y-01 e INV-01..05 rodam por cartão (portão G),** na rota do cartão e nos dois temas; a rodada completa das 9 telas x 2 temas é o portão final.
- **Marcador de critério (CALC-08):** parametrizado por métrica na rota do cartão; 02/03/2026 para fluxo e 01/06/2026 para Sustentação.

### R2.5 Matriz: cartão da fase B -> casos (quando o Jarvis aciona o QA)
**Portão G (16 casos, rodar em toda rota de cartão, nos 2 temas):** CALC-01, CALC-02, CALC-03, CALC-04, INV-01, INV-02, INV-03, INV-04, INV-05, A11Y-01 (rota x 2 temas), A11Y-08, A11Y-09, A11Y-16, NOTA-01, NOTA-02, NOTA-03. Mais, em todo cartão: `npm run check`, `npm run build`, `npm run size` (PERF-06/08/09) e `npm run fronteiras` (FRONT-01..04) como pré-condição.

| Cartão | Escopo | Casos específicos do cartão (E2E/A11Y; unitários ficam com o `react-frontend`) | Nº específicos | + G | Total |
|---|---|---|---|---|---|
| **K-022** shell e filtros | cabeçalho, navegação, rotas, 404, tema, `/ajuda`, barra de filtros, URL, `?mock=` | NAV-01..05, NAV-07..13 (12, sem NAV-06 completo), AVI-01..05, FIL-01..20 (20), FIL-22, FIL-24, ST-04, ST-10, ST-12, ST-13, ST-14 (parte `carregando`/`erro`/`vazio`/inválido com placeholders), A11Y-05, A11Y-06, A11Y-07, A11Y-10, A11Y-12, A11Y-13, A11Y-14, A11Y-15, A11Y-17, A11Y-19, RESP-01, RESP-02, RESP-03, RESP-05, RESP-08, BLD-01, BLD-02, BLD-03, PERF-01 (smoke de LCP em `/`), PERF-06 | 12+5+22+7+10+5+3+2 = **66** | G não se aplica (sem cartões); roda A11Y-01 só em shell/404/`/ajuda` | **66** |
| **K-006** FL1 diário (O2, BLOQUEADOS, O1) | O1 a O4 do diário e bloqueados | OP-01, OP-03, OP-04, OP-05, OP-06, OP-07, OP-08, OP-09, OP-21, OP-24, ST-01, ST-02, ST-03, ST-05, ST-06, FIL-10, FIL-12, CALC-05 (Operacional), CALC-17, NAV-06 (fluxo), NAV-07 (`#o2`, `#bloqueados`), PERF-04/05 (troca de filtro no diário) | **22** | 16 | **38** |
| **K-023** FL1 restante (semanal: O3, O9, EI-FL1, O4, O12, O10, O7, O15, O18) | semanal inteira | OP-02, OP-10..OP-20 (11), OP-22, OP-23, EI-04 (FL1), EI-01 (parte FL1), EI-07 (FL1), CALC-05, CALC-06, CALC-08, FIL-12, FIL-14, ST-03 (`erro:o3`), ST-09 (parte), PERF-02/04/05/15 na rota semanal, PERF-08 | **27** | 16 | **43** |
| **K-007** FL2 (T1 a T5, T7, T9, EI-FL2) | Tático | TAT-01..06, TAT-08, TAT-09, TAT-10, TAT-15 (10), EI-04 (FL2), EI-06 (FL2), EI-07 (FL2), CALC-05 (Tático), CALC-06, CALC-07, CALC-08, FIL-12, ST-09 (parte), PERF-04/05/02 | **20** | 16 | **36** |
| **K-024** FL3 (E1 a E3, EI-FL3) | Estratégico | EST-01..05, EST-07 (6), EI-04 (FL3), EI-06 (FL3), EI-07 (FL3), CALC-07, FIL-23, NAV-06 (ida e volta ao Estratégico, completo), FIL-12, ST-09 (parte), PERF-02 | **14** | 16 | **30** |
| **K-008** Sustentação (S1 a S7, EI-SUST) | Acelerato | SUS-01, SUS-02, SUS-04..SUS-11 (8), SUS-14, SUS-16, SUS-17, SUS-18, FIL-08, FIL-12, INV-06, INV-11, EI-04 (SUST), CALC-05 (Sustentação), CALC-08 (01/06/2026), ST-09 (parte), FRONT-01..06 (revalidar), PERF-02/04/05 | **26** | 16 | **42** |
| **K-025** Espera invisível (`/espera-invisivel`, EI compacto) | EI nos 4 níveis | EI-01, EI-02, EI-03, EI-05, EI-06, EI-07, EI-08, EI-09, EST-07 (comparação painel x `/espera-invisivel`), CALC-06 (4 granularidades separadas), FIL-12 (EI), FIL-10 (blocos), ST-09 (`erro:ei-*`) | **13** | 16 | **29** |
| **K-026** Visão geral | `/` | VG-01, VG-02, VG-03, VG-05, VG-06, VG-07, VG-10, VG-11, EST-07 (Visão geral), FIL-... ST-09 (`erro:atencao`, `erro:nivel-*`), AVI (`/`), PERF-01 (F1 completo em `/`) | **12** | 16 | **28** |
| **Portão final** (após K-026) | tudo junto | XBR-01, A11Y-01 (18 execuções), A11Y-02, A11Y-03, A11Y-04, A11Y-11, A11Y-18, A11Y-20, RESP-04, RESP-06, RESP-07, CALC-09 (build `dist-alt`), CALC-14, ST-07, ST-08, ST-09 (completo), INV-07, INV-08, NAV-12, PERF-01..16 completos, EXT-02..07 (revalidação), FRONT-01..06 | **19 + PERF 16 + FRONT 6** | — | **41** |

Contagem por cartão = casos que o QA executa naquele acionamento (soma específicos + portão G). Não somar o total das linhas: casos que repetem entre cartões (por exemplo FIL-12, ST-09, PERF-04/05) são contados em cada um onde são executados. Casos únicos do plano: 243 (R2.1). Os unitários (CALC-10 a CALC-16, GER-01 a GER-09, TAT-07, TAT-11 a TAT-14, SUS-03, SUS-12, SUS-13, SUS-15 etc.) continuam do `react-frontend` e são exigidos como pré-condição de cada cartão (regra 7 da seção 7: um teste de fixture por regra do briefing 4.2).

**Dependências de dados por cartão:** K-006 exige GER-05 (a) e (i) (tipo < 20 no consolidado padrão, itens acima do P95 hoje); K-007 exige (b) e (c) e frentes >= 20 na janela; K-024 exige (f), (g) e projetos concluídos < 20 na janela de 12 semanas com pelo menos 12 meses de projetos; K-008 exige (d), (h) e chamados em horas úteis.

### R2.6 Performance (ADR 0003): casos e o que bloqueia
Ferramentas prontas em `e2e/`: `npm run size` (F6 a F9), `npm run test:perf` (F1 a F5, C5, C6), `npm run lighthouse` (F10), e `npm run perf:tudo`. O QA registra os números reais (mediana, p95, primeira medição a frio, máquina e versões) em `docs/qa/` e na ata do checkpoint.

| ID | Item ADR 0003 | O que mede | Orçamento | Bloqueia a entrega | Como | Quando |
|---|---|---|---|---|---|---|
| PERF-01 | F1 | LCP em `/`, carga fria, desktop 1366x768, 20 repetições (p95) | < 2,0 s | **sim** | `perf/perf.spec.ts` + `perf/lcp.ts` | smoke em K-022; completo na pré-entrega |
| PERF-02 | F2 | CLS nas 6 rotas | < 0,1 | **sim** | `perf/lcp.ts` (`layout-shift`) | cada cartão (na rota dele) |
| PERF-03 | F3 | INP das interações de filtro, abas, "Ver como tabela" | < 200 ms | **sim** | `PerformanceObserver('event')` | pré-entrega |
| PERF-04 | F4 | Troca de filtro: resposta visual, **com** latência do mock ligada, p95 de 20 | < 100 ms | **sim** | `perf/troca-filtro.ts` (`performance.mark`) | cada cartão |
| PERF-05 | F5 | Troca de filtro: painel inteiro atualizado, **sem** latência simulada, p95 de 20 | < 500 ms | **sim** | idem; exige o modo sem latência (R2.9) | cada cartão |
| PERF-06 | F6 | JS inicial gzip | < 200 KB | **sim** | `npm run size` | **todo cartão e todo PR** |
| PERF-07 | F7 | Chunk de cada rota (sem gráficos nem mock) gzip | < 60 KB | não (alerta) | `npm run size` | cada cartão |
| PERF-08 | F8 | Chunk de gráficos gzip, só em rotas com gráfico | < 130 KB | **sim** | `npm run size` | **todo cartão** |
| PERF-09 | F9 | Chunk mock + biblioteca fora do inicial (`import()` dinâmico) e tamanho | fora do inicial; < 120 KB | **sim** (fora do inicial); tamanho alerta | `npm run size` (`F9-inicial`) | **todo cartão** |
| PERF-10 | F10 | Lighthouse desktop, 6 rotas, mediana de 3 execuções | Performance >= 90 e Acessibilidade >= 95 | **sim** | `npm run lighthouse` | pré-entrega (e smoke em K-026) |
| PERF-11 | C1 | Geração da base + contexto, Node | < 500 ms | **sim** | reexecução do QA da medição da ata (`hash-base-mock` imprime `geracaoMs`; contexto pelo teste de tempo do pacote) | fase A (remedição de D6), extração |
| PERF-12 | C3 | Cálculo de uma métrica, filtros padrão, **inclusive a frio**, p95 | < 50 ms | **sim** | teste de tempo do pacote métricas (QA lê o valor impresso e repete 20x) | fase A (remedição de D6), cada cartão novo |
| PERF-13 | C4 | Painel inteiro incluindo `VISAO_GERAL` | < 300 ms | **sim** | idem | fase A (remedição), K-026 |
| PERF-14 | C5 | Heap JS após abrir todos os painéis | < 150 MB | não (alerta) | `perf.spec.ts` (CDP `JSHeapUsedSize`) | pré-entrega |
| PERF-15 | C6 | Tarefa longa única na thread principal | < 200 ms | **sim**, via F3/F5 | `PerformanceObserver('longtask')` | cada cartão |
| PERF-16 | alerta | LCP e INP com CPU 4x mais lenta | sem limite bloqueante | não (alerta) | `Emulation.setCPUThrottlingRate` | pré-entrega |

Regras de medição: build de produção (`vite build` + `vite preview`), Chromium do Playwright, cache limpo na carga fria, p95 com 20 repetições e a primeira medição (a frio) entra na amostra e é reportada à parte; filtros padrão e o pior filtro (período máximo); no CI usar os limites folgados dos testes do pacote (3x) e verificar o valor do orçamento na máquina de referência. Item que bloqueia e está fora vira bug de severidade alta para o `react-frontend` (ou exceção registrada na ADR 0003 com prazo, aprovada por arquiteto e tech-lead).

### R2.7 Extração para pacotes (D3 / ADR 0002): hash antes e depois
| ID | Cenário | Como | Prio |
|---|---|---|---|
| EXT-01 | **Linha de base** com a fase A aprovada: registrar hash da base, número de testes e bundle | `npm run hash-base -- --salvar ../docs/qa/evidencias/hash-base-aprovada.json`; `npm test` em `web/` (contar testes); `npm run size` | P1 |
| EXT-02 | **Depois do commit mecânico**: mesmo hash (base, BM e AC) e mesma semente/contagens | `npm run hash-base -- --comparar ../docs/qa/evidencias/hash-base-aprovada.json` (o script acha `packages/mock/src` sozinho); qualquer diferença reprova e a extração é desfeita, **nunca** se ajusta o hash | P1 |
| EXT-03 | Mesmo número de testes unitários e todos verdes (raiz, todos os workspaces) | `npm run check` na raiz; comparar contagem com EXT-01 | P1 |
| EXT-04 | Fronteiras por pacote (lint) e verificação independente | `npm run fronteiras`; mais um teste negativo (arquivo temporário que viola cada regra do ADR 0002 deve falhar o lint) fora do repositório | P1 |
| EXT-05 | Bundle depois da extração: F6, F8, F9 (gerador e biblioteca continuam fora do inicial; `sideEffects: false`) | `npm run build` + `npm run size` comparado ao EXT-01 (variação do inicial < 5%) | P1 |
| EXT-06 | Hash independente de fuso | `TZ=UTC` e `TZ=Asia/Tokyo` dão o mesmo hash (antes e depois) | P2 |
| EXT-07 | Correção prévia de `CRITERIOS_MOCK` (passo 2 do ADR, commit separado) não muda dados | hash antes e depois do commit separado idênticos; FRONT-01 passa a verde | P1 |
| EXT-08 | Memoização de D6 não muda resultado | hash da base idêntico e testes de métrica iguais antes e depois das otimizações; PERF-12/13 reexecutados | P1 |

A linha de base provisória (fase A em curso, **não** é a base aprovada): semente 20261009, `hashBase 924448d4`, `hashBusinessMap f780e90f`, `hashAcelerato 0113e077`, 5.788 cards, 6.062 chamados, geração 151 ms. Está salva em `docs/qa/evidencias/hash-base-fase-a.json`; a base aprovada deve ser regravada com `--salvar` quando o tech-lead aprovar a fase A.

### R2.8 Regra BM x AC (inclusive o gerador)
| ID | Cenário | Como | Prio |
|---|---|---|---|
| FRONT-01 | **O gerador do Acelerato não importa nada do BusinessMap** (nem catálogos, nem constantes, nem tipos), por caminho relativo, alias ou pacote; idem no sentido contrário | `npm run fronteiras` (lê imports estáticos, dinâmicos e `export from` de `mock/acelerato` e `mock/businessmap`) | P1 |
| FRONT-02 | `metricas/businessmap` e `metricas/acelerato` não se importam (nem por `@metricas-dspd/metricas/<outro>`) | idem | P1 |
| FRONT-03 | Painel não calcula: `web/src` (fora de `data/mock`) não importa `metricas` nem `mock` | idem | P1 |
| FRONT-04 | `Math.random`, `Date.now`, `new Date()` sem argumento e getters locais fora de `metricas` e `mock` | idem | P2 |
| FRONT-05 | Independência dos sub-geradores: mudar volume do Acelerato não altera o hash do BusinessMap e vice-versa; nenhum ID/campo compartilhado entre as bases | `npm run hash-base` com configuração alterada (executado via teste GER-01 do `react-frontend`; QA confere a existência e roda a variação de volume) | P1 |
| FRONT-06 | Nenhum cálculo, histograma, percentil ou previsão mistura as fontes (E2E: INV-06, SUS-02) e a Visão geral/EI mostram blocos separados com a fonte de cada um | E2E | P1 |

Estado hoje: FRONT-01 **reprova** (`web/src/mock/acelerato/gerador.ts:31`, bug 001); FRONT-02 a FRONT-04 passam.

### R2.9 Contrato de DOM e de build a combinar com o `react-frontend` (pendências)
1. `data-estado` em cada `metrica-*` com os valores `carregando | atualizando | pronto | vazio | insuficiente | erro` (ADR 0003, "Como cada item é medido"); hoje o app só tem `aria-busy` no esqueleto. O helper `perf/troca-filtro.ts` cai para `aria-busy` e para a mudança do texto do `main`, mas sem `data-estado` não distingue "atualizando" de "pronto" com precisão.
2. Modo **sem latência simulada** da fonte mock (opção do construtor ou variável de build); o teste lê o nome do parâmetro na variável `PERF_QUERY_SEM_LATENCIA` (por exemplo `latencia=0`).
3. `data-testid` de `filtro-{equipe|tipo|sistema|periodo|prioridade}` e `seletor-tema` (a spec manda; hoje só `barra-filtros`, `limpar-filtros`, `abrir-filtros` existem).
4. Manifest do Vite (`build.manifest: true`) é opcional; o script de tamanho classifica por análise do `index.html` e dos imports estáticos.
5. `eslint.config.js` e build verdes (D6) para o portão de entrada de K-022.

### R2.10 Automação entregue nesta etapa (em `e2e/`, sem testes de tela ainda)
- `perf/lcp.ts` (LCP, CLS, tarefas longas e INP por `PerformanceObserver`, carga fria em contexto novo, CPU 4x), `perf/troca-filtro.ts` (marcas `filtro-clique`, `filtro-resposta-visual`, `painel-atualizado`), `perf/estatistica.ts` (mediana, p95), `perf/perf.spec.ts` (projeto `perf`).
- `scripts/tamanho-bundle.mjs` (gzip por chunk lendo `web/dist`, Node puro), `scripts/hash-base-mock.mjs` (hash antes/depois da extração), `scripts/verificar-fronteiras.mjs` (BM x AC e fronteiras), `scripts/lighthouse.sh` + `lighthouse/lighthouserc.cjs` (Lighthouse CI, 6 rotas, desktop).
- `pages/` (`PainelPage`, `BarraFiltros`, `CartaoMetrica`, `Cabecalho`) e `fixtures/base.ts` (axe com separação entre bloqueantes e informativas, coleta de erros de console), `fixtures/constantes.ts` (testids, ids de `mock`, slugs, orçamento).
- Ambiente: o Chromium do Playwright precisa de `libnspr4`, `libnss3` e `libasound2`; sem sudo, extrair os `.deb` e usar `LD_LIBRARY_PATH` (ver seção 12) ou rodar `sudo npx playwright install-deps chromium`.

---

## 1. Escopo

### 1.1 Coberto
- As 6 rotas de painel (`/`, `/operacional`, `/tatico`, `/estrategico`, `/sustentacao`, `/espera-invisivel`), `/ajuda` e o 404; cadência diária e semanal do Operacional.
- Todas as métricas do núcleo (O1, O2, O3, O4, O7, O9, O10, O12, O15, O18, T1, T2, T3, T4, T5, T7, T9, E1, E2, E3, S1 a S7, EI nos quatro níveis) e o bloco "Bloqueados agora".
- Filtros, chips, período personalizado, URL compartilhável, seletores locais, parâmetro `?mock=`.
- Estados (carregando, vazio, amostra insuficiente, erro de cartão, erro de painel, 404, positivo).
- Notas metodológicas, base amostral, aviso de dados fictícios, marcador de mudança de critério.
- Regras invioláveis do `CLAUDE.md` aplicáveis ao front.
- Acessibilidade WCAG 2.2 AA (axe + verificações manuais automatizadas), tema claro/escuro, teclado, responsividade.
- Biblioteca de cálculo e gerador de mock (lado unitário, **de responsabilidade do `react-frontend`**; o QA define os casos mínimos e revisa a cobertura).

### 1.2 Fora de escopo
- Back-end, banco, coleta real, autenticação e permissões (não existem; "usuário sem permissão" não se aplica nesta etapa). Falha de API é simulada por `?mock=erro`.
- Métricas fora do núcleo.
- Desempenho sob carga e testes visuais por pixel (só medição de deslocamento de layout, bundle e tempo de geração).
- Validação da fidelidade dos números ao negócio (são fictícios); valida-se consistência interna e regras.

### 1.3 Decisões vigentes do Jarvis que o plano testa (prevalecem sobre a spec onde divergem; ver seção 11)
| # | Decisão | Casos principais |
|---|---|---|
| J1 | Janela de percentis = 12 semanas para todas as granularidades (sem "12 meses provisória") | CALC-07, EST-02, TAT-08, EI-01, EI-07 |
| J2 | Sustentação em horas úteis para todas as prioridades (P1 a P5) | SUS-05, SUS-14, CALC-01 |
| J3 | Sem filtro nem visão por agente na Sustentação | FIL-01, INV-01, INV-02 |
| J4 | Equipe nunca vira série, cor, coluna, faceta nem legenda | INV-03, FIL-10 |
| J5 | Nenhum nome de pessoa em nenhuma tela | INV-01, INV-13 |

## 2. Estratégia e níveis

| Nível | Ferramenta | Dono | O que cobre |
|---|---|---|---|
| U (unitário) | Vitest + fast-check, `TZ=UTC` e um segundo fuso | `react-frontend` | `lib/metrics` (calendário, percentil, janela, mínimo de 20, métricas), gerador, hook/schema de filtros, formatadores, fonte mock |
| C (componente) | Testing Library + jsdom | `react-frontend` | estados do cartão, tabela alternativa, nota, URL ida e volta; lê conteúdo pela tabela, não pelo SVG |
| E2E | Playwright (Chromium; Firefox e WebKit no CI só com `@smoke`) | `qa-engineer` | fluxos reais contra `vite preview`, regras invioláveis em todas as rotas, estados via `?mock=` |
| A11Y | `@axe-core/playwright` (tags `wcag2a`, `wcag2aa`, `wcag22aa`) + verificações de teclado/foco/contraste | `qa-engineer` | todas as rotas, dois temas, estados e overlays |

Princípios:
- O E2E **não repete a matemática**: valida regras e consistência (frase de leitura = tabela = base = nota) e usa os números do próprio DOM. Valores exatos ficam no unitário, com fixtures montadas à mão.
- O E2E só depende de dados que o gerador garante por contrato (classes com menos de 20 itens, P1 da Sustentação, projeto com escopo adicionado, iniciativas sem ficha, mudanças de critério de 02/03/2026 e 01/06/2026).
- Seletores: `getByRole`/`getByLabel`/texto acessível primeiro; `data-testid` da convenção da seção 10 da spec só onde não há papel (cartões `metrica-{codigo}`, `base-{codigo}` etc.).
- Sem `waitForTimeout`, sem `skip`. Teste instável é reportado, não escondido.
- Cada teste abre a própria URL (estado todo na URL); nada depende de ordem.

## 3. Dados de teste e ambiente
- Build de teste: `web/` com a semente padrão (`20261009`) e `hoje = 2026-10-09T18:00:00-03:00` (rótulo "Dados até 09/10/2026"). Servido por `vite preview` na porta 4173.
- Segundo build (C80): `VITE_MOCK_SEMENTE` diferente, `vite build --outDir dist-alt`, servido na 4174. Só o projeto `chromium-semente-alt` roda contra ele.
- Fixtures garantidas pelo gerador (conferidas por teste unitário do gerador, GER-05): (a) pelo menos um tipo de demanda do FL1 com menos de 20 concluídos na janela **com filtros padrão** (ver lacuna L11); (b) classe de serviço do Tático com menos de 20; (c) um sistema e uma área com menos de 20 em T5; (d) P1 da Sustentação com menos de 20; (e) filtro de equipe única pequena; (f) projeto com escopo adicionado; (g) 2 ou mais iniciativas sem ficha; (h) acordos vencidos com as 4 responsabilidades; (i) itens acima do P95 hoje e backlog com mais de 180 dias; (j) bloqueados hoje (todos os motivos do domínio na história).
- Combinações de filtro que devem dar "vazio" (0 itens) e "insuficiente" (1 a 19) são descobertas por uma função de apoio de teste que lê as tabelas dos cartões; não são fixadas em número.
- Pessoas: o mock tem `responsaveis` com pseudônimos "Pessoa NN" no modelo. O E2E tem como lista negra o padrão `Pessoa \d+` e os termos "responsável", "agente", "ranking" (ver INV-01).
- Viewports: 320x568, 375x812, 640x900, 768x1024, 1024x768, 1280x800, 1440x900, 1920x1080. Temas: claro, escuro (via `colorScheme` do contexto e via seletor de tema) e "Sistema".
- Navegadores: Chromium sempre; Firefox e WebKit no CI para os casos `@smoke` (marcados P1 de navegação, filtros e axe de `/` e `/operacional`).
- Esqueleto da automação: `e2e/` (package.json, `playwright.config.ts`, `fixtures/constantes.ts`) já criado nesta etapa, sem testes.

## 4. Convenções do plano
- Prioridade: **P1** = bloqueia a entrega (regra inviolável, critério de aceite central, acessibilidade crítica); **P2** = importante, deve passar antes do aceite final; **P3** = complementar/cosmético.
- Nível: U, C, E2E ou combinação (ex.: `U+E2E`). "A11Y" é E2E com axe.
- Coluna "Crit." referencia os critérios de aceite C1 a C104 da seção 10 da spec (ou a seção da spec, quando o requisito não tem número).
- Os IDs seguem a área: NAV, AVI, VG, FIL, OP, TAT, EST, SUS, EI, CALC, GER, NOTA, ST, INV, A11Y, RESP, XBR, BLD.
- Cada caso de "regra de cálculo" lista em Cenário a borda testada; casos de tabela (parametrizados) contam como um caso.

## 5. Casos de teste

### 5.1 Navegação e estrutura (NAV)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| NAV-01 | `/` abre a Visão geral e é a entrada do sistema | C1 | E2E | P1 |
| NAV-02 | Navegação com exatamente 6 destinos na ordem; `aria-current="page"` só no item da rota atual, em cada rota | C2 | E2E | P1 |
| NAV-03 | As 6 rotas + `/ajuda` carregam; rota desconhecida (inclui `/operacional/xyz`, `/x%00`) mostra 404 com link para `/` | C3 | E2E | P1 |
| NAV-04 | Cada rota: 1 único `h1`; `<title>` termina em "Métricas DSPD · Dados fictícios"; ao trocar de rota por clique o foco vai para o `h1` | C4 | E2E | P1 |
| NAV-05 | Skip link é o primeiro focável (Tab a partir da carga) e move o foco para o `main` | C5 | E2E | P1 |
| NAV-06 | Links entre Operacional, Tático, Estratégico e Espera invisível preservam `equipe`, `tipo`, `sistema`, `periodo`; links para `/sustentacao` e `/` saem limpos | C6 | E2E | P1 |
| NAV-07 | Todo cartão de métrica tem `id` = código em minúsculas; abrir `/tatico#t9` rola até o cartão e foca o título (inclui `#o2`, `#s1`, `#ei`) | C7 | E2E | P2 |
| NAV-08 | Gaveta de navegação (<1024): abre com "Menu", foco preso, Esc fecha, foco volta ao botão | 1.2, C99 | E2E | P2 |
| NAV-09 | `/ajuda`: 7 seções, âncoras `#regras` e `#criterios`, tabela de critérios com as 2 datas do mock | 7.5 | E2E | P2 |
| NAV-10 | "Copiar link" copia a URL com filtros, anuncia "Link copiado." em `role="status"`; com a Clipboard API negada abre o campo com a URL selecionada | 1.3 | E2E | P2 |
| NAV-11 | Selo, seletor de tema e Ajuda ficam na mesma ordem e lugar em todas as rotas (WCAG 3.2.6) | 1.2 | E2E | P3 |
| NAV-12 | Foco do `h1` e `<title>` também corretos ao usar Voltar/Avançar do navegador entre painéis | C4 | E2E | P3 |

### 5.2 Aviso de dados fictícios (AVI)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| AVI-01 | `aviso-dados-ficticios` visível, com o texto "Dados fictícios", em todas as rotas (inclui 404, `/ajuda`, `?mock=erro`, `?mock=carregando`) | C8 | E2E | P1 |
| AVI-02 | Não existe controle que remova ou dispense o selo (nenhum botão de fechar; recarregar não o esconde; popover só explica) | C8 | E2E | P2 |
| AVI-03 | Rodapé com "Dados fictícios gerados para validar a experiência" e "Dados até 09/10/2026" em todas as rotas e estados | C9 | E2E | P1 |
| AVI-04 | Contraste do selo ≥ 4,5:1 nos dois temas (cálculo sobre estilos computados) | C8, C95 | E2E | P1 |
| AVI-05 | O selo é ligado a `fonte.tipo === 'mock'`: com fonte fake `api` o selo some (garante que só o mock o liga) | plano 5 | C | P3 |

### 5.3 Visão geral (VG)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| VG-01 | Seção "O que pede atenção agora", 4 cartões de nível e o bloco Espera invisível presentes | C10 | E2E | P1 |
| VG-02 | Cada cartão de nível: no máximo 3 indicadores, cada um com número, base ("em N itens") e ícone de status; link "Abrir painel {nome}" navega ao painel certo | C11 | E2E | P1 |
| VG-03 | Cada alerta leva, por âncora, ao cartão da métrica de origem (percorre todos os alertas listados e confere `#codigo` + cartão existe e foca) | C12 | E2E | P1 |
| VG-04 | Sem violação de meta: mostra "Nada pede atenção agora com base nas metas publicadas." (fonte fake sem violações) | C13 | C | P2 |
| VG-05 | Espera invisível por nível com as duas medianas e o índice juntos; Sustentação separada por divisor com "Fonte diferente (Acelerato)"; nunca uma mediana sem a outra | C14 | E2E | P1 |
| VG-06 | Tabela "Por reunião": 6 linhas, perguntas fixas e links corretos (`/operacional?cadencia=diaria`, `?cadencia=semanal`, `/tatico#t2`, `/tatico#t4`, `/estrategico#e1`, `/estrategico#e3`) | C15 | E2E | P2 |
| VG-07 | Máximo 6 alertas visíveis; "Ver todos os alertas (N)" expande e N confere com a contagem real; ordem Operacional, Tático, Estratégico, Sustentação | 3.1 | E2E | P2 |
| VG-08 | Selo de status do cartão: "Atenção" se algum indicador viola, "Dentro da meta" se todos com meta estão dentro, "Amostra insuficiente" se todos insuficientes (tabela de decisão) | 3.1 | U+C | P2 |
| VG-09 | Indicador com amostra insuficiente mostra "Amostra insuficiente (n de 20 itens mínimos)" no lugar do número | 3.1, C75 | C | P2 |
| VG-10 | Consistência: número do alerta/indicador da Visão geral = o do cartão correspondente no painel com filtros padrão (ex.: itens acima do P95 em O2) | 3.1 | E2E | P2 |
| VG-11 | Visão geral sem barra de filtros e com linha de recorte ("Consolidado de todas as equipes · últimas 12 semanas") | 3.1 | E2E | P3 |

### 5.4 Filtros e URL compartilhável (FIL)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| FIL-01 | Filtros exibidos por painel: Operacional e Tático = Equipe, Tipo, Sistema, Período; Estratégico = Sistema e Período + explicação do "i" ("O nível estratégico olha projetos..."); Sustentação = Equipe (3 opções SSSC TOTVS/SENIOR/FLUIG), Prioridade (P1 a P5), Período; **nenhum filtro de agente/pessoa**; lista de tipos sem "Iniciativa" | C16, C60 | E2E | P1 |
| FIL-02 | Padrões: tudo "Todos/Todas"; período 12 semanas (Op, Tát), 12 meses (Est), 6 meses (Sust); URL limpa no padrão | C17 | E2E | P1 |
| FIL-03 | Marcar um valor atualiza a URL na hora, sem botão "Aplicar"; recarregar restaura os mesmos filtros e os mesmos números; segunda aba com a mesma URL mostra os mesmos filtros e números | C18 | E2E | P1 |
| FIL-04 | Só valores fora do padrão entram na URL; marcar todos os valores de um filtro remove o parâmetro; formato: vírgulas, minúsculas, sem acento | C19, 2.5 | E2E+U | P1 |
| FIL-05 | Voltar desfaz só a última mudança; várias marcações dentro do mesmo popover = 1 entrada de histórico; Avançar refaz | C20, 2.4 | E2E | P1 |
| FIL-06 | Chips só dos filtros fora do padrão; botão "Remover filtro Equipe: Protheus" remove só aquele (nome acessível exato) | C21 | E2E | P1 |
| FIL-07 | "Limpar filtros" ausente no padrão; aparece com filtro fora do padrão; restaura tudo (inclusive período) e anuncia "Filtros limpos." na região `aria-live` | C22 | E2E | P1 |
| FIL-08 | Independência: filtros de fluxo não vão para `/sustentacao` e os de sustentação não vão para o fluxo (ida e volta pelos links da navegação) | C23 | E2E | P1 |
| FIL-09 | URL inválida: `equipe=xyz`, `tipo=foo`, `sistema=`, `periodo=99`, `cadencia=x`, `de=2026-13-45` ignoram só o inválido, mostram "Alguns filtros do link não existem e foram ignorados: ..." e corrigem a URL (sem nova entrada de histórico); parte válida da mesma URL é mantida | C24, 2.6 | E2E+U | P1 |
| FIL-10 | 2 ou mais equipes: aparece "Resultado consolidado de N equipes. O sistema não compara equipes." e a quantidade N confere; 1 equipe e "todas" não mostram a mensagem | C25 | E2E | P1 |
| FIL-11 | Período personalizado: valida "De" anterior a "Até"; "Até" ≤ 09/10/2026; "De" ≥ início do histórico; intervalo ≥ 7 dias (limites: 6 dias reprova, 7 aprova); as 4 mensagens exatas, junto do campo, com `aria-describedby`, anunciadas; "Aplicar período" com erro mantém o período anterior | C26 | E2E+U | P1 |
| FIL-12 | Cada cartão afetado lista "Filtros aplicados: ..."; cada cartão não afetado mostra "Não afetado por: ..." conforme a tabela 2.2 (parametrizado por métrica x filtro, ex.: O12/O15/O18 x Tipo, T5 x Sistema, T3 x Tipo, E1 a E3 x Equipe/Tipo) | C27, 2.2 | E2E | P2 |
| FIL-13 | <768 px: filtros viram "Filtros (n)" e abrem folha (diálogo) com "Ver resultados"; a página segue utilizável | C28 | E2E | P1 |
| FIL-14 | Com `periodo` diferente de 12s o selo "Janela fixa: 12 semanas" aparece nos cartões de percentil; a janela dos percentis continua de 12 semanas terminando no fim do período; a série muda de intervalo. Unitário: percentis independem do tamanho do período | C29 | E2E+U | P1 |
| FIL-15 | Hook/schema `useFiltros`: parse e serialização ida e volta para os dois domínios, slugs, ordem estável dos valores, `custom` com `de/ate`, valores duplicados, caixa alta, espaços, vazio | 2.5 | U | P1 |
| FIL-16 | Popover de filtro: abre com Enter/Espaço, Tab percorre as caixas, Esc fecha e devolve o foco ao botão, clique fora fecha; "Limpar" e "Fechar" | 2.4, C99 | E2E | P2 |
| FIL-17 | Período personalizado pela URL (`periodo=custom&de=...&ate=...`): ida e volta; `de` > `ate` na URL cai no padrão com aviso | 2.5, 2.6 | E2E+U | P2 |
| FIL-18 | Seletor de cadência e seletores locais (`o2=`, `o3=`, `t4=`, `s3=`, `s5=`...) restauram ao recarregar e ao compartilhar; valor inválido cai no padrão com aviso; "Ver como tabela" não vai para a URL | 2.5 | E2E | P2 |
| FIL-19 | Anúncios `aria-live`: "Filtros atualizados. Equipe: Protheus e Fluig." ao mudar; "Atualizando painel"/"Painel atualizado" na recarga dos cartões | 2.4, 6.1 | E2E | P2 |
| FIL-20 | Dica do filtro Tipo: "Aqui são cards do BusinessMap..." visível por foco e hover | 2.1 | E2E | P3 |
| FIL-21 | Estratégico recebe `equipe=` ou `tipo=` na URL (vindo de link compartilhado): comportamento a definir (L8); caso fica pendente até a spec decidir; teste mínimo: não quebra a página e não mostra chip de filtro inexistente | L8 | E2E | P2 |
| FIL-22 | Limite: selecionar e desmarcar rapidamente 10 vezes não gera loop de histórico nem URL inconsistente; popover com todos marcados equivale a "Todos" | 2.1 | E2E | P3 |

### 5.5 Operacional (OP)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| OP-01 | `/operacional` abre na cadência Diária; ordem dos cartões no DOM e na tela: O2, Bloqueados agora, O1; pergunta "Qual item mais velho não andou desde ontem?" visível; link "Ver também a visão semanal" | C30, 3.2 | E2E | P1 |
| OP-02 | Seletor de cadência (`radiogroup`) alterna para Semanal, grava `cadencia=semanal`, mostra na ordem O3, O9, Espera invisível, O4, O12, O10, O7, O15, O18; voltar a Diária remove o parâmetro; o foco fica no seletor | C31 | E2E | P1 |
| OP-03 | Faixa "Pede atenção": itens de O2 (acima do P95), O1 (< 90% dos dias), O10 (> 180 dias), O12 (vencidos internos); cada item leva ao cartão; contagem do alerta = contagem do cartão | C32 | E2E | P1 |
| OP-04 | O2: lista "Itens para olhar primeiro" com Card, Tipo, Etapa, Idade (dias úteis), Sem mover há e **sem coluna de pessoa**; máximo 10 itens; linhas P50/P85/P95 só no tipo com ≥ 20 concluídos; aba do tipo insuficiente com "(amostra insuficiente)" e itens "Sem referência" | C33 | E2E+U | P1 |
| OP-05 | Bloqueados agora: colunas Card, Tipo, Etapa, Motivo (valores só do domínio fechado), Fornecedor, Bloqueado há; sem responsável; ordenado por "Bloqueado há" decrescente; base "N itens bloqueados hoje" = linhas | C34 | E2E | P1 |
| OP-06 | Bloqueados agora vazio mostra "Nenhum item bloqueado hoje." como estado positivo (ícone de confirmação, sem alerta de erro) | C34, C89 | C | P1 |
| OP-07 | O1: com 1 equipe, barras por coluna na ordem do fluxo com limite e segmento bloqueado; com 0 ou 2+ equipes só "Fila" x "Execução" + "Selecione uma equipe para ver por coluna." e "Limite somado de N equipes"; colunas "Aguardando*"/"Pronto para*" rotuladas "Fila" e contadas no WIP | C35 | E2E | P1 |
| OP-08 | Lib O1/WIP: fila conta no WIP, bloqueado conta no WIP, itens sem início ou já entregues não contam, dia a dia (fixture à mão, 1 caso por regra) | C35 | U | P1 |
| OP-09 | O1: "k de n dias" sem percentual abaixo de 20 dias úteis (borda 19 e 20); KPI "Dias dentro do limite: 54 de 60 (90%)" calculado | 4 O1 | U | P2 |
| OP-10 | O3: P50, P85 e P95 sempre juntos (mediana nunca falta); uma classe por vez via abas; tabela-resumo por tipo; nenhuma visão "todos os tipos" no mesmo gráfico; "Como o P85 evoluiu" só com pontos de janela ≥ 20 | C36 | E2E | P1 |
| OP-11 | O3 no tipo com < 20 itens: sem percentis nem linhas, "Amostra insuficiente" com "n de 20 itens mínimos" e `role="meter"` (valuenow=n, max=20), pontos individuais permanecem, base declarada | C37 | E2E | P1 |
| OP-12 | O3 chip de variação do P85 só quando as duas janelas têm ≥ 20 itens; senão "Comparação indisponível: amostra insuficiente em uma das janelas." | 4 O3 | U+C | P2 |
| OP-13 | O4: colunas semanais; faixa mínimo-máximo e mediana só se o total da janela ≥ 20; semana corrente listrada e rotulada "em andamento" e fora da estatística; abaixo de 20 mostra "Faixa e mediana indisponíveis: n de 20 itens mínimos."; "Empilhar por tipo" não vai para a URL | C38 | E2E+U | P1 |
| OP-14 | O7: no mínimo 6 meses (período de 4 semanas mostra o aviso "Este gráfico mostra no mínimo 6 meses."); um pequeno múltiplo por tipo com título "escala própria"; tabela com Entrou, Saiu, Saldo, Saldo acumulado, Situação ordenada pelo saldo acumulado; mês corrente "em andamento"; sem mínimo de 20 (contagem) | C39 | E2E | P1 |
| OP-15 | O9: três relógios na mesma escala, histogramas com o mesmo eixo x e faixas curtas, série mensal; um tipo por vez (`o9=`); tipo < 20: histogramas e percentis ocultos | C40 | E2E | P1 |
| OP-16 | O10: dois histogramas (time e cliente) lado a lado e na mesma escala; contador "N itens com mais de 180 dias" (contagem permanece com < 20); evolução com mediana e P85 (nunca só média); abaixo de 20 oculta histogramas e evolução | C41 | E2E | P1 |
| OP-17 | O12: acordos por mês com vencidos empilhados em Interno, Solicitante, Terceiro, Não classificado; KPI "vencidos por causa interna" com meta zero e status (ícone + texto); % só com ≥ 20 acordos no mês, senão "k de n" | C42 | E2E+U | P1 |
| OP-18 | O15: 5 fases na ordem do processo com os 3 agrupamentos; taxas de contenção e escape; texto "O que se cobra é a taxa de escape, não o volume de bugs internos."; nenhum status/meta/cor de aprovação sobre volume; < 20 bugs: taxas somem, contagens ficam | C43 | E2E | P1 |
| OP-19 | O18: entregas com/sem bug, taxa de entrega limpa, 2 densidades; meses dentro da janela de 30 dias e o mês corrente "em apuração até DD/MM"; < 20 cards no mês: sem % | C44 | E2E | P1 |
| OP-20 | Lib O18/O15: bug vinculado até 30 dias conta no mês da entrega, no dia 31 vira defeito em produção do mês corrente (borda 30/31); fase de detecção fora do domínio é rejeitada | C44 | U | P2 |
| OP-21 | O2: ordenação por Idade (padrão) e por "Sem mover há"; seletor "Ver por tipo" abre no tipo com mais itens acima do P85 e grava `o2=`; situação do item comparada ao percentil do **próprio** tipo | 4 O2 | E2E+U | P2 |
| OP-22 | Âncoras "Ir para" da cadência semanal levam ao primeiro cartão de cada seção (Tempo, Fluxo, Compromissos, Backlog, Qualidade) | 3.3 | E2E | P3 |
| OP-23 | Links cruzados: O18 "Ver vazão (O4)" e "Ver também a visão semanal" funcionam e preservam filtros | 4 O18 | E2E | P3 |
| OP-24 | "Bloqueados agora" não oferece agregação por causa (D7): sem gráfico/tabela de bloqueios por motivo | D7, C93 | E2E | P2 |

### 5.6 Tático (TAT)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| TAT-01 | Seções A (T2, T1, T5), B (T4, T3), C (T9, T7), cartão de Espera invisível do nível e faixa "Pede atenção" no topo; ordem de DOM = visual | C45 | E2E | P1 |
| TAT-02 | T1, T2 e T4 são por classe de serviço, sem agregado; "Intangível" mostra "Sem SLE" e fica fora da aderência | C46 | E2E | P1 |
| TAT-03 | T1: quatro blocos (Fila, Espera, Execução, Homologação) + marca de P85 do total; link "Leia junto com Demanda × capacidade (T4)" leva a `#t4`; T4 traz "Veja o lead time (T1)"; classe < 20 sem barra e com "Amostra insuficiente (n de 20 itens mínimos)" | C47, 3.4 | E2E | P1 |
| TAT-04 | T2: % por classe com linha de meta de 85%; mapa de calor classe x etapa com **número em cada célula**; classe < 20: "SLE: não publicado" e sem %; status por classe com ícone + texto | C48 | E2E | P1 |
| TAT-05 | T3: "Acordado" x "Realizado" por natureza, desvio em p.p. escrito e selo "Desvio acima de 10 p.p." apenas quando > 10 (borda 10,0 sem selo, 10,1 com); alternador Itens/Tempo | C49 | E2E+U | P1 |
| TAT-06 | T4: só por classe, nenhuma visão agregada; chegada > vazão mostra "A fila cresce: chegam mais itens do que saem" e não mostra "semanas para zerar"; senão mostra semanas para zerar | C50 | E2E | P1 |
| TAT-07 | Lib T4: razão chegada ÷ vazão, semanas para zerar = backlog ÷ (vazão − chegada), vazão = chegada, vazão = 0, regra dos 20 itens (soma chegadas+saídas, ver L12) | C50 | U | P1 |
| TAT-08 | T5: sistemas/áreas < 20 itens saem do gráfico e entram em "Sem amostra suficiente" com a base ("Fluig: 11 de 20 itens mínimos"); aba "Por área"; filtro Sistema não se aplica (chip "Não afetado") | C51 | E2E | P1 |
| TAT-09 | T7: sem mistura story/frente (chip de granularidade "frente"); KPIs e barras por projeto presentes; percentis e histograma só com ≥ 20 frentes concluídas **na janela de 12 semanas** (J1); abaixo disso somem e a lista e as barras permanecem | C52, C78 | E2E+U | P1 |
| TAT-10 | T9: linha por projeto com concluídas, em andamento, a fazer e escopo adicionado na **mesma linha**; "k de n frentes (x%)" e "Escopo cresceu N%"; ordenação padrão por maior crescimento; nenhum campo/controle de avanço manual (nenhum `input`/`slider`) | C53 | E2E | P1 |
| TAT-11 | Lib T9: avanço = concluídas ÷ (originais + adicionadas); crescimento = adicionadas ÷ originais; projeto sem frentes; frente adicionada concluída; censo sempre exibido mesmo com n < 20 | C53 | U | P1 |
| TAT-12 | Lib T2: SLE ≤/> limite (borda igual conta como dentro), etapa de maior duração por item estourado, Intangível fora | C48 | U | P2 |
| TAT-13 | Lib T1: soma das medianas dos blocos não é apresentada como a mediana do total (ambas separadas) | 4 T1 | U | P3 |
| TAT-14 | T3 e T5 % somem com < 20 itens no total; contagens permanecem | 4.0.2 | U+C | P2 |

### 5.7 Estratégico (EST)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| EST-01 | `/estrategico` mostra E1, E2, E3, cartão de EI do nível e faixa "Pede atenção"; **não** mostra filtros de Equipe nem de Tipo | C54 | E2E | P1 |
| EST-02 | E1: um ponto por projeto concluído; com < 20 projetos na janela (J1: 12 semanas; o mock normalmente terá menos) oculta mediana, P85 e fração "antes do início", mantém os pontos e mostra a base; **sem selo "provisória"**. Lib com fixture de 20 projetos: aparecem mediana, P85, fração | C55, C78 | E2E+U | P1 |
| EST-03 | E2: faixa "Fora de objetivo" com destaque e padrão; KPI "Evolução vinculada a objetivo" com meta de 60% e status; % some com < 20 itens no trimestre | C56 | E2E+U | P1 |
| EST-04 | E3: iniciativas sem ficha primeiro com o selo "Sem resultado declarado"; contador "k de n" (censo, sem mínimo); barra de ganho com marcador de 100% | C57 | E2E | P1 |
| EST-05 | Filtro Sistema atua em E1 a E3 ("Filtros aplicados: Sistema ..."); período 12m padrão | 2.2 | E2E | P2 |
| EST-06 | E1: variação "−25% da mediana ao ano" só com as duas janelas ≥ 20 projetos, senão "Comparação indisponível" | 4 E1 | U | P3 |

### 5.8 Sustentação (SUS)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| SUS-01 | `/sustentacao`: faixa de recorte DSPD-SSSC com o texto completo, cartões S1 a S7 e EI da sustentação; todos com selo "Fonte: Acelerato" e granularidade "Chamado"; faixa "Pede atenção" | C58 | E2E | P1 |
| SUS-02 | Isolamento de fontes: em `/sustentacao` nenhum `metrica-O*`, `metrica-T*`, `metrica-E*`; nos painéis de fluxo nenhum `metrica-S*`; nenhum cartão mistura selos de fonte; filtros de fluxo não aparecem na Sustentação e vice-versa | C59 | E2E | P1 |
| SUS-03 | Lint/arquitetura: `lib/metrics/businessmap` e `lib/metrics/acelerato` não se importam; nenhum tipo em comum além de primitivos; `FiltrosSustentacao` x `FiltrosFluxo` rejeitados pelo compilador (teste de tipos) | C59 | U | P1 |
| SUS-04 | S1 e S2 sempre por prioridade P1 a P5, nunca agregados; P1 (< 20 no mock) mostra "Amostra insuficiente" e "k de n"; as demais prioridades publicam | C61 | E2E | P1 |
| SUS-05 | S1: alvo escrito de cada prioridade, valor real com unidade **em horas úteis para P1 a P5** (J2), barras como proporção do alvo (100% marcado), P50/P85 em destaque, tabela Prioridade · Alvo · Mediana · P85 · P95 · Média · Base (média só na tabela, com mediana e P85 ao lado) | C62, J2 | E2E | P1 |
| SUS-06 | S2: duas colunas por prioridade (primeiro atendimento e restauração), linha de 90%, rótulo de valor e "k de n" na tabela; célula < 20: sem coluna, com contagem; status por célula | C63 | E2E | P1 |
| SUS-07 | S3: alternador Absoluto/Proporção grava `s3=prop` (padrão `abs` fora da URL); proporção mensal some com < 20 chamados no mês; tooltip/tabela com "Ajustes manuais de prioridade no mês" | C64 | E2E | P1 |
| SUS-08 | S4: barras de cor única neutra (todas as barras com o mesmo `fill` computado, nenhuma verde/vermelha); texto "sem meta isolada"; tempos somem por nível com < 20 | C65 | E2E | P2 |
| SUS-09 | S5 e S6: cada um mostra exatamente o domínio fechado (5 valores; S6 depende de L3); S6 mostra "Taxa de contorno"; alternador `s5=`/`s6=` distribuição/evolução; % some com < 20 | C66 | E2E | P1 |
| SUS-10 | S7: dois blocos separados (ajuste manual de prioridade; reclassificado, não é incidente), cada um com colunas mensais e KPI; nenhum total que some os dois; "Justificados: k de n" | C67 | E2E | P1 |
| SUS-11 | Filtros da Sustentação só recortam: nenhum gráfico, tabela, legenda ou tooltip tem série/coluna por equipe SSSC; prioridade limita as linhas de S1/S2 e é dimensão legítima em S1 a S3 | 2.1, C91 | E2E | P1 |
| SUS-12 | Lib acelerato: só chamados fechados entram em tempos e aderência; `excecao_sla_registro_posterior` fica fora; chamados `excluido=true` fora; aberto sem `data_finalizado` não conta; `status_sla_r` só em concluídos; escalação não reinicia relógio | 3.6 | U | P1 |
| SUS-13 | Lib acelerato: horas úteis no calendário de expediente para **todas as prioridades** (J2): intervalo atravessando almoço, fim de semana, feriado; alvo de P4/P5 expresso em horas úteis (ver L2) | J2 | U | P1 |
| SUS-14 | Nenhum texto de tempo em `/sustentacao` usa "dias úteis" ou "dias corridos" (J2); toda duração tem unidade "h úteis"/"horas úteis" (exceção a confirmar na L2 para EI) | J2, C72 | E2E | P1 |
| SUS-15 | Lib totalizadores: cada etapa mapeada para exatamente um dos 5 totalizadores; soma dos totalizadores = tempo de vida do chamado fechado | 3.4 | U | P2 |
| SUS-16 | "Pede atenção" da Sustentação: S2 < 90% por prioridade e S1 mediana acima do alvo, com links `#s2`, `#s1` | 3.6 | E2E | P2 |
| SUS-17 | Faixa de recorte sempre visível mesmo com filtros e em estados de erro de cartão | 3.6 | E2E | P3 |

### 5.9 Espera invisível (EI)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| EI-01 | Em toda tela com EI nunca existe visão do cliente sem a do time nem o contrário (`ei-cliente-*` e `ei-time-*` aparecem sempre em par); se qualquer uma tiver < 20 itens, as duas somem e aparece "Amostra insuficiente" com "n de 20 itens mínimos" | C68 | E2E+U | P1 |
| EI-02 | `/espera-invisivel`: 4 blocos (Operacional, Tático, Estratégico, Sustentação), cada um com eixo próprio (nenhum gráfico compartilhado), divisor "Fonte diferente: Acelerato" antes da Sustentação | C69 | E2E | P1 |
| EI-03 | Índice = (cliente − time) ÷ cliente sobre as medianas (lib: bordas time = cliente, time = 0, cliente = 0, mediana igual a 50% exata sem selo e 50,1% com selo "Acima de 50%"); no E2E o índice mostrado confere com os dois números visíveis | C70 | U+E2E | P1 |
| EI-04 | EI compacto aparece em Operacional (só na cadência semanal), Tático, Estratégico e Sustentação, com link "Ver evolução" | C71 | E2E | P1 |
| EI-05 | Filtros de fluxo valem para os 3 primeiros blocos; o bloco de Sustentação usa só equipe SSSC e período próprios e não herda os de fluxo | 3.7, C23 | E2E | P2 |
| EI-06 | Consequência de J1: com 12 semanas, EI de FL2 e FL3 (e o indicador de EI na Visão geral) caem em "Amostra insuficiente" de forma consistente nas duas visões, sem número parcial | J1, C68 | E2E | P1 |
| EI-07 | Cada nível usa a granularidade própria (demanda, frente, projeto, chamado) e mostra o chip; nunca divide eixo, mediana ou histograma com outro nível | C77 | E2E | P1 |
| EI-08 | Evolução mensal das duas visões com faixa; marcador de mudança de critério (02/03/2026) onde a série cruza | 4 EI, C79 | E2E | P2 |
| EI-09 | Texto da Sustentação: "não compare com os níveis do BusinessMap" visível; selo de fonte Acelerato | 4 EI | E2E | P2 |

### 5.10 Regras de cálculo e metodologia (CALC) e gerador (GER)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| CALC-01 | Todo valor de tempo na tela traz unidade escrita ("dias úteis" no fluxo; "horas úteis" na Sustentação); varredura de todas as rotas por padrão número + unidade e por números de tempo sem unidade em KPIs/eixos/tabelas | C72 | E2E | P1 |
| CALC-02 | Todo cartão com percentil mostra P50, P85 e P95 juntos; nenhum cartão mostra "média" sem faixa e mediana na mesma tabela/cartão (varredura por texto "média") | C73 | E2E | P1 |
| CALC-03 | Todo `metrica-*` tem `base-*` visível com nº de itens e janela; nenhum número sem base | C74 | E2E | P1 |
| CALC-04 | Estatística com n < 20 não é renderizada (nem como `0`, `—` solto ou gráfico vazio); aparece `amostra-insuficiente-*` com "n de 20 itens mínimos" e `role="meter"`; célula de tabela com "—" + "amostra insuficiente" (nunca em branco) | C75, 6.3 | E2E+C | P1 |
| CALC-05 | Com os dados do mock, Operacional, Tático e Sustentação têm cada um pelo menos uma classe publicada e uma insuficiente **na mesma tela com filtros padrão** | C76 | E2E | P1 |
| CALC-06 | Story, frente e projeto nunca dividem histograma, percentil, eixo ou tabela: cada cartão tem 1 chip de granularidade; a lib não aceita `Amostra` de granularidades ou domínios distintos (teste de tipos; não existe função de concatenação) | C77 | E2E+U | P1 |
| CALC-07 | Janela de percentis de 12 semanas (84 dias; dia 84 dentro, 85 fora) em **todas** as granularidades (J1): selos e notas de T7, E1 e EI FL2/FL3 dizem 12 semanas; **não** existe o texto "Janela: 12 meses (provisória)" | C78, J1 | E2E+U | P1 |
| CALC-08 | Séries que cruzam 02/03/2026 (O7, O9, O10, T1, EI) mostram `marcador-criterio` com a data e o aviso "Esta série atravessa uma mudança de critério..."; séries de S1 a S7 com 01/06/2026; cartão de percentil cuja janela cruza a data mostra o aviso da janela; série que não cruza não mostra | C79 | E2E | P1 |
| CALC-09 | Nenhum número fixo no componente: com a semente alternativa (build `dist-alt`) os números dos cartões mudam; unitário: componentes renderizam o que a fonte fake devolve | C80 | E2E+C | P2 |
| CALC-10 | Lib core, tabela de bordas: horas úteis com início/fim fora do expediente, atravessando almoço, fim de semana e feriado, intervalo nulo, `fim < início` (erro), modo corrido; `somarHorasUteis` inversa; aditividade em intervalos contíguos | 4.1 | U | P1 |
| CALC-11 | Percentil tipo 7 contra valores de referência de `PERCENTILE.INC` (n = 1, 2, 19, 20, repetidos); propriedades fast-check: p50 ≤ p85 ≤ p95, min ≤ p ≤ max, n < 20 ⇒ insuficiente, n = 19 insuficiente e n = 20 ok | 4.1 | U | P1 |
| CALC-12 | Média só é exposta junto de percentis (`resumoComMedia`); não há export que devolva média isolada | C73 | U | P1 |
| CALC-13 | Testes unitários passam em `TZ=UTC` e em `America/Sao_Paulo` e `Asia/Tokyo` (nada depende do fuso da máquina) | plano 6 | U | P2 |
| CALC-14 | E2E em contextos com `timezoneId` diferentes (UTC, Sao_Paulo, Tokyo) mostram os mesmos números e a mesma "Dados até 09/10/2026" | 9 | E2E | P2 |
| CALC-15 | Formatadores: `1.234,5`, `DD/MM/AAAA`, fuso `America/Sao_Paulo`, percentual com vírgula, singular/plural ("1 item"/"2 itens"), valores 0, negativos, NaN/Infinity nunca chegam à tela | 0 | U | P2 |
| CALC-16 | Mudança de critério registrada com data (`criterios.ts`): `marcacoesNoPeriodo` devolve só as que cruzam o período; todo DTO de série as traz | 4.1 | U | P2 |
| CALC-17 | Frase de leitura é gerada dos dados (troca com a semente) e coerente com a tabela do mesmo cartão (ex.: "3 itens acima do P95" = linhas "Acima do P95") | 4.0 | E2E | P2 |
| GER-01 | Gerador determinístico: mesma semente ⇒ mesmo hash da base; semente diferente ⇒ hash diferente; sub-gerador por domínio (mudar volume do Acelerato não altera o BusinessMap) | plano 6 | U | P1 |
| GER-02 | Invariantes do BusinessMap: marcos ordenados (`criado ≤ comprometido ≤ iniciado ≤ concluido ≤ hoje`), integridade de `card_pai`, coerência marcos x `fato_transicao`, nada depois de `hoje`, colunas de fila começam por "Aguardando"/"Pronto para", bloqueio não move coluna | plano 6 | U | P1 |
| GER-03 | Histórico nunca sobrescrito: cards arquivados e excluídos permanecem na base; descartados com `motivo_descarte` | CLAUDE.md | U | P2 |
| GER-04 | Invariantes do Acelerato: prioridade = matriz Impacto x Urgência salvo ajuste justificado; `status_sla_r` só em concluídos; nenhum campo/ID compartilhado com o BusinessMap | plano 6 | U | P1 |
| GER-05 | Fixtures garantidas (seção 3 itens a a j) existem com os filtros padrão; classes < 20 e > 20 coexistem | 9.2 | U | P1 |
| GER-06 | Nenhum `Math.random`, `Date.now`, `new Date()` sem argumento em `mock/` e `lib/metrics/` (lint) | ADR 0001 | U | P2 |
| GER-07 | Nenhum nome de pessoa: `responsaveis` e `usuario` só com pseudônimos; nenhuma função da lib recebe pessoa como dimensão; nenhum DTO expõe pessoa | CLAUDE.md | U | P1 |
| GER-08 | Fonte mock: cada `obter` devolve DTO válido pelo schema zod, para a matriz completa de filtros dos testes (incluindo combinação sem itens) | plano 6 | U | P1 |
| GER-09 | Geração completa dentro do orçamento (< 1 s no CI) | plano 8 | U | P3 |

### 5.11 Notas metodológicas (NOTA)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| NOTA-01 | Todo cartão do núcleo (percorre todas as rotas e cadências) tem o botão "Como ler e como é calculado" com `aria-expanded`; ao abrir mostra as seções O que é, Como se calcula, Como ler, Meta, Cuidados e limites e Nesta tela | C81 | E2E | P1 |
| NOTA-02 | "Nesta tela" mostra a janela, os filtros aplicados e a base reais do cartão: valores iguais aos do `base-*` e dos chips ativos; muda ao mudar o filtro | C82 | E2E | P1 |
| NOTA-03 | Abrir e fechar por Enter/Espaço; o foco permanece no botão; `aria-controls` aponta para a região existente | C83 | E2E | P1 |
| NOTA-04 | Conteúdo da nota vem de `content/catalogo-metricas.ts` e cobre o conjunto exato do núcleo (nenhuma métrica sem nota; nenhuma nota órfã) | C81 | U | P2 |
| NOTA-05 | Nota fechada por padrão e não fica aberta ao trocar de filtro/rota (comportamento definido: fechada) | 5 | E2E | P3 |

### 5.12 Estados (ST)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| ST-01 | `?mock=carregando`: todos os cartões com esqueleto (`estado-carregando-*`), `aria-busy="true"` e texto oculto "Carregando {código} {título}"; o esqueleto ocupa as mesmas dimensões do cartão final (sem deslocamento de layout acima de 0,05 de CLS ao carregar sem `mock`) | C84 | E2E | P1 |
| ST-02 | Filtros sem resultado (0 itens): cartão mostra `estado-vazio-*` com "Nenhum item encontrado", "Limpar filtros" e um "Remover filtro {nome}" por filtro ativo; usar os botões restaura dados | C85 | E2E | P1 |
| ST-03 | `?mock=erro:o3` (na cadência semanal): só O3 mostra `estado-erro-*` com "Tentar de novo"; os demais cartões e a navegação funcionam; "Tentar de novo" recarrega só aquele cartão, mantém os filtros e a URL | C86 | E2E | P1 |
| ST-04 | `?mock=erro`: erro de painel com "Não foi possível abrir este painel", "Tentar de novo" e "Ir para a Visão geral" (que funciona); cabeçalho/selo/rodapé continuam | C87 | E2E | P1 |
| ST-05 | "Amostra insuficiente" (1 a 19) e "Nenhum item encontrado" (0) são estados distintos, com textos e testids diferentes, na mesma métrica conforme o filtro | C88 | E2E | P1 |
| ST-06 | Zero itens acima do P95 e zero bloqueados: mensagens "Nenhum item acima do P95 hoje." e "Nenhum item bloqueado hoje." sem `role="alert"` e sem ícone de erro | C89 | C | P1 |
| ST-07 | Primeiro erro da página usa `role="alert"`; os demais, `role="status"` | 6.4 | E2E | P2 |
| ST-08 | `?mock=vazio` em todas as rotas: todos os cartões vazios e um aviso único no topo com a causa; nenhuma exceção no console | 6.2, 6.6 | E2E | P2 |
| ST-09 | `?mock=carregando` nas 6 rotas e `?mock=erro:<id>` para um cartão de cada painel (o3, t2, e1, s1, ei) | 6.6 | E2E | P2 |
| ST-10 | Falha de carregamento do chunk da rota (bloqueio de rede do JS lazy): erro de painel com retry, sem tela branca | 6.4 | E2E | P2 |
| ST-11 | Esqueleto só aparece após 150 ms e permanece 300 ms (relógio falso); `prefers-reduced-motion`: estático | 6.1 | C | P3 |
| ST-12 | `mock` não aparece em nenhum elemento da UI, é ignorado se inválido (`?mock=xyz`) sem aviso de erro e não é propagado pelos links de navegação (comportamento a confirmar, L13) | 6.6 | E2E | P3 |
| ST-13 | Console limpo: nenhuma rota emite `console.error`/exceção não tratada/requisição falha em uso normal | geral | E2E | P2 |

### 5.13 Regras invioláveis (INV)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| INV-01 | Varredura de **todas as rotas e cadências**, com e sem filtros, de texto visível, `aria-label`, `title`, `alt`, tooltips, `figcaption`, tabelas alternativas e `<title>`: nenhuma ocorrência de `Pessoa \d+`, nem dos termos "responsável", "responsáveis", "agente", "ranking", "assignee"; o campo `responsaveis` não é importado por `features/` nem `components/` (lint/grep) | C90, J5 | E2E+U | P1 |
| INV-02 | Nenhuma tabela (O2, Bloqueados, T9, S1...) tem coluna de pessoa; cabeçalhos de todas as tabelas conferidos contra lista branca | C90, J3 | E2E | P1 |
| INV-03 | Equipe nunca é série, cor, faceta, coluna nem item de legenda: com 0, 1, 2+ e todas as equipes, legendas, cabeçalhos de tabela, séries de gráfico e tooltips (hover/foco em amostra de pontos de cada gráfico) não contêm nenhum dos 6 nomes de equipe do BusinessMap nem SSSC TOTVS/SENIOR/FLUIG fora dos chips/filtro/rodapé "Filtros aplicados" | C91, J4 | E2E | P1 |
| INV-04 | Métricas proibidas ausentes em todas as rotas: velocidade/pontos, produtividade, horas apontadas, "% de conclusão de tarefa", comparação entre times, "média" de tempo de ciclo isolada | C92 | E2E | P1 |
| INV-05 | Conjunto exato de cartões por rota: `metrica-*` encontrados = lista do núcleo (e "Bloqueados agora"); nenhum cartão fora do núcleo | C93 | E2E | P1 |
| INV-06 | BusinessMap x Acelerato: nenhum cartão, tabela, gráfico, percentil, histograma ou previsão com os dois selos de fonte; Visão geral e EI mostram os blocos separados com divisor | C59, C14 | E2E | P1 |
| INV-07 | Nenhuma previsão/Monte Carlo/meta por pessoa na UI (a lib só tem a assinatura reservada) | CLAUDE.md | E2E+U | P2 |
| INV-08 | Tooltips e tabelas alternativas de gráficos por tipo/classe/prioridade não revelam equipe nem pessoa (amostra por gráfico e por tema) | C90, C91 | E2E | P2 |
| INV-09 | O "recorte por equipe" no T5 ("Por área") mostra áreas solicitantes e sistemas, não equipes nem pessoas; ordenação por parcela de falha não é ranking de equipes (revisão com ux-designer; ver L10) | 4 T5 | E2E | P3 |
| INV-10 | Bundle de produção (`dist/`) sem credenciais/segredos (`apikey`, `password`, `.env`, `MYSQL`); sem referências a hosts reais do BusinessMap/Acelerato | CLAUDE.md | U | P2 |
| INV-11 | Dívida de modelo: nenhuma tela do fluxo mostra chamados do Acelerato e nenhuma da Sustentação mostra cards do BusinessMap; os rótulos de Incidente/Requisição no fluxo carregam a fonte BusinessMap | C59, L14 | E2E | P2 |

### 5.14 Acessibilidade (A11Y)
Nas verificações axe, usar `AxeBuilder` com `wcag2a`, `wcag2aa`, `wcag22aa`; aprovar com zero violações críticas ou sérias (as demais são relatadas como informação).

| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| A11Y-01 | axe nas 9 telas (`/`, `/operacional`, `/operacional?cadencia=semanal`, `/tatico`, `/estrategico`, `/sustentacao`, `/espera-invisivel`, `/ajuda`, 404) x 2 temas = 18 execuções, em 1280x800 | C94 | A11Y | P1 |
| A11Y-02 | axe nos estados: `?mock=carregando`, `?mock=erro`, `?mock=erro:o3`, `?mock=vazio`, um cartão com amostra insuficiente, x 2 temas | C94 | A11Y | P2 |
| A11Y-03 | axe com overlays abertos: popover de filtro, período personalizado com erro, nota aberta, tabela no lugar do gráfico, gaveta de navegação, folha de filtros, tooltip, popover do selo, x 2 temas | C94 | A11Y | P2 |
| A11Y-04 | axe em 375x812 nas rotas principais (`/`, `/operacional`, `/sustentacao`) x 2 temas | C94 | A11Y | P2 |
| A11Y-05 | Contraste: texto ≥ 4,5:1 e UI/marcas de gráfico ≥ 3:1 nos 2 temas (cálculo unitário dos pares de tokens + varredura de estilos computados de texto, bordas, foco, marcas SVG e legendas) | C95 | U+A11Y | P1 |
| A11Y-06 | Só teclado: percorrer `/`, `/operacional` (diária e semanal), `/tatico`, `/sustentacao` com Tab/Shift+Tab; nada inalcançável; sem armadilha; ordem de foco = ordem visual; foco visível (contorno ≥ 2 px, contraste ≥ 3:1 com o fundo) nos 2 temas | C96, 2.1.2 | A11Y | P1 |
| A11Y-07 | O elemento focado nunca fica coberto pela barra sticky/cabeçalho (2.4.11): para cada focável de `/operacional` e `/tatico` em 768 e 1280 px, retângulo do foco fora da área da barra | C96, C28 | A11Y | P1 |
| A11Y-08 | Todo gráfico: `figure` + `figcaption` + frase de leitura (`aria-describedby`) + botão "Ver como tabela" (antes do gráfico no DOM) que troca por tabela com `caption` e `th scope`; "Ver como gráfico" volta; números da tabela batem com a frase | C97 | E2E | P1 |
| A11Y-09 | Status e séries nunca só por cor: todo `StatusMeta` tem ícone + texto; teste em escala de cinza (filtro CSS) e `forcedColors: 'active'` confere que o texto/ícone/padrão distingue estados (semana em andamento listrada + rótulo; pontos O2 por forma) | C98 | A11Y | P2 |
| A11Y-10 | Esc fecha popover e tooltip; tooltip não some ao passar o ponteiro sobre ele (1.4.13); gaveta e folha prendem o foco e o devolvem ao disparador | C99 | E2E | P1 |
| A11Y-11 | `prefers-reduced-motion: reduce`: sem animação de entrada de gráfico, esqueleto estático, transições ≤ 200 ms | C100 | E2E | P2 |
| A11Y-12 | 320 px: sem rolagem horizontal da página em nenhuma rota; tabelas largas rolam em região com rótulo e `tabindex="0"`; zoom 200% e espaçamento de texto (1.4.12 injetado) sem perda ou sobreposição | C101 | A11Y | P1 |
| A11Y-13 | Alvos: ≥ 24x24 px em todas as larguras e ≥ 44x44 px em < 768 px (botões, chips de remoção, abas, ícones) | C102 | A11Y | P2 |
| A11Y-14 | Tema: Claro, Escuro, Sistema; persiste em `localStorage` entre recargas; sem flash (o atributo de tema já está no `<html>` antes da primeira pintura); "Sistema" respeita `prefers-color-scheme` e reage à troca | C103 | E2E | P1 |
| A11Y-15 | Estrutura: `lang="pt-BR"`, marcos `header`, `nav` rotulado, `main`, `footer`; hierarquia h1 > h2 > h3 sem salto; título de página único por rota | 8.1 | A11Y | P1 |
| A11Y-16 | Abas (`SeletorLocal`): setas movem, Enter/Espaço selecionam, Tab sai para o conteúdo; marcas de gráficos com até 12 itens navegáveis por setas com anúncio "{série}: {valor} {unidade}, {contexto}"; dispersões densas com SVG `aria-hidden` + tabela | 8.4, 8.5 | A11Y | P2 |
| A11Y-17 | Sem atalhos de tecla única (2.1.4): teclas de letra não disparam ações; nada atualiza sozinho (sem polling/auto-refresh) | 8.5 | E2E | P3 |
| A11Y-18 | KPI com texto completo ("P85: 9 dias úteis"), nunca só a cifra | 8.4 | E2E | P3 |
| A11Y-19 | Controles de filtro com rótulo visível; erros do período personalizado ligados por `aria-describedby` e anunciados; nenhum campo desabilitado para filtro inaplicável (filtro some) | 8.8 | A11Y | P2 |

### 5.15 Responsividade (RESP)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| RESP-01 | Sem rolagem horizontal da página em todas as rotas nos 8 viewports (320 a 1920) | C101 | E2E | P1 |
| RESP-02 | < 640: uma coluna, "Filtros (n)" + folha, navegação em gaveta, gráficos em largura total (altura mínima 240 px), tabelas com rótulo "Tabela de {título}, role para os lados" e `tabindex="0"` | 8.6 | E2E | P1 |
| RESP-03 | 768 a 1023: barra de filtros sticky em linha (altura ≤ 64 px), O2 com gráfico acima da lista; navegação em gaveta; ≥ 1024: navegação horizontal e grade de 12 colunas | C28, C104 | E2E | P1 |
| RESP-04 | A ordem do DOM (sequência de `metrica-*`/seções) é idêntica em 375, 768, 1024 e 1440 px | C104 | E2E | P2 |
| RESP-05 | ≥ 1280: largura máxima 1440 px centralizada (1920 não estica) | 8.6 | E2E | P3 |
| RESP-06 | Pequenos múltiplos do O7 e histogramas do O10 empilham em < 640 (O10: cliente depois time, mesmo eixo x) | 8.6 | E2E | P3 |
| RESP-07 | Orientação paisagem em celular (667x375) sem bloqueio nem perda de conteúdo | 8.6 | E2E | P3 |
| RESP-08 | Nos breakpoints exatos (639/640, 767/768, 1023/1024, 1279/1280) o layout muda como a tabela 8.6 e nada fica sobreposto | C104 | E2E | P2 |

### 5.16 Entre navegadores e build (XBR, BLD)
| ID | Cenário | Crit. | Nível | Prio |
|---|---|---|---|---|
| XBR-01 | Subconjunto `@smoke` (NAV-01/02/03, AVI-01, FIL-03/05/09, OP-01/02, SUS-01, A11Y-01 de `/`) passa em Firefox e WebKit | geral | E2E | P2 |
| BLD-01 | `npm install && npm run dev` em `web/` abre `/` (Visão geral) funcionando; `npm run build` e `npm run preview` ok | pedido | E2E | P1 |
| BLD-02 | `npm run check` (lint + typecheck + testes unitários) verde; lint arquitetural barra `features/**` importando `lib/metrics` ou `mock` e `Math.random`/`new Date()` em `mock/` e `lib/metrics/` | pedido, ADR 0001 | U | P1 |
| BLD-03 | `README.md` na raiz explica como rodar, o parâmetro `?mock=` e os scripts | pedido | E2E | P3 |
| BLD-04 | Orçamento de bundle: chunk inicial < 200 KB gz; gerador e lib em chunk carregado por `import()` dinâmico; rotas lazy | plano 8 | U | P3 |

## 6. Rastreabilidade: critério de aceite -> casos

Todos os 104 critérios da spec (seção 10) têm pelo menos um caso.

| Crit. | Casos | Crit. | Casos | Crit. | Casos |
|---|---|---|---|---|---|
| C1 | NAV-01, BLD-01 | C36 | OP-10 | C71 | EI-04 |
| C2 | NAV-02 | C37 | OP-11 | C72 | CALC-01, SUS-14 |
| C3 | NAV-03 | C38 | OP-13 | C73 | CALC-02, CALC-12 |
| C4 | NAV-04, NAV-12 | C39 | OP-14 | C74 | CALC-03 |
| C5 | NAV-05 | C40 | OP-15 | C75 | CALC-04, OP-11, VG-09 |
| C6 | NAV-06 | C41 | OP-16 | C76 | CALC-05, GER-05 |
| C7 | NAV-07 | C42 | OP-17 | C77 | CALC-06, EI-07 |
| C8 | AVI-01, AVI-02, AVI-04 | C43 | OP-18 | C78 | CALC-07, EST-02, TAT-09 |
| C9 | AVI-03 | C44 | OP-19, OP-20 | C79 | CALC-08, EI-08 |
| C10 | VG-01 | C45 | TAT-01 | C80 | CALC-09 |
| C11 | VG-02 | C46 | TAT-02 | C81 | NOTA-01, NOTA-04 |
| C12 | VG-03 | C47 | TAT-03 | C82 | NOTA-02 |
| C13 | VG-04 | C48 | TAT-04, TAT-12 | C83 | NOTA-03 |
| C14 | VG-05, INV-06 | C49 | TAT-05 | C84 | ST-01 |
| C15 | VG-06 | C50 | TAT-06, TAT-07 | C85 | ST-02 |
| C16 | FIL-01 | C51 | TAT-08 | C86 | ST-03 |
| C17 | FIL-02 | C52 | TAT-09 | C87 | ST-04 |
| C18 | FIL-03 | C53 | TAT-10, TAT-11 | C88 | ST-05 |
| C19 | FIL-04, FIL-15 | C54 | EST-01 | C89 | ST-06, OP-06 |
| C20 | FIL-05 | C55 | EST-02 | C90 | INV-01, INV-02, INV-08, GER-07 |
| C21 | FIL-06 | C56 | EST-03 | C91 | INV-03, SUS-11, INV-08 |
| C22 | FIL-07 | C57 | EST-04 | C92 | INV-04 |
| C23 | FIL-08, EI-05 | C58 | SUS-01 | C93 | INV-05, OP-24 |
| C24 | FIL-09 | C59 | SUS-02, SUS-03, INV-06, INV-11 | C94 | A11Y-01 a A11Y-04 |
| C25 | FIL-10, INV-03 | C60 | FIL-01, INV-01, INV-02 | C95 | AVI-04, A11Y-05 |
| C26 | FIL-11 | C61 | SUS-04 | C96 | A11Y-06, A11Y-07 |
| C27 | FIL-12 | C62 | SUS-05 | C97 | A11Y-08 |
| C28 | FIL-13, RESP-03, A11Y-07 | C63 | SUS-06 | C98 | A11Y-09 |
| C29 | FIL-14 | C64 | SUS-07 | C99 | A11Y-10, NAV-08, FIL-16 |
| C30 | OP-01 | C65 | SUS-08 | C100 | A11Y-11 |
| C31 | OP-02 | C66 | SUS-09 | C101 | RESP-01, A11Y-12 |
| C32 | OP-03 | C67 | SUS-10 | C102 | A11Y-13 |
| C33 | OP-04 | C68 | EI-01, EI-06 | C103 | A11Y-14 |
| C34 | OP-05, OP-06 | C69 | EI-02 | C104 | RESP-03, RESP-04, RESP-08 |
| C35 | OP-07, OP-08 | C70 | EI-03 | | |

Requisitos da spec fora da seção 10, também cobertos: tabela 2.2 (FIL-12), URL 2.5/2.6 (FIL-04, FIL-09, FIL-17, FIL-18), estados 6.x (ST-xx), 7.5 Ajuda (NAV-09), 8.x (A11Y, RESP), regras de amostra mínima 4.0.2 (CALC-04, TAT-14, OP-09/12/13/17), decisões D1 a D13 (D5 OP-10, D6 FIL-10, D7 OP-05/OP-24, D8 CALC-04, D9 OP-13/14, D12 AVI, D13 FIL-01).

## 7. Separação unitário x E2E

| Responsável | Fica em |
|---|---|
| Unitário/componente (`react-frontend`, junto do código, com `TZ=UTC`) | CALC-10 a CALC-13, CALC-15, CALC-16, GER-01 a GER-09, OP-06, OP-08, OP-09, OP-12 (parte lib), OP-17 (parte lib), OP-20, TAT-07, TAT-11 a TAT-14, EST-02/03 (parte lib), EST-06, SUS-03, SUS-12, SUS-13, SUS-15, EI-01/03 (parte lib), FIL-04/09/11/15/17 (parte schema e validador), NOTA-04, VG-04, VG-08, VG-09, ST-06, ST-11, AVI-05, INV-01 (lint), INV-07 (parte lib), INV-10, BLD-02, BLD-04, A11Y-05 (tokens) |
| E2E e A11Y (`qa-engineer`, `e2e/`) | demais casos; os rotulados `U+E2E` têm as duas metades |

Regra de revisão do QA sobre o unitário: cada regra de cálculo do briefing 4.2 usada (descarte, reabertura P10, bug na janela de 30 dias, subtarefa, fila no WIP, exceção de SLA) deve ter um teste de fixture própria; faltando, o QA abre pendência para o `react-frontend`.

## 8. Organização da automação (próxima etapa)
`e2e/tests/` por área: `navegacao.spec.ts`, `aviso-ficticio.spec.ts`, `visao-geral.spec.ts`, `filtros.spec.ts`, `operacional.spec.ts`, `tatico.spec.ts`, `estrategico.spec.ts`, `sustentacao.spec.ts`, `espera-invisivel.spec.ts`, `calculo-e-base.spec.ts`, `notas.spec.ts`, `estados.spec.ts`, `regras-inviolaveis.spec.ts`, `a11y.spec.ts`, `responsividade.spec.ts`, `semente-alt.spec.ts`. Page Objects em `e2e/pages/` (`PainelPage`, `BarraFiltros`, `CartaoMetrica`, `Cabecalho`). Constantes (rotas, viewports, temas, termos proibidos) em `e2e/fixtures/constantes.ts`. Tag `@smoke` nos casos de XBR-01.

Pré-requisitos do front para automatizar (ver lacuna L5): `data-testid` da convenção da spec (`metrica-*`, `base-*`, `nota-*`, `tabela-*`, `amostra-insuficiente-*`, `estado-*-*`, `aviso-dados-ficticios`, `ei-*`, `seletor-*`), slugs de equipe/sistema/nível, chave de `localStorage` do tema e nome acessível do seletor de tema.

## 9. Critérios de entrada e saída
**Entrada para automatizar:** rotas e shell no ar (tarefa 9 do plano técnico), cartões com testids, `MockFonteMetricas` com `?mock=`.

**Saída (aprovação do QA):**
1. Todos os casos P1 passando; P2 passando ou com bug aceito pelo Jarvis; P3 reportados.
2. Nenhum bug crítico ou alto aberto (`docs/qa/bugs/`).
3. axe: zero violações críticas ou sérias nas 9 telas x 2 temas e nos estados/overlays P1/P2.
4. `npm run check` em `web/` verde e `npm run build` ok; E2E verde em Chromium; `@smoke` verde em Firefox e WebKit no CI.
5. INV-01 a INV-06 (regras invioláveis) todos verdes, sem exceção nem `skip`.
6. Lacunas L1 a L3 resolvidas (spec atualizada) antes de fechar CALC-07, SUS-05, SUS-09.
7. Resultado real da execução registrado na seção 12.

## 10. Riscos
- Dados do mock podem não cumprir as fixtures com os filtros padrão (L11): CALC-05 falha por dado, não por UI; GER-05 detecta antes.
- Recharts em SVG é pouco acessível: a verificação principal é a tabela equivalente (A11Y-08), não o SVG.
- Varreduras de texto (INV-01, INV-04, CALC-01) geram falsos positivos (ex.: "Protheus" é sistema e equipe); usar listas brancas explícitas e revisar com o `ux-designer`.
- Casos que dependem de tempo (esqueleto 150/300 ms) ficam em teste de componente com relógio falso para evitar instabilidade.
- Contraste de marcas SVG (≥ 3:1) não é coberto totalmente pelo axe; a verificação é calculada pelos testes A11Y-05.

## 11. Lacunas, contradições e perguntas sobre a spec
Cada item precisa de decisão antes de o caso respectivo ser fechado. Destino sugerido entre parênteses.

| # | Item | Impacto |
|---|---|---|
| L1 | **Contradição com J1.** A spec (4.0.3, seção E1/T7/EI, C55, C78) define 12 meses "provisória" para frente e projeto; o Jarvis decidiu 12 semanas para tudo. A spec e C78 precisam ser atualizadas (`ux-designer`). Consequência: com 12 semanas e ~40 projetos em 18 meses (plano técnico 3.3), E1 e o EI de FL3 ficam **sempre** em "amostra insuficiente" no mock; EI de FL2 e T7 ficam perto do limite. A Visão geral (que mostra EI por nível e "E3") herda isso. O caminho feliz de E1/EI-FL3 só é verificável por unitário com fixtures. Confirmar se isso é o desejado ou se o mock deve gerar volume para passar de 20 | CALC-07, EST-02, TAT-09, EI-01, EI-06, VG-05 |
| L2 | **Contradição com J2.** A spec (4.0.4, S1) mantém P1 em minutos/horas corridas (alvos 15 min, 4 h) e P4/P5 em dias úteis; o plano técnico (P7) mantém P1 em modo corrido. J2 manda horas úteis em todas. Falta definir: como expressar os alvos (P1 15 min e 4 h; P4 5 dias; P5 10 dias) em horas úteis (dia útil = 8 h?), se minutos continuam como rótulo para tempos < 1 h, e a unidade do EI da Sustentação | SUS-05, SUS-13, SUS-14, CALC-01 |
| L3 | C66 diz que S6 mostra "exatamente os cinco valores", mas a lista em S6 usa "Reclassificado, não é incidente" com vírgula (pode ser lido como 5 ou 6 valores). Informar o domínio fechado exato de motivo de encerramento | SUS-09 |
| L4 | A seção 3.3 desenha O12 dentro de FLUXO, mas lista o atalho "Compromissos"; C31 só fixa a ordem dos cartões. Definir os grupos/âncoras da cadência semanal | OP-02, OP-22 |
| L5 | Convenção de testes incompleta: faltam testid/id de "Bloqueados agora" e dos cartões EI (várias instâncias em `/espera-invisivel` e `metrica-EI` nos painéis); valores de `{nivel}` em `ei-*-{nivel}`; slugs de equipes e sistemas; chave de `localStorage` e nome acessível do seletor de tema; formato do `id` de âncora desses cartões (o spec cita `#ei`) | NAV-07, EI-xx, FIL-xx, A11Y-14 |
| L6 | Com todas as equipes selecionadas (equivalente a "Todos") a mensagem de consolidação aparece? E em Sustentação com 2+ equipes SSSC? C25 só diz "2 ou mais equipes" | FIL-10 |
| L7 | C6 diz que os links entre painéis de fluxo "preservam" `equipe`, `tipo`, `sistema`, `periodo`, mas Estratégico não tem equipe/tipo e tem outro período padrão (12m x 12s). Falta definir se `equipe`/`tipo` atravessam o Estratégico (mantidos na URL e restaurados ao voltar? descartados?) e se um `periodo` explícito vindo do Operacional vale no Estratégico | NAV-06, FIL-21 |
| L8 | Comportamento de `equipe=`/`tipo=` na URL do Estratégico (e `prioridade=` no fluxo) não definido: ignorar em silêncio ou avisar como inválido (2.6)? | FIL-21 |
| L9 | C27 exige "Filtros aplicados/Não afetado por" em todos os cartões; a tabela 2.2 não cobre EI nem "Bloqueados agora" por completo ("conforme o nível") | FIL-12 |
| L10 | T5 "Por área" e a ordenação por parcela de falha podem ser lidas como ranking de áreas solicitantes; a spec diz "não use para ranquear". Confirmar com o `ux-designer` que a ordenação é aceitável (não é pessoa nem equipe) | INV-09 |
| L11 | C76 e o requisito 9.2 pedem uma classe < 20 no FL1 **com filtros padrão**; o plano técnico garante "Dívida técnica em Plataforma 5G" e "Iniciativa em Senior", que dependem de filtro de equipe, e "Iniciativa" não aparece no filtro de tipo. Sem um tipo de demanda < 20 consolidado, o Operacional não terá classe insuficiente por padrão | CALC-05, GER-05 |
| L12 | T4: regra dos 20 itens conta chegadas+saídas (pergunta 20 da spec, resposta provisória) mas o texto da estatística diz "chegadas + saídas?" com interrogação; confirmar | TAT-07 |
| L13 | Parâmetro `mock`: não está definido se persiste na navegação entre painéis, quais ids `erro:<id>` existem (somente métricas? `erro:ei`, `erro:bloqueados`?) e se `carregando` é infinito. O plano assume: infinito, só no painel aberto, não propagado nos links | ST-03, ST-09, ST-12 |
| L14 | Cards "Incidente/Requisição" do BusinessMap e chamados do Acelerato podem confundir (pergunta 18 da spec, ainda aberta) | INV-11 |
| L15 | Valor de `periodo=custom`: início do histórico "01/08/2025" aparece na mensagem; a regra exata depende de `hoje` e `mesesHistorico` (18 meses ⇒ 09/04/2025?). Os limites do teste devem vir da fonte (`opcoesFiltro`), não fixos; confirmar a data mostrada | FIL-11 |
| L16 | Critério C94 fala "sem violações sérias ou críticas"; a skill do QA também. Violações moderadas/leves seriam só relatadas; confirmar que o time aceita | A11Y-01 a A11Y-04 |

## 12. Resultado da execução
**Nenhum E2E de tela foi executado** (o app está na fase A, sem shell completo nem painéis). Registro das verificações feitas em 2026-10-09 ao preparar a rev. 2, na máquina de desenvolvimento (WSL2, Node v24.21.0):

| Verificação | Resultado |
|---|---|
| `npm install` em `e2e/` | ok (Playwright 1.64.0, axe-core/playwright 4.13.0, TypeScript 5.9.3, `@lhci/cli` 0.15.x) |
| `npx playwright install chromium` | baixado (Chromium 156.0.8078.4, headless shell v1248) |
| Lançar o Chromium | **falha** sem as bibliotecas do sistema `libnspr4`, `libnss3`, `libasound2` (sem sudo). Contorno validado: baixar os `.deb` (`apt-get download libnspr4 libnss3 libasound2t64`), extrair com `dpkg -x` num diretório local e exportar `LD_LIBRARY_PATH=<dir>/usr/lib/x86_64-linux-gnu`; com isso o Chromium abre. Solução definitiva: `sudo npx playwright install-deps chromium` |
| `tsc --noEmit` em `e2e/` | ok |
| `playwright test --list` | ok (9 testes do projeto `perf` carregam; config com `E2E_SEM_ALT=1` dispensa o segundo servidor) |
| `npm run size` contra o `web/dist` existente (build de 19:04, fase A incompleta) | F6 JS inicial 171,54 KB gzip (< 200: ok); F8 chunk com gráficos 107,4 KB (< 130: ok); F9 mock + biblioteca 25,63 KB, fora do inicial (ok); F7 todas as rotas < 1 KB (placeholders). Valores provisórios: os painéis ainda não existem |
| `npm run fronteiras` | **falha**: `web/src/mock/acelerato/gerador.ts` importa `../businessmap/catalogos` (bug 001); sem outras violações |
| `npm run hash-base` | ok: `hashBase 924448d4`, BM `f780e90f`, AC `0113e077`, 5.788 cards, 6.062 chamados, geração 151 ms; repetição idêntica |
| Lighthouse, PERF-01 a PERF-05, PERF-14 a PERF-16 | não executados (dependem do app) |

Bugs abertos: `docs/qa/bugs/001-gerador-acelerato-importa-businessmap.md` (média, `react-frontend`).
