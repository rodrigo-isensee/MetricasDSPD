---
tipo: qa
contrato: 1
pedido: 098-acelerato-todos-os-times
branch: feature/098-b1-nomes-times
commit: 34793256b4e8dd874dced2e78bed6a2ea86e9c75
parecer: reprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-18
---
# QA: 098 lote B1 (migração 0043, nomes dos times)

Leitura estática do commit 856804d2 (git só leitura, sem rodar suíte; sem PR ainda). Medida usada: a do assistente (`/home/rodrigoisensee/pedidos-assistente/fila307-ASSISTENTE-b1-commit.txt`, logs em `~/.metricas-k274/b1`): vitest sem banco 35/36 (falha esperada em `sequenciais`), suíte pg 54 arquivos / 368 testes passou em Postgres descartável, tsc rc 0. A suíte inteira vale pelo `bateria` do CI do PR; sem PR, nada a citar.

## Critério → teste → resultado
| Teste do plano | Teste no commit | Fronteira protegida | Resultado |
|---|---|---|---|
| T-B1.1 (45 ativos, 24/25 inativos, nenhum "Workflow <id>", versões antigas só com vigente_ate) | `nomes-times.pg.test.ts` (3 casos T-B1.1) | lista fechada igual à tabela; histórico intacto | coberto, passou na medida do assistente |
| T-B1.2 (falha fechada, nada gravado, mensagem só com time_id) | `nomes-times.pg.test.ts` (4 casos) + `nomes-times.test.ts` (validações TS) | 1 dos 47 renomeado; time 2 com outro nome; time ativo fora de 1 a 50; >80, `[revisar]`, vazio, provisório | parcial: faltam inativo, workflow diferente, versão já existente, `validarNomes` chamado em `ddl` (A3, A4) |
| T-B1.2a (47 slugs distintos, colisão falha) | `nomes-times.test.ts` | slug único com times 1 a 3 | coberto. Nota: o plano diz 47, o teste (corretamente) conta 48 (45 + 3); o plano tem a conta errada |
| T-B1.3 (vigenteEm antes da migração devolve o nome novo) | `nomes-times.pg.test.ts` | dia de partida = 12 meses antes (0019), estritamente anterior | coberto (time 5 e wf 127; o 220 não) |
| T-B1.4 (wf 127/220 projetam com 20/10; nenhuma métrica muda) | `nomes-times.pg.test.ts` (dado) | só a linha de `ref_time_workflow` | parcial: não há teste de projeção (A5) |
| T-B1.5 (down: apaga, reabre, gatilho volta; com vigência posterior falha sem tocar) | `nomes-times.pg.test.ts` (2 casos) + SQL estático | gatilho religado; vigência posterior | parcial (A1, A2) |

## Casos que o plano pediu e faltam
- **Down com vigência posterior:** testa só vigência nova em `ref_time` (time 5) e fechamento de `ref_time_workflow` da correção. Não testa vigência posterior em `ref_time_workflow` de outra origem, nem vigência da 0019 fechada fora da lista (terceira cláusula do guarda). Também só confere `nGravadas > 0`, não que "nada foi tocado" (vigências reabertas, versão presente).
- **Validação que falha antes de gravar:** o `DO $$` está coberto para nome. Não está para workflow trocado, time inativo (1 a 3 ou dos 47) nem para a versão `098-E4` já existente.
- **Nenhum nome de pessoa:** o teste compara o banco com `NOMES_NOVOS` (a mesma constante da migração): prova "gravado = lista", não "lista = tabela do plano". O oráculo real (CP-pessoa) é a revisão do security-engineer no PR; o teste sozinho não pega nome de pessoa na constante.
- **wf 127 e 220:** dado coberto; projeção de card não.

## Mutantes que sobreviveriam (análise, não rodados)
| Mutante | Por que sobrevive |
|---|---|
| remover `validarNomes();` de `ddl` (0043:~L83) | `validarNomes` é testada direto; nenhum teste chama `ddl` com lista ruim. Nome longo ou `[revisar]` passaria ao banco |
| trocar `ENABLE TRIGGER` de `ref_time_workflow` por nada | o teste do gatilho só tenta DELETE em `ref_time`; o gatilho de `ref_time_workflow` ficaria desligado sem falha (viola CP-historico) |
| gatilho testado com DELETE, não com UPDATE de `vigente_de` | o plano manda UPDATE de `vigente_de`; um gatilho que só barra DELETE passaria |
| remover `t.ativo` ou `w.situacao = 'time'` do `DO` | nenhum caso usa time inativo ou situação diferente |
| remover o `IF EXISTS ... versao já existe` | sem caso |
| `nome !== nome.trim()` e fronteira 80 (`>` por `>=`) | sem caso de espaço nas pontas nem de nome com exatos 80 |
| `foto()` do down/up só lê `ref_time` | down que deixasse `ref_time_workflow` diferente após o up refeito passaria |

## Outros
- `referencia-times.pg.test.ts`: a asserção de `registrado_por` foi afrouxada (`arrayContaining` + `length <= 2`); não afirma a presença de `correcao-098-E4`, e aceita só a carga inicial. Recomendo afirmar os dois pares.
- `migracoes.estatico.test.ts` isenta a 0043 da regra "sem INSERT" e confere só o `up` (INSERT em 3 tabelas, único UPDATE = `vigente_ate`). Adequado.
- `sequenciais`: a `develop` (acb62951) termina na 0041; a 0043 sem a 0042 (T8, branches do 105) deixa o check vermelho no CI. Sem a 0042 na `develop`, o PR não fica verde.

