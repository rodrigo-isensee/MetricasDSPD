---
tipo: qa
contrato: 1
pedido: sustentacao-no-operacional
branch: feature/sustentacao-no-operacional
commit: 18d8327
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 2
bugs_baixos: 2
aceite_usuario: sim
data: 2026-10-14
---

# QA: Sustentação dentro do Operacional (K-072 e K-073)

Links: plano `docs/qa/sustentacao-no-operacional-plano.md` (77 casos, CT-01 a CT-77), especificação `docs/ux/sustentacao-no-operacional/especificacao.md` (CA-1 a CA-31) e adendo `05-adendo-review.md` (A1 a A10; U1 = a), plano técnico `docs/architecture/plano-sustentacao-no-operacional.md`, contrato `docs/api/metricas.md`, review `docs/reviews/sustentacao-no-operacional.md` (aprovado na volta 3, 67624ba), bugs `docs/qa/bugs/SNO-001` a `SNO-005`.

## Veredito
**Aprovado com ressalvas** (frontmatter `parecer: aprovado` com `aceite_usuario: sim`, porque há 2 bugs médios e 2 baixos abertos). Nenhum bug crítico ou alto aberto. Zero violações de acessibilidade sérias ou críticas em todas as telas e variantes testadas.

O código de produção testado é o de **67624ba**; os commits seguintes do QA só mexem em teste (`80d2fbf`, `18d8327`). A rodada achou um problema grave de processo, já resolvido no teste: a suíte E2E completa estava **vermelha com 124 falhas** (SNO-003), porque a adaptação dos E2E antigos ficou incompleta. O `pnpm run pronto` não roda E2E, por isso não acusou. Nenhuma das 124 era defeito de produção.

Abertos (todos aceitos para a entrega, a confirmar pelo usuário):
| Bug | Sev. | Resumo | Responsável |
|---|---|---|---|
| SNO-001 | média | Cabeçalho global estoura a largura (640 px) a 375 px com fonte a 200%, em todas as telas; **pré-existente**, fora do escopo da demanda | react-frontend |
| SNO-004 | média | CLS do Resumo = 0,125 no Lighthouse (orçamento F2 = 0,1), reproduzido 3/3; o F2 do Playwright passa | react-frontend |
| SNO-002 | baixa | "Leia junto" O15 para O17: o `aria-label` não contém o texto visível (WCAG 2.5.3) | react-frontend |
| SNO-005 | baixa | Primeira consulta de cada fonte depois de subir a API passa de 300 ms (100 a 741 ms sob carga), qualquer métrica; **pré-existente** | node-backend |

## Ambiente
WSL2 com 8 GB, Chromium headless do Playwright (bibliotecas de sistema via `~/.local/chromium-libs`), `flock /tmp/metricas-pesado.lock` + `nice -n 19`, uma execução pesada por vez. Carga de 1 minuto entre 0,4 e 7 (outros agentes usavam a máquina; as execuções de tempo variaram bastante por isso). Docker presente: Postgres do Compose subiu junto com o Playwright sem estourar a memória (6 GB livres no início das execuções), rodado um de cada vez.

## Critério → teste → resultado
`dev` = `e2e/tests/sustentacao-no-operacional.spec.ts` (dos autores, um teste por CA); `qa` = `e2e/tests/sustentacao-no-operacional-qa.spec.ts` (deste parecer). Resultado no commit testado: **todos os testes dos dois arquivos passaram** (43 no spec do QA); a rodada final, com `responsivo.spec.ts`, somou 92 testes verdes.

