# QA intensivo de filtros - versão da `main`

Pedido do usuário: testes intensivos de FILTROS na versão que está na `main`.
Links: spec de UX `docs/ux/dashboard-metricas/especificacao.md` (seções 2.1 a 2.6, 4.0.2), contrato `packages/contratos/src/filtros.ts` e `APLICABILIDADE_FLUXO` (`packages/contratos/src/metricas.ts`), código de filtros `web/src/features/filtros/`, regras `packages/metricas/src/core/regras.ts`, CLAUDE.md (regras invioláveis).

## Ambiente
- Commit: `main` @ 0af552a (worktree `test/qa-intensivo-main`).
- Interface: `vite build` padrão (mock, latência simulada de 150 a 400 ms por métrica, igual ao E2E oficial) servido por `vite preview` numa porta própria (4183), Chromium 1248 do Playwright, 3 workers, fuso America/Sao_Paulo, pt-BR.
- Biblioteca: Vitest + fast-check (semente fixa 20261013, 25 execuções por propriedade), duas bases: a do app (escala padrão) e uma base pequena (escala 0,1, corte em 15/05/2026) para exercitar o regime de amostra menor que 20.
- Data: 13/10/2026.

## Dados de teste
Mock com semente padrão (6 equipes de fluxo, 8 sistemas, 6 tipos; 3 equipes SSSC, P1 a P5; dados até 09/10/2026). Preferências e tema via `localStorage` no próprio teste; cada teste abre a sua página (sem dependência de ordem). Nenhum dado real.

## Escopo
Coberto: os filtros equipe, tipo, sistema, prioridade, período (padrões e personalizado) e cadência, nos painéis Operacional (diário e semanal), Tático, Estratégico, Espera invisível e Sustentação; parâmetros de filtro em Visão geral, `/metricas` e `/dados` (que não têm filtros); sincronização filtros e URL (ida e volta, Voltar/Avançar, recarga, outra aba, link copiado); memória de sessão entre painéis; invariantes das métricas sob filtros.
Fora: Firefox e WebKit (só Chromium local); exportação com filtros (coberta em `exportar.spec.ts`); dados reais (só mock); a "data de referência" não é parâmetro de URL na `main` (vem da fonte e aparece como "Dados até"): foi coberta pelos limites do período personalizado (B13, B14, B48).

## Arquivos
| Arquivo | Conteúdo |
|---|---|
| `e2e/tests/intensivo-filtros.spec.ts` | IF-00, combinatória pairwise (IF-C), ida e volta pela interface (IF-U), "Não afetado por" (IF-A), domínios (IF-D), interação (IF-I) |
| `e2e/tests/intensivo-filtros-bordas.spec.ts` | Casos de borda de URL (IF-B01 a IF-B49) |
| `packages/metricas/src/filtros.intensivo.test.ts` | Propriedades INV-F1 a INV-F7 (biblioteca + mock) |

Para rodar fora da suíte oficial (porta própria, sem tocar no preview do usuário): `vite build --outDir <tmp>`, `vite preview --outDir <tmp> --port 4183` e um `playwright.config.ts` com `baseURL` na 4183 e `testMatch: /intensivo-filtros.*\.spec\.ts/`. Na suíte oficial (`pnpm run e2e`) os dois arquivos também rodam, no projeto `chromium`.

## Cenários

### Combinatória (IF-C): pairwise determinística
Gerador guloso que cobre todos os pares de valores entre dimensões (sem aleatoriedade em tempo de execução). Dimensões: equipe (Todas, 1, 2, 3 equipes), tipo (Todos, 1, 3), sistema (Todos, 1, 2), período (padrão, 4s, 6m, 12m, personalizado); Estratégico: sistema (4 níveis) x período (12m, 6m); Sustentação: equipe SSSC (3) x prioridade (4) x período (5).
Em cada combinação: carrega sem erro de painel nem de console; nenhum cartão em `erro`; os mesmos cartões da linha de base sem filtro (filtro não some cartão); a URL fica exatamente como pedida; rótulo de cada botão espelha a seleção ("Todas", nome, "n selecionadas"); um chip por valor e "Limpar filtros" só fora do padrão; **base de cada cartão menor ou igual à base sem filtro** (mesmo período e cadência); nenhum texto de pessoa (Pessoa NN, responsável, e-mail, "ranking" não negado); recarregar reproduz o mesmo retrato (botões, chips, estado e base de cada cartão).

| Painel | Combinações | Aprovadas | Reprovadas |
|---|---|---|---|
| Operacional diário | 20 | 20 | 0 |
| Operacional semanal | 21 | 21 | 0 |
| Tático | 20 | 20 | 0 |
| Estratégico | 8 | 8 | 0 |
| Espera invisível | 20 | 20 | 0 |
| Sustentação | 20 | 20 | 0 |
| **Total** | **109** | **109** | **0** |