## Achados
- A1 (bloqueante) server/tests/nomes-times.pg.test.ts:149 · gatilho religado só provado em `ref_time` e com DELETE; o plano pede UPDATE de `vigente_de` e `proibir_alteracao_vigencia` ativo nas duas tabelas (CP-historico). Testar UPDATE de `vigente_de` depois do down em `ref_time` e `ref_time_workflow`.
- A2 (bloqueante) server/tests/nomes-times.pg.test.ts:171 · down com vigência posterior não cobre `ref_time_workflow` de outra origem nem 0019 fechada fora da lista, e não prova "sem tocar em nada". Somar os casos e conferir o estado após a falha.
- A3 (recomendado) server/tests/nomes-times.pg.test.ts:104 · faltam casos de falha fechada: workflow diferente, time inativo (1 a 3 e dos 47), versão `098-E4` já existente (mutantes dos `DO $$` sobrevivem).
- A4 (recomendado) server/tests/nomes-times.test.ts:45 · nenhum teste chama `ddl()` com lista inválida; remover `validarNomes()` de `ddl` sobrevive. Somar o caso, e espaço nas pontas e nome de exatos 80.
- A5 (recomendado) server/tests/nomes-times.pg.test.ts:79 · só o dado de `ref_time_workflow` é testado; faltam card dos wf 127 e 220 projetando com o time 20 e o 10 e o 220 em T-B1.3.
- A6 (recomendado) server/tests/referencia-times.pg.test.ts:82 · asserção afrouxada; afirmar o par `correcao-098-E4`/`correcao`.
- A7 (bloqueante) server/migrations/0043_bm_nomes_times.ts:1 · `sequenciais` fica vermelho sem a 0042 na `develop`; o PR só passa com a 0042 antes ou renumeração (A5 do plano, `forge-check sobreposicao`).

## Vermelho antes do verde e mutação
Não rodados: sem PR, sem pnpm e git só leitura nesta passada. Comando exato para o assistente, na worktree 052h com árvore limpa, depois que o autor cobrir A1 a A5: `forge-testes --vermelho acb62951646cfebc2243c8429e1f6582bc9d1175` (a stack do projeto não traz ferramenta de mutação; os mutantes acima ficam como lista para testes novos).

## Resultado
Reprovado nesta rodada: a lógica da migração (up, validações e down) está correta e a lista casa com o plano na leitura, mas T-B1.5 não cobre o que o plano e o CP-historico pedem (A1, A2) e o check `sequenciais` bloqueia o PR (A7). Os demais achados são recomendados.

## Delta (856804d2..34793256)
Leitura do diff (git só leitura, sem pnpm). Medida do assistente (`fila324`, logs em `~/.metricas-k274/b1-v3`): pg 376/376; vitest 38/39, única falha a esperada (`sequenciais`: expected 43 to be 42). Sem PR: a suíte inteira fica para o `bateria` do CI do PR. Vermelho antes do verde e mutação seguem não rodados (sem pnpm); comando: `forge-testes --vermelho acb62951646cfebc2243c8429e1f6582bc9d1175`.

| Achado | Estado | Evidência no delta |
|---|---|---|
| A1 | resolvido | `nomes-times.pg.test.ts` T-B1.5: `gatilhosAtivos` (`tgenabled = 'O'`) nas duas tabelas; UPDATE de `vigente_de` e DELETE barrados (55000) em `ref_time` e `ref_time_workflow` após o down |
| A2 | resolvido | 6 casos `posteriores` (cada cláusula da guarda, inclusive outra origem e 0019 fora da lista, nas duas tabelas); `estado()` antes e depois igual, gatilhos ativos |
| A3 | resolvido em parte | cobre workflow diferente, situação diferente, inativo dos 47, time 24 já inativo e versão já existente. Falta caso de time inativo entre 1 e 3 (o `DO` os confere pelo nome); recomendação, não bloqueia |
| A4 | resolvido | `ddl(S, novos)` valida antes de montar o SQL (teste com 5 listas ruins); espaço nas pontas, cifrão e 80 exatos cobertos |
| A5 | resolvido | T-B1.4 (projeção) com `carregarReferencia`/`noDia`: wf 127 e 220 nos dias da partida e de hoje, time 20 e 10, nome novo; 220 em T-B1.3 |
| A6 | resolvido | `referencia-times.pg.test.ts:82` afirma os dois pares exatos (`carga-inicial-057-E3`/`carga_inicial`, `correcao-098-E4`/`correcao`) |
| A7 | aberto, esperado | `sequenciais` continua vermelho (43 contra 42): depende da 0042 do 105 na `develop`; sem ela o PR não passa. Decisão de sequência do tech-lead, não defeito de teste |

Mudança de produção no delta: a migração deixou de importar `slug` (slug único passou a `validarSlugs`, chamado só pelo teste, com teste de que o import não volta) e rejeita `$` no nome (fecharia o bloco `DO $$`). Coerente com o plano, coberto por teste, sem achado novo.

Veredito do delta: A1 a A6 atendidos; resta só A7, bloqueante por depender da 0042. Parecer segue `reprovado` até a 0042 entrar na `develop` (ou renumeração) e o `sequenciais` ficar verde; resolvida essa ordem e com o CI do head verde, aprova sem novo código de teste.