| Critério | Teste (caso) | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 menu sem Sustentação | dev CA-1 (CT-01); `shell` NAV-01/02 adaptado | 1280 e 375 px (gaveta); 6 destinos exatos | passou |
| CA-2 seletor Visão, histórico | dev CA-2 (CT-02) | Resumo marcado sem parâmetro; Voltar volta ao Resumo | passou |
| CA-2 teclado | qa CT-03 | Tab até o grupo, 3 setas à direita, 1 à esquerda, volta ao Resumo, foco no rádio; cada seta é `push` (A7) | passou |
| CA-3 uma fonte por visão | dev CA-3 (CT-04) | só O17 como O* na Sustentação; nenhum S*, EI-SUST, PV1 no fluxo (inclui complementares abertas) | passou |
| CA-4 selo de fonte | dev CA-4 (CT-05) | mínimo de 3 cartões por visão (guarda contra suíte vazia) | passou |
| CA-5 filtros por visão | dev CA-5 (CT-06); qa CT-10 | legenda por fonte; `sust_prioridade=P9` ignorada com aviso que cita a Sustentação | passou |
| CA-6 filtros guardados | dev CA-6 (CT-07, CT-08, CT-09); `intensivo-filtros` IF-D1 | `prioridade` sem prefixo cai em silêncio; filtros do fluxo ficam guardados na URL da Sustentação | passou |
| CA-7 rodapé do cartão | dev CA-7 (CT-11) | S* nunca cita Tipo ou Sistema; O* nunca cita Prioridade | passou |
| CA-8 Pede atenção por fonte | dev CA-8 (CT-12); `atencao.test.ts` | título e janela escritos; links só à visão dona | passou |
| CA-9 sem "Também nesta aba" | dev CA-9 (CT-13) | as 4 visões | passou |
| CA-10 índice e ocultas | dev CA-10 (CT-14) | ocultar S3 e S4 retira "Volume e resolução"; 375 px | passou |
| CA-11 redirecionador | dev CA-11 (CT-15, CT-16); qa CT-17 (3 hashes), CT-18 (8 abusos) | sem laço no Voltar; hashes `compl-sust-*`; `next=//evil.com`, CRLF, `//` e `\` no hash, `cadencia` como URL, `javascript:`, `sust_*` forjado: sempre `/operacional`, mesma origem, zero requisição externa e zero diálogo | passou |
| CA-12 hash decide a visão | dev CA-12 (CT-19); qa `#S2` | hash em maiúsculas; unicidade dos hashes (`visao.test.ts`) | passou |
| CA-13 `/espera-invisivel#ei-sust` | dev CA-13 (CT-21); `espera-invisivel` adaptado | um salto, só filtros `sust_`; `#ei-fl1` vai à Semanal | passou |
| CA-14 preferências | dev CA-14 (CT-22); qa CT-23 | perfil antigo lido; gravado em `paineis.sustentacao.ocultar` com as mesmas três chaves, outros painéis intactos, uma só chave no `localStorage`; corrompido: padrões, sem erro e sem sobrescrever; `versao: 2`: padrões, nada oculto e **nunca sobrescrito, nem ao mudar preferência** (A6) | passou |
| CA-15 exportação | dev CA-15 (CT-24); qa CT-25 (PDF aberto com pdfjs) | Sustentação: só Acelerato, S2 sim, S3 e PV1 ocultos fora do arquivo, sem e-mail nem pessoa; Semanal: só BusinessMap; Resumo: duas fontes em seções separadas, sem tendência | passou |
| CA-16 Visão geral | dev CA-16 (CT-26); `b3-sust-ei-vg` VG-02/06 adaptados | nenhum link vai ao Resumo; 7 reuniões | passou |
| CA-17 catálogo | dev CA-17 (CT-27) | S1 a S12, O17, EI-SUST, PV1 com painel "Operacional · Sustentação" | passou |
| CA-18 leia junto O15 para O17 | dev CA-18 (CT-28); `SIS-CONS-02` adaptado | troca a visão, abre Mais métricas, foca o cartão; nenhum número cruza | passou (SNO-002 aberto, baixa) |
| CA-19 acessibilidade | dev CA-19 (CT-29, CT-30); qa CT-29 (variantes), CT-31 | axe WCAG 2.2 AA nas 4 visões a 375 e 1280, também com Mais métricas aberto e com cartões ocultos; anúncio `aria-live` e título por visão; foco por hash não encoberto (2.4.11); `prefers-reduced-motion` sem rolagem suave | passou (0 violações sérias ou críticas) |
| CA-20 layout 375 e 1280 | dev CA-20 (CT-32); qa CT-32 (zoom) | sem rolagem horizontal nas 4 visões a 1280, 640 (200% de zoom), 375 e 320 px (400%); seletor em até 2 linhas e alvos de 44 px, também com fonte a 200% | passou (SNO-001 aberto, média: a página inteira com fonte a 200% a 375 px, pré-existente) |
| CA-21 chunk e orçamento | dev CA-21 (CT-33); `perf:tudo` (CT-34) | Diária e Semanal não baixam `VisaoSustentacao-*.js` (33 KB, chunk próprio); inicial 190,66 KB gzip < 200 KB | passou; Lighthouse: SNO-004 |
| CA-22 sem coleta do Acelerato | dev CA-22 (CT-35) | `SemDadosDaFonte` só na Sustentação; fluxo funciona | passou |
| CA-23 Resumo padrão | dev CA-23 (CT-37) | `cadencia=resumo` normalizado; `cadencia=RESUMO` e `xyz` caem no Resumo com aviso, sem entrada no histórico (qa CT-10) | passou |
| CA-24 compatibilidade | dev CA-24 (CT-38); varredura por grep | nenhum link interno cai no Resumo; os `'/operacional'` sem `cadencia` que sobram no código são o Resumo, o item do menu e o caminho das funções de URL e de exportação | passou |
| CA-25 fontes separadas | dev CA-25 (CT-39); qa CT-65 | O17 fora do Resumo; sem "total geral"; blocos empilhados | passou |
| CA-26 números-chave | dev CA-26 (CT-40, CT-41, CT-42); unidade `modelo.test.ts` | 7 números com base, unidade e link; n = 19 sem valor e n = 20 publica; empate do tipo predominante determinístico (A9) | passou |
| CA-27 tendência | dev CA-27 (CT-43, CT-44, CT-45); qa abr a set/2026 sem mês em curso; `tests-api` | mês com n = 14 vazado e sem linha ligando vizinhos; volume do mês = S3 do mês (6 de 6 meses, API real) | passou |
| CA-28 alertas por fonte | dev CA-28 (CT-46) | título e janela por fonte, nota "Mesmo alerta, janelas diferentes" (U1 = a) | passou |
| CA-29 Resumo sem filtros | dev CA-29 (CT-47) | O3 oculto: marcador e série P85 some; nenhuma chave nova no `localStorage` | passou |
| CA-30 exportar no Resumo | dev CA-30 (CT-48); qa CT-25 | dois níveis pré-selecionados (título do teste dos autores corrigido na spec, A4) | passou |
| CA-31 estados por bloco | dev CA-31 (CT-49); qa CT-50, CT-51, CT-36 | `erro:o3` não diz "nenhum dos últimos 6 meses atinge 20 itens", mostra erro próprio com "Tentar de novo"; `erro:s2` na Sustentação isola o cartão; gráficos `role="img"` com `aria-label`, tabela só sob pedido | passou |

