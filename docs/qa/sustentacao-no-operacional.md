---
tipo: qa
contrato: 1
pedido: sustentacao-no-operacional
branch: feature/sustentacao-no-operacional
commit: d76947b
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-15
---

# QA: Sustentação dentro do Operacional (K-072 e K-073)

Links: plano `docs/qa/sustentacao-no-operacional-plano.md` (77 casos, CT-01 a CT-77), especificação `docs/ux/sustentacao-no-operacional/especificacao.md` (CA-1 a CA-31) e adendo `05-adendo-review.md` (A1 a A10; U1 = a), plano técnico `docs/architecture/plano-sustentacao-no-operacional.md`, contrato `docs/api/metricas.md`, review `docs/reviews/sustentacao-no-operacional.md` (aprovado na volta 7, d76947b), bugs `docs/qa/bugs/SNO-001` a `SNO-005`.

## Veredito
**Aprovado**, sobre o HEAD **d76947b**. Nenhum bug aberto (0 críticos, 0 altos, 0 médios, 0 baixos). O usuário decidiu corrigir SNO-001 e SNO-005, em vez de aceitá-los; os dois foram corrigidos e verificados neste parecer e estão **fechados**, e por isso o `aceite_usuario` saiu do frontmatter. Zero violações de acessibilidade sérias ou críticas em todas as telas e variantes testadas. O E2E completo passou inteiro (677 de 677), o `perf-api` completo contra o Postgres com 24 meses passou (23 de 23), o `test:pg` passou (83 de 83) e o Lighthouse do Resumo ficou limpo (CLS 0,004).

O código de produção testado é o de d76947b; os commits desde o parecer anterior (5adf980) são: merge da develop (54c4ebf), 26ad55b (SNO-001), 0d185d6 (CT-03), 59dedb5 (SNO-005), 19c5cf9 (V6-1 a V6-3), fea4a27 (V6-4) e f8b09f1 e d76947b (só documentação). O `pnpm run pronto` desta volta é o do review (f8b09f1, EXIT=0); d76947b só acrescenta documentação.

Situação dos bugs:
| Bug | Sev. | Situação |
|---|---|---|
| SNO-001 | média | **fechado** (26ad55b): cabeçalho a 375 px com fonte a 200% sem rolagem horizontal; vermelho 4 de 4, verde 4 de 4 |
| SNO-002 | baixa | fechado (8423b19) |
| SNO-003 | alta (processo) | fechado: E2E adaptados corrigidos |
| SNO-004 | média | fechado: CLS do Resumo 0,125 para 0,004 |
| SNO-005 | baixa | **fechado** (59dedb5, 19c5cf9): A1 a frio 15 ms (antes 626 a 741 ms); a API sobe com o banco parado |

## Ambiente
WSL2 com 8 GB, Chromium headless do Playwright (bibliotecas de sistema via `~/.local/chromium-libs`, `eval "$(bash e2e/scripts/setup-chromium-local.sh)"`), `flock /tmp/metricas-pesado.lock` + `nice -n 19`, uma execução pesada por vez, Postgres do Compose. Máquina compartilhada com outros agentes: a fila do `flock` foi o maior custo de tempo.

## Critério → teste → resultado
`dev` = `e2e/tests/sustentacao-no-operacional.spec.ts` (dos autores, um teste por CA); `qa` = `e2e/tests/sustentacao-no-operacional-qa.spec.ts` (do QA). Resultado em d76947b: **todos os testes dos dois arquivos passaram** dentro do E2E completo (677 de 677).