Visão geral, `/metricas` e `/dados` não têm filtros: IF-D5 abre as três com parâmetros de filtro (válidos e inválidos, `fonte=zz`) e confirma carga sem erro, sem "Página não encontrada" e sem dado individual.

### Ida e volta pela interface (IF-U), por painel
Monta 3 ou 4 mudanças pela interface (Operacional semanal, Tático, Estratégico, Sustentação, Espera invisível), esperando o painel entre elas; cada mudança é uma entrada de histórico; Voltar percorre os estados na ordem inversa e Avançar refaz, com retrato idêntico; a URL final aberta num contexto novo (sem memória de sessão) reproduz o mesmo retrato. **5 de 5 aprovados.**

### Invariantes por métrica (biblioteca + mock, fast-check)
| ID | Propriedade | Base do app | Base pequena |
|---|---|---|---|
| INV-F1 | Recorte mais estreito nunca tem base maior; filtrado nunca passa do total sem filtro (fluxo, 35 métricas) | ok | ok |
| INV-F1 | Idem, sustentação (14 métricas) | ok | ok |
| INV-F2 | Filtro que não se aplica (tabela 2.2 / `APLICABILIDADE_FLUXO`) é ignorado | **falha: O6 (tipo), EI_FL3 (equipe)** | **falha: idem** |
| INV-F3 | Prioridade não altera nenhuma métrica de fluxo; tipo/sistema não alteram nenhuma de sustentação | ok | ok |
| INV-F4 | Nenhum percentil (p50/p85/p95) com n menor que 20 nem com status insuficiente, em nenhuma combinação (inclui Visão geral e PV1) | ok | ok |
| INV-F5 | Nenhum dado individual (chaves de pessoa, `responsaveis`, `usuario`, "Pessoa NN") em nenhum resultado | ok | ok |
| INV-F6 | Ordem dos valores selecionados não altera o resultado | ok | ok |
| INV-F7 | Consolidado de duas equipes fica entre o maior e a soma das bases individuais | ok | ok |

Execução: 14 testes, 12 aprovados, 2 reprovados (INV-F2 nas duas bases), 38 s. Na tela, IF-A confere a mesma regra: todo cartão com "Não afetado por: X" precisa ter a mesma base com e sem X; IF-D1/IF-D2 confirmam que filtros do outro domínio na URL são removidos e não mudam nenhum cartão; IF-D3 que a equipe de um domínio não vaza para o outro; IF-D4 que equipe e tipo guardados aparecem no Estratégico como "não se aplicam" e voltam no Tático; IF-I12 que combinações sem dados (equipe sem o sistema dela, P1 de uma equipe em 4 semanas) mostram vazio/insuficiente, nunca erro, e nenhum P50/P85/P95 em cartão insuficiente.

### Interação (IF-I)
| ID | Cenário | Resultado |
|---|---|---|
| IF-I01 | Marcar todas uma a uma (equipe, tipo, sistema, equipe SSSC, prioridade), desmarcar, "Limpar" do popover | **falha** na Sustentação (IF-002 = IS-003), 4 de 5 repetições |
| IF-I02 | "Limpar filtros" zera tudo, preserva cadência e aba local; Voltar desfaz | ok |
| IF-I03 | Cliques rápidos no mesmo popover (FIL-04), 5 rodadas de 2 a 5 equipes | ok (5 de 5 repetições) |
| IF-I04 | 3 cliques no mesmo tick (dispatch síncrono) | ok |
| IF-I05 | CPU 6x: marcar equipe e trocar cadência | **falha** (IF-001), 5 de 5: sobra só `cadencia=semanal` |
| IF-I06 | CPU 6x: remover dois chips em sequência | **falha** (IF-001), 5 de 5 na repetição; o primeiro chip removido volta |
| IF-I07 | Folha 375 px, equipe e tipo no mesmo tick | **falha** (IF-001), 5 de 5 |
| IF-I08 | Teclado: Tab, Espaço abre e marca, Esc devolve o foco, Enter em "Limpar filtros", setas no período | ok |
| IF-I09 | 375 e 1280, claro e escuro, filtros aplicados: axe sem violação séria/crítica, sem rolagem horizontal; folha = uma entrada de histórico | 1280 claro/escuro ok; 375 **falha** (IF-001: dos 3 filtros da folha sobra 1); intermitente entre claro e escuro |
| IF-I10 | Preferências ocultando O9, O10 e S1 combinadas com filtros; ocultar O4 com filtro ativo | ocultação ok; **falha** ao montar os filtros (IF-001) |
| IF-I11 | "Copiar link" com filtros e `?mock=`: o link não leva `mock` e abre o mesmo estado | **falha** ao montar os filtros (IF-001); a parte do link não chega a ser verificada |
| IF-I12 | Combinações sem dados | ok |
| IF-I13 | Dois filtros diferentes em sequência na barra (Operacional semanal, Tático, Sustentação) | **falha** (IF-001), 4 de 5 repetições |