## Cenários e resultado real (77 casos)
| Casos | Obrigação | Resultado |
|---|---|---|
| CT-01 a CT-51 | CA-1 a CA-31 (tabela acima) | **passaram** (unidade e integração no `pronto`; E2E nos dois spec e nos 12 adaptados). Home/End no seletor: o rádio nativo não os trata; não exigido, anotado |
| CT-52, CT-53 | 53 `MetricaId`; `S3.janela` obrigatória | passaram (`contratos`, `varredura`, `server/tests/metricas`); CT-53: teste novo `packages/contratos/src/s3-janela.test.ts`, mutante `.optional()` morre |
| CT-54 a CT-57 | tendência = métrica de origem; fronteiras 19/20; fontes separadas; `S3.janela` | passaram (`tendencia.test.ts`, `regras.property.test.ts`); com a API real: volume de cada mês = `S3.base.n`, prioridades = `S2` no fim do mês, `p85PorTipo` = `O3.classes` (CT-45 e CT-54, `tests-api/tendencias.spec.ts`) |
| CT-58 | API: 200, 304, 400 | passaram em unidade e na API real (cabeçalhos `x-data-referencia`, `x-versao-criterio`, `etag`; 400 para `equipe`, `tipo`, `prioridade`, `periodo`, `pageSize`, `usuarioKey`, data futura, `2026-13-40`, `2026-02-30`, vazio) |
| CT-59 | sem pessoa; GRANT por coluna | corpo das duas tendências sem pessoa, título, e-mail (API real). `test:pg`: **57 de 64 passaram; 7 falharam em `pesquisa.pg.test.ts`** com `permission denied for database "metricas_test"` (papel `dspd_pesquisa` no Postgres local). Mesma falha numa árvore baseada em `develop` (`/home/rodrigoisensee/MetricasDSPD-fix-if-a`); arquivo e área intocados pela demanda: **ambiente, não atribuído ao diff** |
| CT-60 | contrato e documentação | `docs:check` ok (394 páginas, 53 métricas, 2 eventos) |
| CT-61 | `mes` AAAA-MM (L3) | passou (`d4ac4dd`, contratos); `2026-13` recusado |
| CT-62 | front lê as tendências por HTTP | passou (`HttpFonteMetricas.test.ts`; `tendencias.spec.ts` na API) |
| CT-63 | sem avaliação individual | passou: varredura do DOM das 4 visões (e-mail, `usuarioKey`, Pessoa, responsável, assignee, ranking, meta por pessoa) e do PDF; texto lido > 500 caracteres por visão |
| CT-64 | sem comparação entre times | passou: nenhum "melhor/pior equipe", "ranking", tabela ou lista ordenada de equipes no Resumo |
| CT-65 | BM e Acelerato não se misturam | passou: selo trocado, "total geral", "somados", "ambas as fontes" ausentes; "leia junto" sem número; corpos das duas tendências só com o próprio domínio |
| CT-66, CT-67 | story só; mínimo de 20; janela de 12 semanas | passaram (`modelo.test.ts`, `regras.property.test.ts`, 19/20 no E2E) |
| CT-68 | cálculo só na biblioteca | varredura do diff do front: único achado `Math.round(ultimo) - Math.round(antes)` em `fraseDaSerie` (L1, delta de dois valores já publicados, arredondados como na tela); sem percentil, quantil ou média na tela. Sem achado |
| CT-69, CT-70 | critério marcado; histórico e só GET | passaram (`graficos.test.tsx`, `tendencia.test.ts`); nenhum método diferente de GET na SPA nas 4 visões (E2E) |
| CT-71 | métricas proibidas | passou: DOM sem produtividade individual, velocidade em pontos, horas apontadas, % de conclusão, média de ciclo |
| CT-72 | credenciais e só GET no Acelerato | `git diff origin/develop...HEAD` sem `apikey`, `token`, `password`, `senha`, `secret` fora de teste e doc; sem POST novo em `server` e `packages` |
| CT-73, CT-74 | A1 fria e A2 quente das tendências, Postgres real | ver "A1 e A2" |
| CT-75 | A1 do navegador no Resumo | Resumo: 12 GETs por carga (120 de 120 amostras), p95 68 a 132 ms; tendências pedidas depois dos 10 números |
| CT-76 | `dataReferencia` fora do cache | p95 46 a 109 ms nas duas (n = 10 por execução) |
| CT-77 | primeira consulta depois de subir a API | evidência registrada em SNO-005 |