| Critério | Teste (caso) | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-1 menu sem Sustentação | dev CA-1 (CT-01); `shell` NAV-01/02 adaptado | 1280 e 375 px (gaveta); 6 destinos exatos | passou |
| CA-2 seletor Visão, histórico | dev CA-2 (CT-02) | Resumo marcado sem parâmetro; Voltar volta ao Resumo | passou |
| CA-2 teclado | qa CT-03 | Tab até o grupo, 3 setas à direita, 1 à esquerda, volta ao Resumo, foco no rádio; cada seta é `push` (A7); setas em sequência sem corrida de foco | passou (5 de 5 com `--repeat-each=5`, depois do 0d185d6 e do fea4a27) |
| CA-3 uma fonte por visão | dev CA-3 (CT-04) | só O17 como O* na Sustentação; nenhum S*, EI-SUST, PV1 no fluxo (inclui complementares abertas) | passou |
| CA-4 selo de fonte | dev CA-4 (CT-05) | mínimo de 3 cartões por visão (guarda contra suíte vazia) | passou |
| CA-5 filtros por visão | dev CA-5 (CT-06); qa CT-10 | legenda por fonte; `sust_prioridade=P9` ignorada com aviso que cita a Sustentação | passou |
| CA-6 filtros guardados | dev CA-6 (CT-07, CT-08, CT-09); `intensivo-filtros` IF-D1 | `prioridade` sem prefixo cai em silêncio; filtros do fluxo ficam guardados na URL da Sustentação | passou |
| CA-7 rodapé do cartão | dev CA-7 (CT-11) | S* nunca cita Tipo ou Sistema; O* nunca cita Prioridade | passou |
| CA-8 Pede atenção por fonte | dev CA-8 (CT-12); `atencao.test.ts` | título e janela escritos; links só à visão dona | passou |
| CA-9 sem "Também nesta aba" | dev CA-9 (CT-13) | as 4 visões | passou |
| CA-10 índice e ocultas | dev CA-10 (CT-14) | ocultar S3 e S4 retira "Volume e resolução"; 375 px | passou |
| CA-11 redirecionador | dev CA-11 (CT-15, CT-16); qa CT-17 (3 hashes), CT-18 (8 abusos) | sem laço no Voltar; `next=//evil.com`, CRLF, `//` e `\` no hash, `cadencia` como URL, `javascript:`, `sust_*` forjado: sempre `/operacional`, mesma origem, zero requisição externa e zero diálogo | passou |
| CA-12 hash decide a visão | dev CA-12 (CT-19); qa `#S2` | hash em maiúsculas; unicidade dos hashes (`visao.test.ts`) | passou |
| CA-13 `/espera-invisivel#ei-sust` | dev CA-13 (CT-21); `espera-invisivel` adaptado | um salto, só filtros `sust_`; `#ei-fl1` vai à Semanal | passou |
| CA-14 preferências | dev CA-14 (CT-22); qa CT-23 | perfil antigo lido; gravado em `paineis.sustentacao.ocultar`, outros painéis intactos; corrompido: padrões, sem sobrescrever; `versao: 2`: padrões e **nunca sobrescrito** (A6) | passou |
| CA-15 exportação | dev CA-15 (CT-24); qa CT-25 (PDF aberto com pdfjs) | Sustentação: só Acelerato, sem e-mail nem pessoa; Semanal: só BusinessMap; Resumo: duas fontes em seções separadas | passou |
| CA-16 Visão geral | dev CA-16 (CT-26); `b3-sust-ei-vg` VG-02/06 adaptados | nenhum link vai ao Resumo; 7 reuniões | passou |
| CA-17 catálogo | dev CA-17 (CT-27) | S1 a S12, O17, EI-SUST, PV1 com painel "Operacional · Sustentação" | passou |
| CA-18 leia junto O15 para O17 | dev CA-18 (CT-28); `SIS-CONS-02` adaptado | troca a visão, abre Mais métricas, foca o cartão; nenhum número cruza | passou |
| CA-19 acessibilidade | dev CA-19 (CT-29, CT-30); qa CT-29, CT-31 | axe WCAG 2.2 AA nas 4 visões a 375 e 1280 px (e 320 px nas varreduras `responsivo` e `intensivo-sistemico`), com Mais métricas aberto e cartões ocultos; anúncio `aria-live` e título por visão; foco por hash não encoberto (2.4.11); troca por link sem hash leva o foco ao h1 (D-03); `prefers-reduced-motion` | passou (0 violações sérias ou críticas) |
| CA-20 layout 375 e 1280 | dev CA-20 (CT-32); qa CT-32 (zoom); `cabecalho-fonte-200` (SNO-001) | sem rolagem horizontal nas 4 visões a 1280, 640, 375 e 320 px (400%); a página inteira com fonte a 200% a 375 px em 4 rotas; seletor em até 2 linhas, alvos de 44 px | passou |
| CA-21 chunk e orçamento | dev CA-21 (CT-33); `perf:tudo` (CT-34) | Diária e Semanal não baixam `VisaoSustentacao-*.js`; inicial 191,10 KB gzip < 200 KB (`pronto` do review) | passou |
| CA-22 sem coleta do Acelerato | dev CA-22 (CT-35) | `SemDadosDaFonte` só na Sustentação; fluxo funciona | passou |
| CA-23 Resumo padrão | dev CA-23 (CT-37) | `cadencia=resumo` normalizado; `RESUMO` e `xyz` caem no Resumo com aviso, sem entrada no histórico (qa CT-10) | passou |
| CA-24 compatibilidade | dev CA-24 (CT-38); varredura por grep | nenhum link interno cai no Resumo | passou |
| CA-25 fontes separadas | dev CA-25 (CT-39); qa CT-65 | O17 fora do Resumo; sem "total geral"; blocos empilhados | passou |
| CA-26 números-chave | dev CA-26 (CT-40, CT-41, CT-42); `modelo.test.ts` | 7 números com base, unidade e link; n = 19 sem valor e n = 20 publica; empate determinístico (A9) | passou |
| CA-27 tendência | dev CA-27 (CT-43, CT-44, CT-45); `tests-api` | mês com n = 14 vazado e sem linha ligando vizinhos; volume do mês = S3 do mês (6 de 6 meses, API real) | passou |
| CA-28 alertas por fonte | dev CA-28 (CT-46) | título e janela por fonte, nota "Mesmo alerta, janelas diferentes" (U1 = a) | passou |
| CA-29 Resumo sem filtros | dev CA-29 (CT-47) | O3 oculto: marcador e série P85 some; nenhuma chave nova no `localStorage` | passou |
| CA-30 exportar no Resumo | dev CA-30 (CT-48); qa CT-25 | dois níveis pré-selecionados | passou |
| CA-31 estados por bloco | dev CA-31 (CT-49); qa CT-50, CT-51, CT-36 | `erro:o3` não diz "sem histórico", mostra erro próprio com "Tentar de novo"; `erro:s2` isola o cartão; gráficos `role="img"` com `aria-label` | passou |

