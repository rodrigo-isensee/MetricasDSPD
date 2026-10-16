---
tipo: qa
contrato: 1
pedido: 011-metricas-tambem-disponiveis-back
branch: feature/011-metricas-tambem-back
commit: 4c7efee
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-16
---

# QA: back do pedido 011 (K-078, cartões B1 a B12)

Links: plano `docs/qa/011-back-plano.md` (80 casos, 10 invariantes, 9 de T2.6, API, mutação, desempenho), especificação `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, pedido `docs/pedidos/011-metricas-tambem-disponiveis.md` (decisões de 2026-10-16), review `docs/reviews/011-back.md` (revalidado em 4c7efee), contrato `docs/api/metricas.md`, pergunta registrada `docs/qa/bugs/B11-001-t10-fornecedor-diferencia-caixa-do-nome.md`.

# Revalidação: revert do a1 e merge do #88

commit: 4c7efee
pedido: 011-metricas-tambem-disponiveis-back

Este trecho revalida o parecer depois de três commits entrarem na branch após o parecer de 03b6176: o revert do a1 (`d73474a`, devolve `MockFonteMetricas` ao código medido), o merge do #88 (`4e6b29c`, K-096 e K-097, que têm QA próprio em `docs/qa/k096-k097.md`) e o review revalidado (`4c7efee`, só documentação). O código de produção do 011 não mudou.

**Veredito da revalidação: aprovado, escopo completo mantido.** Zero bug crítico, alto, médio ou baixo aberto. O que mudou no diff `03b6176..4c7efee`:
- `web/src/data/mock/MockFonteMetricas.ts` e `.test.ts`: o revert do a1 tira o `cederTarefa` (C6, B11c-1). O estado do mock volta ao que foi medido no parecer de 03b6176.
- `server/src/modulos/metricas/repositorio.ts`, `server/src/plataforma/db/lgpd.ts`, `server/src/plataforma/db/seed.ts`, migração `0015_bm_remove_usuario_transicao.ts` e `checksums.json`: do #88 (K-096), que tira `fato_transicao.usuario` das leituras e da lista de colunas de pessoa. São mudanças de consulta e de lista, sem efeito nas métricas do 011.
- `docs/` (ADR 0020, data-model, server, segurança K-096/K-097, review): documentação.

**Onde rodei:** a worktree `/home/rodrigoisensee/MetricasDSPD-011-back`, limpa, no HEAD `4c7efee`. Tudo pesado sob `flock /tmp/metricas-pesado.lock nice -n 19`.

| Comando | Resultado |
|---|---|
| `pnpm run pronto` | **EXIT=0** (log em `/tmp/claude-1000/-home-rodrigoisensee-MetricasDSPD/d48e2c6b-73ac-47f2-9ee3-664a2a4ab172/scratchpad/pronto-4c7efee.log`) |
| `env -u DSPD_PWD_PESQUISA pnpm run test:pg` | **EXIT=0**, 15 arquivos, 83 testes passam (log em `.../scratchpad/testpg-4c7efee.log`) |

Por suíte, no `pronto`: lint, prettier e typecheck verdes; contratos 120 de 120; metricas 937 de 937 (cobertura 100% mantida); mock 206 de 206 (hashes da base sem mudança); server 562 passam e 83 pulados (`*.pg.test.ts`, cobertos pelo `test:pg` acima); spec-check 14 de 14; homolog 73 de 73; pesquisa 33 de 33; web 1.045 de 1.045; docs-contratos 102 de 102 com `docs:check` ok (442 páginas Markdown, 63 métricas, 2 eventos).

**Não reexecutei nesta revalidação:** E2E (incluindo axe), desempenho (ADR 0003) e mutação. O revert do a1 mexe no mock do front, que o E2E usa; o E2E que vale para o código medido continua o do parecer de 03b6176 e o do review. Se o `tech-lead` quiser o E2E sobre `4c7efee` antes do PR, é uma rodada de ~37 min com 1 worker.

**Ponto aberto que o revert reabre:** o B11c-1 (C6: a maior tarefa longa do painel, 235 a 466 ms no review sob carga) volta a ficar sem correção na branch, como estava no parecer de 03b6176. Não é bug de produção deste QA e não entra na contagem de bugs; segue com o `software-architect`, e a ADR 0003 trata o C6 como bloqueante do PR.

Os testes de correção e de regra deste parecer (`QA011 T2.6`, `QA011-API corte no meio do mês`, o INV-F7 e o EI-03) não mudaram; passam em `4c7efee` no `pronto`.

---

# B11b + B12 + merge da develop (QA final do back)

**Veredito: aprovado, escopo completo do back do 011 (B1 a B12), com uma ressalva fora do meu veredito: o C6 (B11c-1) segue aberto com o `software-architect`.** Zero bug crítico, alto, médio ou baixo aberto no que testei.

- **Commit testado: `03b6176`** = `9db6fd1` mais o commit só de teste do QA (inclui `5d3debf`, a correção B11b-1, e `364e15d`, o merge de `origin/develop` com a Sustentação, #87). Mais dois arquivos de teste meus, commitados por cima (ver "Testes novos").
- **Onde rodei:** a worktree `feature/011-metricas-tambem-back` tinha edições sem commit de outro agente (C6: `packages/mock/src/businessmap/gerador.ts`, `fases.test.ts`, `MockFonteMetricas.ts`). Para não testar código que não é o HEAD, rodei tudo numa worktree limpa em `9db6fd1` mais os meus dois testes (`pnpm install --offline --frozen-lockfile`). Dois pronto rodados na worktree suja falharam por causa disso (ver "Instabilidades"); **não valem como evidência** e não os conto.
- **Tudo pesado** sob `flock /tmp/metricas-pesado.lock nice -n 19`; E2E com `eval "$(bash e2e/scripts/setup-chromium-local.sh)"` e `LD_LIBRARY_PATH` exportado, 1 worker.

## Ratificação: a TENDENCIA_FLUXO fora do loop "todas as ids" de `qa011-fase1.test.ts`
**Ratificada, com um teste que fecha o buraco.** A razão do tech-lead está certa: a janela da tendência termina no último mês fechado (30/09 com "hoje" em 20/10) e não cruza 15/10 nem 16/10, então exigir a marcação nela seria afirmar uma coisa falsa. O que a exclusão deixava sem guarda era a própria tendência estar no `afeta`. Escrevi o `QA011 T2.6 tendência`: com "hoje" 20/10 a tendência **não** traz `descarte-nativo`; com "hoje" 20/11 (janela até 31/10) **traz** `descarte-nativo` e `excluido-entregue`. Mutante M-26 (pôr `TENDENCIA_FLUXO` na lista `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO`): o teste **falha**; produção restaurada. O guarda "44 ids" do loop fica como está (a tendência e o T11 saem dele nominalmente; o catálogo BusinessMap tem 46 ids, 45 delas marcadas).

## T11-1 a T11-6 (hash da extensão `cdcae971`)
| Caso | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| T11-1 | E `t11.test.ts` (janela fixa ancorada em "hoje"; o que é anterior fica fora; período do filtro não muda o T11) e `extensaoTambem.test.ts` (CA-12); E `server/tests/metricas.test.ts` T11 (`periodo=4s` igual ao padrão; `periodo=abc` dá 400); N `QA011-API T11` | passa | 24 fechados mais o corrente; período ignorado |
| T11-2 | E `t11.test.ts` (mês corrente `emAndamento`; com "hoje" no último dia do mês já fecha; filtros de equipe, tipo e sistema recortam sem encurtar o histórico); N `QA011-API` (a soma das equipes não passa do total e é maior que 0) | passa | último dia do mês; recorte |
| T11-3 | E `t11.test.ts` (histórico curto e extensão vazia: vazio, `historicoCurto`, nunca erro), `extensaoTambem.test.ts` (base sem demanda) e `metricas.test.ts` (fonte `real` devolve vazio com 200, nunca 500) | passa | vazio e menos de 24 meses |
| T11-4 | E `extensaoTambem.test.ts`: base intacta (`68a67741`, Acelerato `0113e077`), hash próprio **`cdcae971`** determinístico, picos de janeiro e julho (>= 1,25 x média), mês corrente parcial; E `metricas.test.ts` repete os picos pela API | passa | base BM intacta; hash |
| T11-5 | E `tambem.test.ts` (chave `mes-do-ano`, `marcacoes` em O24, O25 e T11); N `QA011-API T11-5`: `violacoes()` vazio e nenhuma chave `p50`, `p85`, `p95` ou `estatistica` no corpo | passa | censo, sem percentil |
| T11-6 | E `t11.test.ts` (nenhuma das duas versões do descarte o marca; mudança de critério explícita aparece) e `qa011-fase1.test.ts` (lista nominal) | passa | `afeta` correto |

Execução dedicada: `t11.test.ts` 9 de 9, `extensaoTambem.test.ts` 9 de 9, `metricas.test.ts -t T11` 3 de 3 (não vacuoso: o teste exige entradas depois do corte).

## Corte no meio do mês pela API (B11b-1)
Teste novo `QA011-API corte no meio do mês` (escala 0,25, `agora` 2026-10-10), com os números que medi:

| `dataReferencia` | `base.n` | `mesesComDado` | mês do corte |
|---|---|---|---|
| 2026-08-10 | 2.957 | 22 | agosto `emAndamento`, 48 entradas |
| 2026-08-31 | 3.030 | 23 | agosto fechado, 121 |
| 2026-09-15 | 3.088 | 23 | setembro `emAndamento` |
| padrão (sem data) | 3.194 | 24 | outubro `emAndamento` |

O teste exige `n` estritamente crescente com a data, agosto em andamento em 10/08 e fechado em 31/08, entradas de agosto menores em 10/08 que em 31/08, e **setembro e outubro de 2026 sem contagem em 10/08** (nada além do corte). Bate com o que o tech-lead mediu.
**Vermelho antes do verde:** `git show 5d3debf~1:packages/metricas/src/businessmap/t11.ts > t11.ts` e `vitest run tests/qa011-fase1.api.test.ts` no `server`: **falha** com `expected 3030 to be less than 3030` (sem a correção o corte em 31/08 e o de 10/08 dão o mesmo `n`, porque o mês inteiro é contado). Arquivo restaurado (M-27). Os dois testes do autor (`t11.test.ts` e `metricas.test.ts`) o review já viu falhar sem a correção.

## C4 por cadência, em CPU (`orcamentoC4.test.ts`, 11 casos, 3 rodadas verdes + 1 com saída impressa)
Leitura da rodada com saída, load de 1 min de 4,4 a 4,7 (a máquina estava disputada), fator de calibração do teste. Leitura só vale com fator <= 1,2.

| Painel e período | Fechada (orç. 300) | Aberta (orç. 450) | Fator | Leitura |
|---|---|---|---|---|
| Operacional diária 12s | 70 ms | 145 ms | 1,02 | válida |
| Operacional diária 12m | 42 ms | 153 ms | 1,00 | válida |
| Operacional semanal 12s | 69 ms | 152 ms | 1,00 | válida |
| Operacional semanal 12m | 101 ms | 236 ms | 1,05 | válida |
| Tático 12s | 29 ms | 80 ms | **2,00** | **inválida** (fator acima de 1,2); a 12m, válida, dá o mesmo patamar |
| Tático 12m | 25 ms | 82 ms | 1,00 | válida |
| Estratégico 12s | 7 ms | 33 ms | 1,02 | válida |
| Estratégico 12m | 9 ms | 34 ms | 1,02 | válida |
| `VISAO_GERAL` a frio (orç. 300) | 92 ms | n/a | 1,01 | válida |

Gerador lazy: mediana 3 ms (1ª 7 ms; orçamento 200 ms). C3 a frio dos ids novos: O19 2, O20 26, O21 4, O24 5, O25 3, T10 3, **T11 1**, T12 3, E7 1, E9 1 ms (< 50 ms). Todas as leituras válidas ficam abaixo da metade do orçamento. O pior caso (Operacional semanal 12m aberta, 236 ms) é 52% de 450 ms. **A 12s do Tático ficou sem leitura válida** nesta rodada; não repeti além das 3 execuções porque o dado da 12m e o do review (fator 1,00 a 1,03, 24 e 75 ms) cobrem o painel.
Os pedidos de rede por cadência (fechada pede só `idsDoC4`, `VISAO_GERAL` não é pedida em `/operacional`) são do review, medidos no navegador sobre `9db6fd1`; não os repeti, porque o front do 011 ainda não entrou.

## F5 e C6 (E2E de desempenho, `perf`, 1 worker)
- **F5** (painel atualizado na troca de filtro, com latência simulada, n = 20): mediana 39,4 ms, **p95 347,6 ms** (orçamento 500 ms), 1ª troca 541,7 ms. Passou. O load de 1 min ficou entre 2,3 e 2,6 na rodada (o teste de navegador não calcula o fator de calibração). F3 INP 48 ms, F4 mediana 32,2 ms, p95 57,4 ms. C5 heap 21 MB. CLS de 0,000 a 0,035.
- **C6** (maior tarefa longa, mediana de 15, orçamento < 200 ms): `/` 135 ms; `/operacional` 161 ms; diária 149; semanal 138; Tático 141; Estratégico 137; Sustentação 137. **Todos passaram nesta rodada**, com a máquina mais livre e 1 worker.
- **B11c-1 (C6): aberto, com o `software-architect`.** A leitura que passou aqui **não fecha** o achado: o review mediu 235 a 466 ms na mesma branch sob load de 2 a 3, e a `develop` fica em 174 a 200 ms. A medida é sensível à carga, e a ADR 0003 trata o C6 como bloqueante do PR. Não bloqueia o meu veredito sobre o resto do back; registro só que **em uma máquina quieta o C6 passou com folga de 20% a 30%** (135 a 161 ms), o que é um dado a mais para o architect decidir entre fatiar a geração, usar Web Worker ou tratar como alerta com ADR.

## Suíte completa sobre `9db6fd1` + meus testes (`pnpm run pronto`, EXIT=0)
| Suíte | Resultado |
|---|---|
| lint, prettier, typecheck | verdes |
| contratos | 120 de 120 |
| metricas (cobertura 100% mantida) | 937 de 937 (936 do review + 1 meu) |
| mock (hashes `68a67741`, `824092e4`, `495a0e07`, `cdcae971`; C1 e C2) | 206 de 206 |
| server | 562 passam, 83 pulados (`*.pg.test.ts`, cobertos pelo `test:pg` abaixo); inclui os 26 de `qa011-fase1.api.test.ts` (23 + 3 novos) |
| web | 1.045 de 1.045 |
| homolog / spec-check / pesquisa | 73 / 14 / 33 |
| docs-contratos (`docs:check`) | 102 de 102; "437 páginas Markdown, 63 métricas, 2 eventos" |
| **`test:pg`** (Postgres 17 no Docker, banco `metricas_test`, GRANT por coluna do K-085) | **EXIT=0**, 15 arquivos, 83 testes |
| `hash-base` | `5.792` cards, `6.062` chamados, geração 172 ms; hash da base `68a67741` (os testes do mock o afirmam) |
| **E2E completo, 1 worker** (`pnpm run e2e --workers=1`: `chromium`, `chromium-semente-alt` e `perf`) | **695 de 695 passaram em 37,0 min**, nenhum `skip`, nenhum `flaky` (inclui as 4 falhas por timeout e o CT-29 a 375 px da rodada paralela do review) |
| E2E API real (`chromium-api`, `com-api-mock.sh`, `E2E_API_URL`) | 27 de 27 (tendências CT-58, CT-59, CT-65; EI-03 e EI-03b) |
| Acessibilidade (axe, WCAG 2.2 AA, nos E2E dos painéis) | zero violação crítica ou séria nos 695 |

## Testes novos desta rodada (no repositório, só código de teste)
| Teste | Obrigação | Arquivo | Vermelho |
|---|---|---|---|
| `QA011 T2.6 tendência` | CR-1, CR-4: a tendência está no `afeta` e a marcação cruza a data quando a janela cruza | `packages/metricas/src/qa011-fase1.test.ts` | M-26, falha |
| `QA011-API T11 existe, sem percentil` | T11-5, A-2 (T11 não é 404) | `server/tests/qa011-fase1.api.test.ts` | n/a (obrigação de contrato; coberta também pelo schema `strict`) |
| `QA011-API toda equipe` | T11-2 | idem | n/a |
| `QA011-API corte no meio do mês` | B11b-1 pela API | idem | M-27, falha |

Mutantes acumulados do parecer: **27 à mão, todos mortos** (M-26 e M-27 desta rodada). Não há Stryker; a pontuação de mutação não é medida.

## Instabilidades registradas (nada foi marcado `skip`)
- `web/src/features/sustentacao/ramos.test.tsx`, "SLA fora da meta em mais de uma prioridade...: singular e plural": **falhou uma vez** por timeout de 5 s (5.259 ms, load 4 a 5, o arquivo inteiro levou 47 s) e **passa em 12 s sozinho**. Na rodada limpa passou. É teste de componente da Sustentação (#87), do `react-frontend`; sugiro dar folga de timeout ao teste (o `tech-lead` decide). Não é defeito do 011.
- `packages/mock/src/fases.test.ts` (arquivo novo, não commitado, do C6): "CPU por fase" falhou com 309,9 ms contra 300 numa rodada sob carga. É código do trabalho em andamento do architect; não está no HEAD e fica fora do meu veredito, mas o limite fixo de 300 ms sem fator de calibração tende a ser instável (os testes de C4 usam o fator).
- Lock: a suíte esperou o `flock` várias vezes por outros agentes; as medições de CPU só valem com o fator impresso.

## Bugs
Nenhum novo. Os abertos continuam sendo:
- **B11-001** (pergunta ao usuário, não bloqueia): o fornecedor do T10 deve ignorar a caixa do nome?
- **B11c-1** (C6, `software-architect`; não é bug de produção meu nem do QA).
- Recomendados do review ainda abertos: B12-1 (comentar a ponte por prefixo em `cartoes.ts`) e B12-2 (limpar a linha da ADR 0003), V2-2 já tratado.

## Pendências para o PR (fora do meu veredito)
1. B11c-1 resolvido ou aceito pelo architect, com ADR, antes do PR (a ADR 0003 trata o C6 como bloqueante).
2. Divergência do E7 (8 sistemas no mock contra 18 a 20 da spec) e a pergunta B11-001: levar ao usuário na validação.
3. Descrição do PR com os riscos e mudanças de comportamento do mock (O24, O23, exemplos de `docs/contratos`), como pede o review.
4. Os cartões do 011 ainda não estão no `CATALOGO_CARTOES` do front (a C4 aberta com os 10 do 011 só se mede quando o front entrar); a diária não tem seção "Mais métricas" na tela, então a C4 aberta diária é medida teórica. Decisão de desenho, não de back.
5. O parecer do front do 011 e a revisão de interface do `ux-designer` são outro cartão.

---

## Parecer anterior: B1 a B11a (commit fa5bdfe, escopo incremental)
*Substituído pelo veredito acima: o T11 (B11b) e o B12 estão cobertos; as pendências 1 e 5 da lista de pendências abaixo estão encerradas.*

## Veredito
**Aprovado, escopo incremental.** Zero bug crítico, alto, médio ou baixo aberto. O escopo é incremental porque os 6 casos do **T11 ficam "pendente B11b"**: o T11 ainda não está entregue no commit testado. A aprovação vale para B1 a B11a; o B11b exige parecer próprio.

- **Código de produção testado:** `a212d12`. O commit do parecer, `fa5bdfe`, só acrescenta teste (5 arquivos de teste). Não alterei código de produção.
- **Aviso de ambiente:** a partir das 16:24 o `node-backend` passou a editar a mesma worktree (B11b: `t11.ts`, `extensaoTambem.ts`, contratos, rotas), sem commit. As suítes unitárias, de API, de OpenAPI, do web e a 1ª rodada E2E rodaram antes disso, no código limpo (15:42 a 16:38, com o build do web feito às 16:17). A releitura das falhas E2E com 1 worker e a medição de desempenho rodaram com o B11b parcial na árvore; os resultados são os mesmos que antes e os arquivos de que dependem não mudaram (o hash da base continua `68a67741`). Nenhum arquivo do B11b entrou nos meus commits.
- **Decisões de 2026-10-16 ratificadas por teste:** O20-destaque = A, O25(b) = B, O19-pct = B e T10-janela = A.

## Ambiente
WSL2, Intel i5-1335U (8 núcleos lógicos), 8 GB de RAM (a máquina estava disputada por outros agentes), Node v24.21.0, Chromium do Playwright com bibliotecas locais, PostgreSQL 17 local no Docker (só para a API real do E2E). Tudo pesado sob `flock /tmp/metricas-pesado.lock nice -n 19`.

## Resultado por suíte
| Suíte | Resultado |
|---|---|
| contratos | 115 de 115 |
| metricas (cobertura 100% mantida, exit 0) | 856 de 856 (815 do review mais 41 do QA) |
| mock (hashes `68a67741`, `824092e4`, `495a0e07`; C1 e C2) | 180 de 180 |
| server | 512 passam, 83 pulados (os `*.pg.test.ts`, que se pulam sem o banco do test:pg; o review rodou o `test:pg` com exit 0). Mais 23 de 23 em `server/tests/qa011-fase1.api.test.ts`, rodado à parte porque o arquivo nasceu depois do início da suíte |
| `openapi:verificar` | "openapi.json em dia" |
| web | 838 de 838 |
| E2E grupo mock (projetos `chromium` e `chromium-semente-alt`) | 595 casos: 575 passaram; 4 falharam por timeout de 30 s e 16 não rodaram (describes seriais depois da falha). Os 3 arquivos foram repetidos com `--workers=1`: **165 de 165 passaram**, o que cobre os 20 casos. Nenhum `skip`. Eram timeouts por carga (a máquina rodava outras suítes), não defeito. Cada falha tinha `Test timeout of 30000ms exceeded` ou o `[aria-busy]` ainda presente aos 5 s |
| E2E API real (`chromium-api`, `com-api-mock.sh`) | 20 de 20, inclusive EI-03 e EI-03b |
| Acessibilidade (axe, WCAG 2.2 AA, nos E2E dos painéis a 1280 e 375, claro e escuro) | zero violação crítica ou séria nos casos que rodaram; os 3 arquivos que falharam por timeout a rodaram verde na repetição |
| `test:pg` | não repetido por mim (a fase 1 não toca o banco real; o review rodou: EXIT=0, 83 testes) |
| Stryker | **não está instalado** no projeto (nem `stryker.conf`); a mutação foi feita à mão, 25 mutantes (ver abaixo) |

## Os dois testes do QA (ratificações do review)

### R-1: INV-F7 do O20 (`packages/metricas/src/filtros.intensivo.test.ts`)
- Antes: `if (id === 'O20' && (na === 0 || nb === 0)) continue`, que pulava qualquer par com uma base zero.
- Agora: a aditividade (`nab <= na + nb`) só é dispensada no **estado vazio de fato** (lista `dias` vazia de uma das duas equipes). O limite inferior `nab >= max(na, nb)` vale sempre, inclusive no vazio. O cabeçalho do arquivo registra a exceção, o motivo e o dono.
- **INV-F7b** (teste dedicado): para cada par de equipes, período sem transição dá `dias` vazio e base 0 (21 pares por cenário); vazio mais dados dá consolidado não vazio e base maior ou igual à do lado com dados (36 casos mistos na base do app e 40 na pequena; guarda de pelo menos 1 par).
- Vermelho: mutando o `o20.ts` para `base = f.equipe.length > 1 ? pico * 3 : pico` o INV-F7 **falhou** nos dois cenários; com `pico + 1000` falharam o INV-F7 e o INV-F7b. Comando: `flock /tmp/metricas-pesado.lock pnpm exec vitest run src/filtros.intensivo.test.ts -t INV-F7` em `packages/metricas`. Verde com o código real: 4 de 4 (os dois INV-F7 e os dois INV-F7b, um por cenário).

### R-2: EI-03 (`e2e/tests-api/api.spec.ts`; saiu de `e2e/tests/b3-sust-ei-vg.spec.ts`)
- O teste antigo rodava no mock embutido, onde não há resposta HTTP para comparar nem para adulterar; a tolerância derivada do arredondamento deixava o índice passar por qualquer valor plausível. Foi removido de lá, com ponteiro no arquivo.
- Agora roda contra a API real: pega a URL que a tela pediu (`waitForResponse`), busca o mesmo valor com o contexto `request` (que o `page.route` não intercepta) e compara **exatamente** o número visível (`p[aria-hidden]`) e o texto acessível (`p.sr-only`) de cliente, time e índice com o valor formatado da API (1 casa nas medianas, 0 casas no índice). A primeira versão lia o `innerText` do contêiner, que mistura os dois textos; a mutação revelou que ela deixava passar um número visível errado, então a leitura foi separada.
- **EI-03b** guarda o vermelho para sempre: `page.route` soma 10 pontos ao `indicePct` da resposta que a tela recebe e o teste exige que a comparação aponte diferença no índice visível e no acessível.
- Vermelho pela UI: mudando `CartaoEI.tsx` para `fmtPct(est.valor.indicePct + 3, 0)` no número visível, o EI-03 **falhou** com `índice visível: tela "25%", API 22%`; restaurado o arquivo, 2 de 2 passam. Divisão por zero: o teste exige `cliente > 0` na API.

## Tabela critério, teste, resultado e fronteira protegida

Legenda: **E** = já existia e passou na execução; **N** = teste escrito agora, em `packages/metricas/src/qa011-fase1.test.ts` (QA011) ou `server/tests/qa011-fase1.api.test.ts` (QA011-API).

### Métricas (casos do plano, seção 3)
| Casos | Critério | Teste | Resultado | Fronteira protegida |
|---|---|---|---|---|
| O23-1 a O23-5 | CA-4, CA-5 | E `o23.test.ts`; N `QA011 O23-2` (19 itens "k de n", 20 publica) e `O23-3` (5 exato não conta; 5,5 e 6 contam) | passa | 19/20; borda "mais de 5 dias úteis"; vazio 0 de 0 |
| O23-6 | mock 20 a 30% | E `o23.test.ts` | passa (28,1%, desvio aceito no review) | alvo do mock |
| O19-1 a O19-8 | CA-5, CA-7, CA-24 (base), O19-pct = B | E `bloqueios.test.ts` | passa | 19/20 por causa; total 0 sem divisão; 84/85; abertos fora da soma |
| O19-9 | soma de `pctDoTotal` <= 100% | N `QA011 O19-9` (4 períodos no mock) | passa | soma máxima 100% |
| (mutante M-2) | O19-pct = B, numerador em dias | N `QA011 O19-pct = B` (20x2 dias contra 20x1 dia: 66,7% e 33,3%) | passa | numerador em dias, não em bloqueios |
| O20-1 a O20-9 | O20-destaque = A | E `o20.test.ts` (inclui B11a-8 e destaque do "Todas" sem Backlog) | passa | destaque nunca Backlog; vazio; aditividade por INV-F7 |
| O21-1 a O21-8 | CA-5, CA-6 | E `o21.test.ts` (O21-3 cobre 19/20 nos dois lados: `com` e `sem`) | passa | 19/20 por grupo; par por tipo |
| O24-1 a O24-8 | CA-17, CA-37 | E `o24.test.ts` | passa | mesmo instante não é ultrapassagem; classe Padrão |
| O24-10 | coerência pai e filho no mock (B11a-6) | E `mock` (review B11a-6) | passa | `criado_em` do filho >= pai |
| O25-1 a O25-10 | CA-19, CA-26, CA-44, O25(b) = B | E `o25.test.ts` | passa | 19/20; excluído sem instante usa a última revisão; entregue e excluído segue entrega |
| T10-1 a T10-6 | CA-11, CA-24, CA-36 | E `bloqueios.test.ts` | passa | sem fornecedor fora; 19/20 por fornecedor; 84/85 |
| T10-7 (baixa) | fornecedor em branco e caixa | N `QA011 T10-7` (só de espaços fica fora; espaços nas pontas não dividem) | passa; a caixa do nome **não é normalizada**: `Totvs`, `TOTVS` e `totvs` viram 3 linhas. A spec é omissa: virou **pergunta ao usuário**, B11-001 | nome vazio ou em branco |
| T12-1 a T12-8 | CA-11, CA-39 | E `t12.test.ts` | passa | critério (a) antes do início; 19/20 |
| E7-1, E7-3, E7-5, E7-6, E7-7 | CA-11, CA-13, CA-23 | E `e7.test.ts` | passa (E7-6: 8 sistemas no mock contra os 18 a 20 previstos; divergência já registrada, a levar ao usuário) | 19/20 por sistema; sem R$ |
| E7-2, E7-4 | CA-13, CA-23 | N `QA011 E7-2` (4 períodos: custo nulo e `custoConfigurado` falso) e `E7-4` (importa `naturezaDe` do T3) | passa | R$ nulo enquanto não configurado |
| E9-1 a E9-6 | spec do E9 | E `e9.test.ts` | passa | faixas 30/31, 90/91, 180/181; referência P85 por tipo |
| T11-1 a T11-6 | CA-12 (dados) | **pendente B11b** | não executado | n/a |

### Invariantes (plano, seção 2)
| ID | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| INV-1 | E por métrica; N `QA011 INV-1` (as 8 ids com percentil têm fixture de 19 e de 20 no arquivo de teste); N `O23-2` | passa | 19/20 |
| INV-2 (J-1, J-3) | E `bloqueios.test.ts` (84/85, T10 com 12 meses) | passa | dia 84 dentro, 85 fora |
| INV-2 (J-2) | N `QA011 J-2`: para O24, O25 e O21 o bloco de percentil é idêntico com 12 semanas e 12 meses, e o censo (`base.n`) muda | passa; mutantes M-19 e M-20 (percentil no período) **falham** | janela de 12 semanas em período longo |
| INV-3 (P-1, P-2, P-4) | E `tambem.test.ts`, `o20/o21/o24/t12.test.ts`, lint | passa | nenhuma pessoa nem equipe na saída |
| INV-3 (P-3, A-9) | E `api.sistemico-intensivo.test.ts` varre o corpo HTTP bruto das 60 rotas (nomes do mock, e-mail, chaves) | passa | sem pessoa |
| INV-4 (F-1) | N `QA011 F-1` (as 10 ids são `businessmap`) | passa | fonte |
| INV-4 (F-2) | E `SIS-ISO` (trocar toda a base do Acelerato não muda nenhuma métrica do fluxo; controle sensível) | passa | BM e AC separados |
| INV-4 (F-3) | E hashes do mock (`68a67741`, `824092e4`, `495a0e07`) e `mock.test.ts` | passa | Acelerato intacto |
| INV-5 (G-1) | E `o25/o21/t12/e7/bloqueios.test.ts`, `SIS-GRAN` | passa | story, frente e projeto separados |
| INV-6 (H-1) | N `QA011 H-1` (nem `modelo.ts` nem o contrato têm campo de horas apontadas; bloqueio no meio não tira o card de "parado") | passa | tempo apontado fora |
| INV-7 (H-2) | E `o20.test.ts`, `o25.test.ts` | passa | arquivado e excluído permanecem |
| INV-8 (B-1) | N `QA011 B-1` (10 arquivos sem percentil, quantil ou dias úteis próprios) | passa | biblioteca única |
| INV-9 (AL-1, A-12) | N `QA011 AL-1` (enum de alertas e VISAO_GERAL do mock) e N `QA011-API A-12` (resposta HTTP) | passa; o alerta `O2_ACIMA_P95` é anterior à fase 1 e do O2, não do O23 | sem alerta da fase 1 |
| INV-10 (O-1) | E `bloqueios/t12/e7.test.ts` | passa | ordem neutra |

### T2.6: marcações de critério (INV-11)
| ID | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| CR-1, CR-4 | N `QA011 T2.6`: com "hoje" 20/10, as **44** ids BusinessMap trazem `excluido-entregue` e `descarte-nativo` no resultado | passa; mutante M-16a (tirar a versão da lista) **falha** | período que cruza a data |
| CR-2, CR-3, CR-5 | N: `o19-pct` só no O19, `o20-destaque` só no O20, `parados-v1` só no O2 (nas 44 ids) | passa; mutante M-16b (O20 fora do `afeta`) **falha** | versão só da métrica afetada |
| CR-9 | N: período que termina em 15/10 não traz; em 16/10 traz (O3, O19, O20, O25, E7, T12, E9); `descarte-nativo` entra a partir de 15/10 e `parados-v1` a partir de 14/10 | passa | dia exato da versão |
| CR-6, CR-7, CR-8 | E (`o25/t12/e9/e7/o20/bloqueios.test.ts`) | passa | série sem id repetido |

### API (plano, seção 4)
| ID | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| A-1, A-3, A-4 | E `api.sistemico-intensivo.test.ts`: as 60 ids, filtros válidos (200, schema `strict`, ETag, 304) e inválidos (400 sem eco; `pessoa=`, `responsavel=` recusados) | passa | filtro inválido |
| A-2 | N `QA011-API A-2`: `O22`, `O26`, `T13`, `T14`, `E6`, `E8` dão 404 `METRICA_NAO_ENCONTRADA` e não estão no catálogo | passa | sem dado inventado |
| A-5 | N `QA011-API A-5`: 10 ids x (Todas e cada equipe) x 4 períodos: 200 no schema e nenhum percentil com n < 20 | passa | n < 20 |
| A-6 | N `QA011-API A-6`: período futuro dá 422 `PERIODO_FORA_DO_HISTORICO` nas 10 ids; recorte sem dado dentro do histórico: T10 vazio (n 0) e O20 de fim de semana com `dias` vazio, 200 válido | passa | vazio e fora do histórico |
| A-7 | E `metricas.paridade.test.ts` (API = biblioteca, todas as ids) | passa | paridade |
| A-8 | `openapi:verificar` | em dia | contrato versionado |
| A-9 | ver INV-3 | passa | sem pessoa |
| A-10 | E `api-perf.sistemico-intensivo.test.ts` | passa | payload < 50 KB |
| A-11 | N `QA011-API A-11`: POST, PUT, PATCH e DELETE em `/metricas/O20` dão 404 ou 405 e o corpo do GET não muda | passa | somente GET |
| A-12 | N `QA011-API A-12` | passa | sem alerta da fase 1 |

## Vermelho antes do verde e mutação (25 mutantes à mão, todos mortos)
Procedimento: alterar o arquivo de produção, rodar os testes da métrica, restaurar com o conteúdo original (nenhum arquivo de produção ficou alterado). Comando-tipo, em `packages/metricas`: `pnpm exec vitest run src/businessmap/<m>.test.ts src/qa011-fase1.test.ts --coverage.enabled=false`.

| Mutante | Mudança | Resultado |
|---|---|---|
| M-1a, M-1b | `MINIMO_AMOSTRA` 20 para 19 e para 21 | falhou (O19, O21, O23-2 e outros) |
| M-1c | E7 `>=` para `>` | falhou (`e7.test.ts`, fronteira 19/20) |
| M-1d | O21 `<` para `<=` no grupo | falhou (CA-6 e regra 7) |
| M-2 | O19: numerador do percentual em bloqueios | **sobreviveu** aos testes existentes (as fixtures tinham 1 dia por bloqueio, então bloqueios = dias). Escrevi o teste `O19-pct = B`; agora falha |
| M-3 | O20: destaque aceita Backlog | falhou |
| M-4 | O25(b) revertido (entregue e excluído vira descarte) | falhou |
| M-5 | O25: excluído sem instante perde a última revisão | falhou. A 1ª versão do mutante (trocar o argumento no ponto de chamada) era equivalente, porque o ramo só existe com `excluido_em` preenchido; mutei a função `instanteDeExcluido`, que é onde a regra mora |
| M-6a, M-6b | O24 inclui Urgente (varredura e inícios) | falhou |
| M-7 | O24 `<` para `<=` | falhou |
| M-8 | O24 espera deslocada | falhou |
| M-9 | T12 critério (a) vale depois do início | falhou |
| M-10 | T10 aceita sem fornecedor | falhou |
| M-11 | janela de 84 para 85 dias | falhou |
| M-12 | O23 `>` para `>=` | falhou **só** no teste novo (O23-3 era "a escrever") |
| M-14 | E9 faixa 90/91 | falhou |
| M-15 | E7 devolve R$ com custo não configurado | falhou |
| M-16a, M-16b | tirar `excluido-entregue` da lista; O20 fora do `afeta` | falhou |
| M-17 | O19 devolve campo `equipe` | falhou (schema `strict` e varredura) |
| M-18 | T10 sem ordenar | falhou |
| M-19, M-20 | O24 e O25 com percentil no período em vez da janela | falhou (J-2) |
| INV-F7 (x3 e +1000) | O20 consolidado soma a mais | falhou (INV-F7 e F7b) |
| EI-03 | UI com índice + 3 | falhou |

Como não há Stryker, **a pontuação de mutação não é medida**; o que vale é a lista acima. A meta de pontuação não está em `docs/engineering/praticas.md`.

## Desempenho (ADR 0003)
Máquina disputada por outros agentes, um processo por vez, sob o `flock`.

| ID | Resultado | Orçamento | Veredito |
|---|---|---|---|
| PF-1 C1: gerar a base e montar o contexto (relógio de parede, 3 processos) | 442, 376 e 357 ms; **mediana 376 ms** (o tempo de CPU somado é maior, 635 a 799 ms, por GC e compilação em outras threads) | < 500 ms | **dentro** |
| PF-2 C2: gerador | 434 a 524 ms no `desempenho.test.ts` (3 rodadas) | < 1,5 s | dentro |
| PF-3 C3 a frio, mediana de 5 contextos (`desempenho.test.ts`, 3 rodadas) | O19 3 a 9 ms; **O20 34, 30 e 52 ms**; O21 5 a 6 ms; O24 13, 20 e 22 ms; O25 6 a 7 ms; T10 2 ms; T12 3 a 4 ms; E7 2 ms; E9 1 ms; O2 16 ms (rodada 1) | < 50 ms (CI 150 ms, CPU) | **dentro**; ver risco do O20 |
| PF-3 sonda própria, 1ª chamada em contexto novo, CPU, 3 processos com a ordem rotacionada | O2 23 a 64; O19 5 a 25; O20 99 a 195; O21 14 a 40; O24 25 a 38; O25 13 a 30; T10 4 a 12; T12 7 a 8; E7 4 a 14; E9 2 a 3 ms | informativa | o O20 inclui a compilação do primeiro uso no processo e passa de 150 ms em 1 de 3 (195 ms); o teste oficial, que usa a mediana de 5 contextos, é o que vale |
| PF-4 C4: VISAO_GERAL | 106 a 110 ms | < 300 ms (CI 900) | dentro (estava em 655 ms em 2026-10-09). Os painéis Operacional, Tático e Estratégico inteiros **não** foram medidos |
| PF-5 O1 | a frio 52 ms (fator de calibração 1,61), 13 ms nas chamadas seguintes | sem regressão | sem regressão |
| PF-6 caches sem teto | **não executado**; já registrado no review como disponibilidade, baixa, do `security-engineer` | n/a | pendente de outro agente |
| PF-7 API (A3) | `api-perf.sistemico-intensivo.test.ts` passou | payload < 50 KB | dentro |
| hash | `hash-base`: `hashBase 68a67741`, 5.792 cards, 6.062 chamados, geração 254 ms | igual ao esperado | confere |

## Pendências
1. **T11 (B11b): 6 casos pendentes** (T11-1 a T11-6) e o parecer do B11b. O `NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO` e os testes que o T11 mexe (por exemplo o de 44 ids em `o23.test.ts`) estão sendo editados na worktree pelo autor; o meu `QA011 T2.6` já deixa de fora o T11 pela lista nominal da biblioteca.
2. **B11-001, pergunta ao usuário:** o fornecedor do T10 deve ignorar a caixa do nome? Não bloqueia.
3. **Divergência do E7:** 8 sistemas no mock contra os 18 a 20 da spec; a levar ao usuário na validação.
4. **Observação do O23:** o limite "mais de 5 dias úteis" é aplicado ao valor já arredondado a 2 casas (5,004 aparece como 5 e não conta). O erro máximo é de 0,005 dia (cerca de 3 minutos); não aparece na tela e o review já registrou o arredondamento.
5. **Stryker** não instalado; sem pontuação de mutação (ver acima).
6. **Aceites de mudança incompatível:** `aceitas.json` sem resíduo no diff do back; a ratificação do architect continua com o review.

## Riscos
- **O20 a frio** é a métrica da fase 1 mais próxima do orçamento de 50 ms: 30 a 52 ms no teste oficial sob carga (1 de 3 rodadas ficou acima de 50 ms; o limite de CI, 150 ms, não é ultrapassado). Vale reavaliar quando a máquina de referência estiver ociosa.
- **E2E por carga:** a suíte completa do grupo mock leva cerca de 20 minutos e, sob contenção, 4 casos estouram 30 s. A repetição com 1 worker é verde. Vale um reforço de timeout nesses 3 arquivos, decisão do `tech-lead`.
- **Worktree compartilhada:** o B11b está sendo escrito na mesma worktree, sem commit; qualquer mudança de contrato lá pode exigir nova rodada do QA sobre o commit que o autor fizer.
- **Evidências E2E:** a suíte reescreve imagens de `docs/qa/evidencias/`; restaurei com `git checkout` e não as commitei.