## Execução (resultado real por suíte)
| Suíte | Resultado |
|---|---|
| `pnpm run pronto` (lint, `format:check`, tsc, unidade com cobertura 100%, build e orçamentos, `docs:check`) | **verde, exit 0** (antes dos testes novos do QA; depois: `eslint` e `prettier` dos arquivos novos limpos). contratos 45, metricas 653, mock 161, server 425 passaram e 64 pulados (os de Postgres, rodados à parte), web 1031, spec-check 14, homolog 73, pesquisa 33, docs-contratos 102 |
| E2E completa `chromium` + `chromium-semente-alt` (673), 2 workers | **672 passaram, 1 falhou**: IF-A `/operacional?cadencia=semanal` ("Não afetado por X"), timeout de 30 s sob carga. Isolada, passou em 25,7 s (e o Tático em 24,3 s); mesma instabilidade registrada em `docs/qa/bugs-intensivos.md`, e outro agente corrige em `K-083`. Reportada, sem `skip` |
| E2E da rodada final (dev + qa + responsivo), 2 workers | **92 passaram, 0 falharam** |
| E2E na primeira execução (HEAD sem correção de teste) | 549 passaram, 124 falharam: SNO-003 |
| `chromium-api` (`tendencias.spec.ts`, API real com Postgres) | **7 de 7 passaram** em 3 execuções |
| `test:pg` | 57 passaram, 7 falharam por ambiente (ver CT-59) |
| `perf` (Playwright no mock): F1 LCP p95 504 ms; F2 CLS e C6 em 7 rotas a 1366 e 375 px; F3 a F5; C5 | **17 de 17 passaram** |
| `size`: F6 190,66 KB < 200 KB; F8 111,38 KB < 130 KB; chunks de rota < 60 KB | passou |
| Lighthouse nas 3 URLs (3 execuções cada) | desempenho 87 a 97, acessibilidade 100; **1 aviso**: CLS do Resumo 0,125 (SNO-004) |
| `perf-api` | ver "A1 e A2" |