## Cenários (77 casos)
| Casos | Obrigação | Resultado |
|---|---|---|
| CT-01 a CT-51 | CA-1 a CA-31 (tabela acima) | **passaram** (unidade e integração no `pronto`; E2E nos dois spec e nos 12 adaptados) |
| CT-52, CT-53 | 53 `MetricaId`; `S3.janela` obrigatória | passaram (`contratos`, `varredura`, `server/tests/metricas`); teste `s3-janela.test.ts`, mutante `.optional()` morre |
| CT-54 a CT-57 | tendência = métrica de origem; fronteiras 19/20; fontes separadas; `S3.janela` | passaram (`tendencia.test.ts`, `regras.property.test.ts`; `tests-api/tendencias.spec.ts` com a API real) |
| CT-58 | API: 200, 304, 400 | passaram em unidade e na API real |
| CT-59 | sem pessoa; GRANT por coluna | corpo das duas tendências sem pessoa, título, e-mail; **`test:pg` 83 de 83 em d76947b** (as 7 falhas de ambiente de `pesquisa.pg.test.ts` do parecer anterior sumiram com a correção da develop, #83), inclusive o aquecimento lendo com o papel `dspd_api` (K-085) |
| CT-60, CT-61 | contrato e documentação; `mes` AAAA-MM | `docs:check` ok (424 páginas, 53 métricas); `2026-13` recusado |
| CT-62 | front lê as tendências por HTTP | passou (`HttpFonteMetricas.test.ts`; `tendencias.spec.ts`) |
| CT-63 a CT-65 | sem avaliação individual; sem comparação entre times; BM e Acelerato não se misturam | passaram (varredura do DOM das 4 visões e do PDF; sem ranking, "melhor/pior equipe", "total geral") |
| CT-66, CT-67 | story só; mínimo de 20; janela de 12 semanas | passaram (`modelo.test.ts`, `regras.property.test.ts`, 19/20 no E2E) |
| CT-68 | cálculo só na biblioteca | sem achado (único `Math.round(ultimo) - Math.round(antes)` em `fraseDaSerie`, delta de valores já publicados) |
| CT-69, CT-70 | critério marcado; histórico e só GET | passaram |
| CT-71 a CT-72 | métricas proibidas; credenciais e só GET no Acelerato | passaram (DOM sem produtividade individual, velocidade em pontos, horas apontadas; diff sem credencial nem POST novo) |
| CT-73, CT-74 | A1 fria e A2 quente das tendências, Postgres real | `perf-api` em d76947b: TENDENCIA_FLUXO fria 10 ms, quente p95 36 ms; TENDENCIA_SUST fria 10 ms, quente p95 15 ms (A1 < 300 ms e A2 < 50 ms atendidos) |
| CT-75 | A1 do navegador no Resumo | passou (ordem: tendências depois dos números) |
| CT-76 | `dataReferencia` fora do cache | p95 18 ms (fluxo) e 105 ms (sustentação), A1 atendido |
| CT-77 | primeira consulta depois de subir a API | **passou**: A1 fria 15 ms (SNO-005 fechado) |

## Execução (resultado real por suíte, d76947b)
| Suíte | Resultado |
|---|---|
| `pnpm run pronto` (review, f8b09f1; d76947b só adiciona documentação) | **EXIT=0**: lint, `format:check`, tsc, cobertura 100%, web 1.041 testes, server 496 passaram e 83 pulados (`.pg`), contratos 47, metricas 653, mock 161, `docs:check` ok; bundle F6 191,10 KB < 200 KB |
| E2E `chromium` + `chromium-semente-alt`, 2 workers | **677 passaram, 0 falharam, 0 pulados** (25,3 min). Inclui `cabecalho-fonte-200` (4), RESP-01 e M6 a 320 px, CA-19 e CA-20 a 375 e 1280 px, CT-32 a 320 px |
| CT-03 isolado, `--repeat-each=5` | **5 de 5 passaram** (a primeira tentativa falhou por ambiente, `exitCode=127`: o `eval` do `setup-chromium-local.sh` foi feito num subshell e o `LD_LIBRARY_PATH` não chegou ao Playwright; repetido com o ambiente certo) |
| D-03 (troca por link vai ao h1) | `visoes.test.tsx`: **19 de 19 passaram**, inclusive o caso do V6-4 (A, B, A no mesmo quadro) e o D-03 sem h1 no documento |
| `perf-api` completo (Postgres, 24 meses, `PERF_REPETICOES_A1=10`) | **23 de 23 passaram** (2,8 min) |
| `test:pg` | **15 arquivos, 83 testes, todos passaram** (EXIT=0) |
| Lighthouse do Resumo (`/`, 3 execuções) | sem aviso de asserção (EXIT=0); desempenho 0,98, acessibilidade 1,0, **CLS 0,004**, LCP 0,69 a 0,75 s |
| Subida com o banco parado | passou (ver "Aquecimento da API") |

## Aquecimento da API (SNO-005, V6-1 a V6-3)
Ambiente: Postgres do Compose, seed do mock com 24 meses (`MOCK_MESES_HISTORICO=24`), API em `:3100` atrás do `vite preview` (harness `servidor-api-mock.ts`, copiado numa variante descartável com log em `info` para ler o tempo de subida; removida antes do commit).
| Medida | Resultado |
|---|---|
| Tempo de subida (`listen` com aquecimento) | **1.120 ms** e 1.161 ms em duas subidas; log "aquecimento concluído": `metricas: 52`, `falhas: []`, `ms: 1111` e 1123 |
| A1 a frio, rota `/` (n = 10) | p95 **15 ms** (antes: 626 a 741 ms) |
| A1 isolada a frio (16 ids) | p95 **15 ms** (máx. 15 ms); quente p95 14 ms (máx. 36 ms). Antes: 585 ms a frio |
| A1 no navegador, geral (n = 460) | p95 20 ms; Resumo 12 GETs; Sustentação p95 32 ms; Semanal 16; Tático 16; Estratégico 32; Diária 5 |
| RSS | o RSS do processo do teste (443 a 449 MB no pico) inclui a geração e a semeadura do mock, então não é o da API. **Custo do aquecimento: +56 MB** (312 para 368 MB com `--expose-gc`; heap 41 para 83 MB). RSS da API isolada: medir na homolog (`mem_limit` de 384 MB) |
| Banco parado, conexão recusada (porta sem Postgres) | a API aceita conexões em **780 ms**, registra "aquecimento falhou; a primeira consulta carrega a base"; `/health` 503 |
| Banco parado, host que não responde (pacotes descartados) | a porta aceita conexões em **6,1 s** (cerca de 1 s de partida mais o prazo de 5 s); registra "aquecimento não terminou no prazo; a API sobe e ele continua em segundo plano" e depois "aquecimento falhou"; sem `FST_ERR_HOOK_TIMEOUT` (o V6-1 reprovava a API aqui) |

Observação de método: no teste do host mudo, o primeiro sonda usou `/health`, que também espera o banco e estourou o `curl -m 1`; o log mostra o `listen` aos 5 s e as requisições entrando. A medição certa foi feita com sonda TCP (6,1 s).

## Vermelho antes do verde e mutação
| Teste novo | Comando e falha observada |
|---|---|
| `cabecalho-fonte-200.spec.ts` (SNO-001) | `git checkout 26ad55b^ -- <os 9 arquivos de web/src do commit>`, build de produção e `playwright test tests/cabecalho-fonte-200.spec.ts --project=chromium`: **4 de 4 falharam** (`scrollWidth` 640 contra 375). Restaurado com `git checkout HEAD --` e árvore limpa; no HEAD, 4 de 4 passam |
| SNO-005, desempenho | no código anterior o `perf-api` reprovava (`/` com p95 de 626 a 741 ms nas três execuções do parecer anterior); no HEAD, p95 15 ms |
| V6-1 (prazo de 5 s do aquecimento), CT-03, V6-4 | provados pelo review (volta 7): o teste do banco lento reprova o código sem prazo. Não refeito pelo QA; no QA, a mesma obrigação foi exercida pela subida real com host mudo (6,1 s com aviso) |
| CT-50, A6, CT-53, CT-17, CT-18 | do parecer anterior (mutantes mortos): `TendenciaFluxo.tsx` sem a correção falha; `fonte.ts` sem a correção falha; `.optional()` em `S3.janela` morre; `HASH_RENOMEADO` removido: 3 falhas; `next` repassado: 2 falhas |
| E2E adaptados (`shell` NAV-01/02, `b12-fluxo` B3-002, `responsivo` RESP-01) | os três mutantes morrem (o de RESP-01 depois de o teste passar a esperar a visão lazy montar) |

Os 43 testes do spec do QA são de característica sobre comportamento já implementado; por isso as amostras por mutação acima e a asserção de cada fronteira. A mutação de `PAINEIS.operacional.params` sugerida no CT-08 não foi feita; a obrigação está coberta por `duas-fontes.test.tsx` e `IF-D1`/`IF-D2`.

## Ambiguidades A1 a A10 do plano
Respondidas pelo adendo e testadas assim: A1 (O17 só na Sustentação), A2 (quatro visões), A3 (12 semanas escritas), A4 (dois níveis pré-selecionados), A5 (último dia entra), A6 (perfil corrompido ou futuro nunca sobrescrito), A7 (cada seta é `push`), A8 (hash desconhecido com `cadencia` inválida abre o Resumo, com aviso e hash preservado), A9 (empate determinístico), A10 (contagens publicadas sempre). A9 e A6 seguem "a confirmar" pelo usuário; passam como o UX propôs.

## Riscos e observações
1. **Recarga depois de uma coleta (V6-5):** a primeira consulta depois da troca da marca d'água (relida a cada 60 s) ainda paga a carga da base (160 a 560 ms medidos antes, acima do A1). Não bloqueia (uma vez por coleta e por fonte); falta o cartão no quadro, com o `perf-api` depois de uma coleta como critério de entrada. O QA não mediu isso nesta volta.
2. **RSS da API real:** o aquecimento custa cerca de 56 MB; o número total contra o `mem_limit` de 384 MB da homolog só se confirma lá.
3. Janelas diferentes no alerta da Sustentação (Resumo 12 semanas, detalhe 6 meses): U1 = (a), com janela escrita e nota na tela; pode virar bug de percepção.
4. `OperacionalPage` e `VisaoSustentacao` são grandes; o bundle inicial está em 191,10 KB de 200 KB (folga de 4,4%).
5. IF-A (Semanal e Tático) fica a poucos segundos do teto de 30 s e já falhou sob carga em rodada anterior; nesta rodada passou. Instabilidade registrada em `docs/qa/bugs-intensivos.md`, não é defeito desta entrega.
6. O E2E completo regrava evidências em `docs/qa/evidencias/` (imagens, PDF e JSON). As alterações foram revertidas com `git checkout -- docs/qa/evidencias`; não fazem parte do commit.
7. Melhoria de fábrica: o `pronto` não roda E2E, Lighthouse nem `perf-api`; os 124 E2E defasados (SNO-003) só apareceram no QA. Sugerido ao tech-lead via `contribuir-com-o-forge`.
8. Pedido ao Jarvis: o `eval "$(bash e2e/scripts/setup-chromium-local.sh)"` perde efeito se for colocado num pipe (`| tail`); a falha aparece só como `exitCode=127` do navegador.