### Casos de borda (IF-B)
Aprovados (34): valores inexistentes (ignora só o inválido e avisa), equipe de um domínio no outro, período inexistente e em maiúsculas, personalizado menor que 7 dias / com data futura / um dia depois da data dos dados / antes do início da base (todos com aviso), personalizado exatamente até a data dos dados (válido), Estratégico com 4 semanas / personalizado / equipe e tipo (removidos em silêncio, sem aviso), maiúsculas e espaços (lidos corretamente), valor repetido, vírgulas vazias, codificação malformada no valor e na chave, injeção de marcação (texto escapado, nenhum `alert`), valor de 4.000 caracteres, hash preservado, cadência inválida com filtro válido, correção da URL sem entrada de histórico, "Entendi" e recarga, `?mock=vazio` e `?mock=erro:o2` com filtros, período personalizado pela interface (5 mensagens de validação da spec), rota inexistente com filtros.
Reprovados (11): B09, B10, B16, B17 (IF-005: personalizado inválido sem aviso); B21, B22, B42, B43, B44, B45, B46 (IF-006: URL não canônica).

## Resultado da execução (13/10/2026)
| Suíte | Testes | Aprovados | Reprovados |
|---|---|---|---|
| E2E `intensivo-filtros*.spec.ts` (execução completa única + reexecução do IF-A, ver nota) | 186 | 165 | 21 |
| Propriedades `filtros.intensivo.test.ts` | 14 | 12 | 2 |

Nota: na execução completa o IF-A não abria a seção "Mais métricas" (defeito do teste, corrigido); reexecutado o IF-A (5 testes), o Operacional semanal passou a reprovar pelo O6 ("Base: 116 itens concluídos" com `tipo` x "198" sem) e o Tático verificou também T6 e T8 sem divergência. Os números acima já consolidam essa reexecução (166 + 3 - 4 aprovados).

Repetição dos testes de corrida (`--repeat-each 5`): IF-I03 5/5 ok; IF-I01 4/5 falham; IF-I05 5/5 falham; IF-I06 5/5 falham; IF-I07 5/5 falham; IF-I11 5/5 falham; IF-I13 4/5 falham.

Os testes que reprovam acusam defeitos do produto; ficam vermelhos até a correção (nenhum `skip`). O typecheck de `e2e/` e de `packages/metricas` e o ESLint/Prettier dos arquivos novos passam.

## Defeitos
| ID | Título | Severidade | Responsável |
|---|---|---|---|
| [IF-001](bugs/IF-001-mudanca-de-filtro-perde-a-anterior.md) | Mudar um segundo filtro (ou chip, ou cadência) antes de o painel recarregar desfaz o primeiro | alta | react-frontend |
| [IF-002](bugs/IF-002-marcar-todas-rapido-ainda-deixa-parametro.md) | Marcar todas em sequência rápida ainda deixa o parâmetro (duplicado de IS-003, nova reprodução) | média | react-frontend |
| [IF-003](bugs/IF-003-ei-fl3-recortado-por-equipe.md) | EI-FL3 muda com equipe, mas a tela diz "Não afetado por: Equipe" | média | node-backend |
| [IF-004](bugs/IF-004-o6-recortado-por-tipo.md) | O6 muda com tipo, mas contrato e tela dizem "Não afetado por" (pergunta de regra ao usuário) | média | node-backend, após decisão |
| [IF-005](bugs/IF-005-periodo-personalizado-invalido-sem-aviso.md) | Personalizado inválido no link descartado sem o aviso 2.6 | média | react-frontend |
| [IF-006](bugs/IF-006-url-nao-canonica.md) | URL não canônica (padrão explícito, de/ate soltos, todas as opções, maiúsculas, parâmetro repetido) | baixa | react-frontend |
| [IF-007](bugs/IF-007-janela-de-12-meses-sem-ano.md) | Base com 12 meses mostra "10/10 a 09/10/2026" | baixa | react-frontend |

Nenhum defeito crítico. Regras invioláveis verificadas sem violação: BusinessMap e Acelerato não se misturam sob nenhum filtro; abaixo de 20 itens nenhum percentil é publicado; nenhum dado individual aparece; nenhuma comparação entre equipes (o consolidado diz "O sistema não compara equipes").

## Parecer
**Reprovado para filtros** enquanto o IF-001 (alta) estiver aberto: em uso comum (marcar Equipe e logo em seguida Tipo; usar a folha no celular) o primeiro filtro some sem aviso e o usuário lê números de um recorte diferente do que montou. A combinatória (109 de 109), a ida e volta da URL, as invariantes de cálculo (exceto aplicabilidade de O6 e EI-FL3) e os casos de borda principais estão sólidos. Sugestão de ordem: IF-001 com IF-002/IS-003 (mesma família), depois IF-003, IF-005, a decisão do usuário sobre o IF-004, e por fim IF-006 e IF-007.