## A1 e A2 no Postgres real
Ambiente: `MOCK_MESES_HISTORICO=24 bash scripts/com-api-mock.sh ...` (seed do mesmo mock do front, **24 meses**, escala 1, Postgres do Compose, schemas temporários, `DADOS_FONTE=mock`), API em `:3100` atrás do `vite preview` com `/api` encaminhado. `PERF_REPETICOES_A1=10`. Ajuste de fixture do QA: a variável `MOCK_MESES_HISTORICO` em `server/tests/pg/servidor-api-mock.ts` (sem ela o seed fica nos 18 meses de sempre). Testes novos em `e2e/perf/perf-api.spec.ts`: as duas tendências (fria e quente), datas de referência variáveis, ordem das requisições do Resumo, espera da rede assentar e mínimo de amostras por rota. Correção de teste feita antes das medições: sem esperar a rede, a rota da Sustentação dava **0 amostras** e a do Resumo 1 de 10 cargas (o `esperarCartoesProntos` volta no h1 antes da visão montar); a medição de antes dessa correção foi descartada.

Três execuções completas, com a máquina compartilhada (carga 2 a 7):
| Medida | Execução 1 (descartada: medição truncada) | Execução 2 | Execução 3 |
|---|---|---|---|
| TENDENCIA_FLUXO fria, 1ª chamada | 11 ms | 14 ms | 29 ms |
| TENDENCIA_SUST fria, 1ª chamada | 10 ms | 68 ms | 14 ms |
| TENDENCIA_FLUXO quente, p95 (A2, alerta 50 ms) | 20 ms | 103 ms | 83 ms |
| TENDENCIA_SUST quente, p95 | 11 ms | 111 ms | 72 ms |
| `dataReferencia` variável (CT-76), p95 FLUXO / SUST | 46 / 87 ms | 109 / 102 ms | 61 / 98 ms |
| A1 isolada, 16 ids fria / quente p95 | 29 / 34 ms | 70 / 94 ms | 585 / 191 ms (máx. 1506 ms numa amostra) |
| A1 no navegador, p95 geral | 44 ms | 52 ms | 48 ms |
| Resumo (12 GETs), p95 | 18 ms (n incompleto) | 68 ms | 132 ms |
| Sustentação, p95 | sem amostra | 46 ms | 48 ms |
| Semanal / Diária / Tático / Estratégico, p95 | 60 / 7 / 51 / 25 ms | 67 / 6 / 57 / 26 ms | 40 / 7 / 44 / 14 ms |

Leitura:
- **A1 (bloqueante, p95 < 300 ms) das duas tendências e de todas as rotas de painel do Operacional: atendida** em todas as execuções válidas, inclusive com `dataReferencia` fora do cache (a Sustentação reindexa o Acelerato: 87 a 111 ms, contra 77,6 ms do dublê). O pré-cálculo no worker (R2 do plano) **não é necessário** para A1.
- **A2 (alerta, p95 < 50 ms com cache quente)**: 11 a 20 ms com a máquina calma; 72 a 111 ms sob carga 5 a 7. Alerta, não bloqueia. Repetir com a máquina ociosa antes de qualquer decisão.
- O teste `perf-api` **reprova** nas duas execuções válidas (2 e 3): `/` (Visão geral, a primeira rota) com p95 de 626 e 741 ms, e na execução 3 também "A1 isolada fria" (585 ms). Em todos os casos a causa é a primeira consulta depois de subir a API, que carrega a base de cada fonte (100 a 460 ms por fonte, qualquer métrica; 2ª e 3ª chamadas em 1 a 8 ms): SNO-005, pré-existente e não específico da demanda. Com n = 10 por rota o p95 é a própria amostra fria.
- Fora do plano e para o risco R2: a primeira chamada da tendência da Sustentação, quando é a primeira da API, leva 167 ms (carga 4,6), acima do alerta e abaixo do A1.

## Vermelho antes do verde e mutação
| Teste novo | Comando e falha observada |
|---|---|
| CT-50 (`erro:o3` não afirma "sem histórico") | `git checkout 06fab0c^ -- web/src/features/operacional/resumo/TendenciaFluxo.tsx`, build de produção e o teste: falha (`tendencia-fluxo-p85-erro` não encontrado). Restaurado |
| A6 (perfil `versao: 2` nunca sobrescrito) | `git checkout 92b93ef^ -- web/src/features/preferencias/fonte.ts`: falha, o valor guardado virou `{"versao":1,"paineis":{"sustentacao":{"ocultar":["s5"]}}...}`. Restaurado |
| CT-53 (`S3.janela` obrigatória) | mutante `.optional()` em `resultadoS3.janela`: `AssertionError: expected true to be false`. Restaurado |
| CT-17 (3 hashes `compl-sust-*`) | mutante M4: `RedirecionaSustentacao.tsx` sem `HASH_RENOMEADO`: 3 testes falham |
| CT-18 (redirecionador não repassa `next`) | mutante M5: `INTACTOS` com `'next'`: 2 testes falham |

Amostragem por mutação dos 3 E2E adaptados (mutante aplicado, build, `vite preview` próprio, só o teste alvo; arquivo sempre restaurado com `git checkout`):
| E2E adaptado | Mutante | Resultado |
|---|---|---|
| `shell` NAV-01/02 (6 destinos, sem Sustentação) | `rotas.ts` com o item `/sustentacao` de volta no menu | **morreu** (1 falha) |
| `b12-fluxo` B3-002 (o hash decide a visão) | `visao.ts` sem o hash em `resolverVisao` | **morreu** (1 falha) |
| `responsivo` RESP-01 (sem rolagem horizontal) | `recorte-sustentacao` com `min-w-[700px] whitespace-nowrap` | **sobreviveu** na primeira rodada: o teste media a página logo depois do h1, antes de a visão Sustentação (lazy) montar. Correção do teste (espera `recorte-sustentacao` e o fim do `aria-busy`); no reteste **morreu** (8 falhas) |

Nota de método: a primeira rodada de M2 e M3 usou um `vite preview` que sobrou da rodada de M1 (o processo filho não morreu com o subshell e segurou a porta 4173 e o `flock`). Os resultados de M2 e M3 foram descartados e repetidos com o servidor encerrado por grupo de processos; os que valem são os da tabela. Os previews sobrados foram encerrados à mão.

Os 43 testes do spec do QA são de característica sobre comportamento já implementado (CT-03, 10, 23 nos casos antigo e corrompido, 25, 29, 31, 32, 36, 51, 63 a 65): o primeiro run deles foi verde e não há vermelho comprovado nesses; por isso as duas amostras acima (CT-17, CT-18) e a asserção de cada fronteira (versão futura, valor corrompido, hash por hash, abuso por abuso). A mutação do `PAINEIS.operacional.params` sugerida no CT-08 **não foi feita**; a obrigação está coberta por `duas-fontes.test.tsx` e `IF-D1`/`IF-D2` (adaptados).

## Ambiguidades A1 a A10 do plano
Respondidas pelo adendo e testadas assim: A1 (O17 só na Sustentação), A2 (quatro visões), A3 (12 semanas escritas), A4 (dois níveis pré-selecionados; o título do teste dos autores continua dizendo "cartões", só o nome), A5 (último dia entra), A6 (perfil corrompido ou futuro nunca sobrescrito; passou), A7 (cada seta é `push`; sem evidência de poluir o Voltar), A8 (hash desconhecido com `cadencia` inválida abre o Resumo, com aviso e hash preservado), A9 (empate determinístico), A10 (contagens publicadas sempre). A9 e A6 seguem "a confirmar" pelo usuário; passam como o UX propôs.

## Riscos e observações
1. Os 124 E2E defasados passaram despercebidos até aqui. Sugestão ao tech-lead: o gate do autor inclui o E2E dos arquivos tocados (melhoria de fábrica, `contribuir-com-o-forge`).
2. Janelas diferentes no alerta da Sustentação (Resumo 12 semanas, detalhe 6 meses): U1 = (a), com janela escrita e nota na tela. Pode virar bug de percepção; o par de telas é `/operacional` e `/operacional?cadencia=sustentacao`.
3. O `OperacionalPage` com 57 KB e `VisaoSustentacao` com 33 KB raw: bundle inicial em 190,66 KB de 200 KB (folga de 4,7%).
4. IF-A (Semanal e Tático) fica a poucos segundos do teto de 30 s; instável sob carga, não é defeito desta entrega.
5. `test:pg`: 7 testes de `pesquisa.pg.test.ts` falham no Postgres local por permissão de banco. Precisa ser corrigido no ambiente (papel `dspd_pesquisa`), e é anterior a esta demanda.
6. Alterações de teste do QA estão no commit `80d2fbf` (E2E, tests-api, perf-api, fixture) e `18d8327` (contrato do S3). Evidências em `docs/qa/evidencias/` regravadas pela suíte foram revertidas (não fazem parte desta entrega).
