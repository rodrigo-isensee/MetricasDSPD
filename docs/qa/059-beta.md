---
tipo: qa
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-coleta-worklog
commit: 61064423ec3ae8f01b57fb617e4e8a5a0a3afdb8
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-02
---
# QA: 059-aba-apontamento, branch da coleta do worklog (trilha A, E2.49, K-193)

**Veredito: aprovado em `6106442`.** A ponta de código é `82d1360`; os dois commits acima dela (`28f92fe` e `6106442`) só trazem pareceres em `docs/`, conferido pelo `git log`. Review e segurança aprovados na ponta de código (`commit:` dos dois pareceres igual a `82d1360`). Plano usado: `docs/qa/059-plano-testes.md` no ramo `origin/docs/059-apontamento-discovery`, casos da trilha β (coleta). Nenhum bug aberto. Nenhum nome, comentário, e-mail ou id real foi lido ou escrito: só fixtures sintéticas (ids 9 000 000 000 ou mais) e o `.env` não foi aberto.

## Achados

## Conferência do diff contra o plano
O diff `b1c2865..6106442` (93 arquivos) tem migrações 0021 a 0032, módulo `server/src/modulos/businessmap/apontamento/`, entradas CLI (coleta, eliminação, ref:sync) e testes. O escopo bate com a lista de casos da trilha β do plano (CT-35 a CT-37, CT-41 a CT-42 no que é do coletor, CT-47 a CT-52, CT-71 a CT-80, CT-85). O corte do plano (eliminação a pedido, CT-49) não foi aplicado: a eliminação está implementada e testada. Casos de γ e δ (rota, front, 421, interruptor de nome, acessibilidade) não se aplicam a esta branch.

## Execução (uma suíte por vez; MemAvailable 14 GB e load 0,9 antes de cada rodada)
- `pnpm run pronto` na worktree 052d: rc=0. server 1396 passaram e 205 puladas (os `.pg`, que rodam na suíte abaixo; sem `skip` no código), packages/metricas 1219, packages/contratos 187, packages/mock 258, web 1256, tools 73 + 33 + 14 + 102; lint, formato, typecheck, cobertura e `docs:check` verdes.
- `pnpm run test:pg`: rc=0, 30 arquivos, **205 testes passaram** (os mesmos 205 que o `pronto` pula).
- Suíte E2E: nada de interface muda nesta branch (coleta e banco); a aba só chega em γ e δ.

## Critério → teste → resultado
O plano não tem `CA-n` de UX na coleta; as obrigações da trilha β são os CT abaixo e os casos de abuso CA-AP. Os testes são os do autor (`server/tests/apontamento-*.test.ts` e `.pg.test.ts`), lidos pelo nome contra cada obrigação e confirmados por mutação (seção seguinte). Nomes de arquivo abreviados: `coleta` = `apontamento-coleta.test.ts`, `pg` = `apontamento.pg.test.ts`.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-AP-1 (papéis) | CT-40: `pg` "papéis (CA-AP-1)", `apontamento-esquema.test.ts` "grants do apontamento" | `dspd_api` negado (42501) em todas as tabelas e em `pessoa_ref`; coletor sem UPDATE/DELETE | passou |
| CA-AP-2 (comentário só em memória) | CT-41: `pg` carga ponta a ponta com `ignorarFields` (varredura de toda tabela por marcador), `coleta` "comentário só em memória", `apontamento-registro.test.ts` | marcador de comentário, e-mail, `campo_novo_059` em nenhuma tabela; falso que ignora `fields` | passou |
| CA-AP-3 (nome e `user_id` fora do log e de `ctl_`) | CT-42: `coleta` "falha de /users" (`id_origem` = `logged_time_id`), `log.test.ts` redact em 1 e 2 níveis | `user_id` nunca como origem da falha | passou |
| CT-35 (hierarquia) | `apontamento-lotes.test.ts` `calcularRaizes`; `pg` hierarquia | sem pai, ciclo, profundidade 10 e 11, pai fora do escopo | passou |
| CT-36 (marca d'água, sobreposição) | `coleta` incremental e guardas; `pg` carga ponta a ponta | `logged_from` = marca menos 1 h; relido sem duplicar | passou |
| CT-37 e CA-AP-11 (cliente) | `apontamento-cliente.test.ts` | caminho fora da lista, `fields` fixo, 200 e 201 cards, `per_page` 1000 e 1001, redirecionamento, só GET; 429 e 401 no cliente já cobertos por `http.test.ts` e `apontamento-lotes.test.ts` | passou |
| CT-71 (teto 1000) | `apontamento-lotes.test.ts` `lerLote` | 999, 1000, 1001, um card no teto (`lote_no_teto`), número ímpar de cards | passou |
| CT-72 (lote incompleto não exclui) | `coleta` "lote incompleto nunca gera exclusão"; `pg` guarda de massa | 404, recusa com id inválido, lote no teto | passou |
| CT-73 (guarda de massa) | `coleta` "guarda de massa", "o limiar é parâmetro"; `pg` | 20 de 100 grava, 21 de 100 não; 0 ativos; 1 de 1 | passou |
| CT-74 e CT-75 (reaparecido, chave natural) | `coleta` "reaparecido", "duas execuções no mesmo dia"; `pg` exclusão por presença | mesmo dia, dia seguinte, dia civil de São Paulo | passou |
| CT-76 (varredura de presença) | `coleta` "segunda a sábado" e "domingo" | janela de 90 dias, domingo com 12 meses, sem `logged_from` na varredura | passou |
| CT-77 (histórico fora do cliente) | `apontamento-lotes.test.ts` "o histórico e as categorias nunca são chamados"; `apontamento-cliente.test.ts` | contador do falso igual a 0 nos dois caminhos | passou |
| CT-78 (hash do registro) | `apontamento-registro.test.ts` "registro_sha256"; `pg` incremental | comentário e `user_id` fora do hash; edição gera versão | passou |
| CT-79 (atomicidade) | `coleta` "falha entre a staging e a projeção"; `pg` atomicidade | marca não anda; releitura sem duplicar | passou |
| CT-80 (carga inicial retomável) | `coleta` "carga inicial"; `pg` retomável por lote | queda no lote 2; 450 cards em 200, 200 e 50 | passou |
| CT-47 e CT-48 (versões, valores atípicos) | `coleta` "versão nova", "115 h entram"; `apontamento-registro.test.ts` recusas | `time` 0, 1, 86 400 e 86 401; data de hoje e de amanhã; ids ruins | passou |
| CA-AP-10 e CT-85 (eliminação e supressão) | `apontamento-eliminacao*.test.ts`, `coleta` "supressão antes do /users", `pg` supressão; `sem-sal` em `usuarios-businessmap.test.ts` e `coleta-businessmap.pg.test.ts` | pessoa eliminada não recriada, `/users` não chamado para ela, sal trocado e prefixo não casam, sal ausente falha | passou |
| CA-AP-13 e CT-52 (esquema fechado) | `apontamento-esquema.test.ts`, `apontamento-registro.test.ts` estrutura | coluna nova derruba o teste; sem texto livre nem `payload` | passou |
| A2 e A7 do plano (versão na staging, recusa sem segurar a marca, `recusa_em_massa`) | `coleta` e `pg` blocos A2 e A7, migração 0032 | A, B, A vira 3 linhas; exatamente 5 por cento e menos de 10 recusas não disparam | passou |
| Dicionário com vigência | `apontamento-dicionario*.test.ts` | termo retirado só fecha a vigência; `dspd_ref` só atualiza `vigente_ate` | passou |

## Vermelho antes do verde (`R-QA`)
Os testes da branch são arquivos novos. A falha de carga da base só prova o que a base não tinha, então a prova útil foi: testes do HEAD sobre o código anterior ao A2 e A7 (`10e7a5a`), numa cópia descartável fora da árvore do autor. O `forge-testes` não foi usado (o projeto não o tem na árvore); esta é a forma do projeto.

```
vermelho: base=10e7a5a head=6106442
 Failed Tests 8 | Tests 8 failed | 43 passed (51)  (apontamento-coleta.test.ts)
 FAIL ... > comentário só em memória e validação na fronteira > registro recusado (data futura, horas, id) ...
 FAIL ... > os cinco códigos de recusa de registro são da lista fechada ...
 FAIL ... > carga inicial com um registro recusado de vez ...
 FAIL ... > a varredura grava a mesma recusa uma vez por execução ...
 FAIL ... > recusa com logged_time_id válido não tira o lote de completo ...
 FAIL ... > recusa com logged_time_id inválido tira o lote de completo ...
 FAIL ... > guarda recusa_em_massa: mais de 5 por cento ...
 FAIL ... > guarda recusa_em_massa: exatamente 5 por cento ...
```

Os 8 testes da decisão A7 caem sem a implementação e passam no HEAD.

## Mutação à mão nas fronteiras que o plano manda provar
Cópia descartável em `$TMPDIR` (`git archive` da ponta, só um arquivo mutado por vez), rodando os testes unitários da trilha (`apontamento-*`, `coleta-businessmap`, `config-businessmap`, `log`, `usuarios-businessmap`). Não há ferramenta de mutação configurada neste projeto (a meta de `praticas.md` não foi aplicada com Stryker); a lista abaixo é a das fronteiras do plano, 13 mutantes.

| Mutante | Resultado |
|---|---|
| M1 teto `>=` vira `>` (`lotes.ts`) | morto (6 testes) |
| M2 massa `>` vira `>=` (`coleta.ts`) | morto (8) |
| M3 janela 90 vira 91 dias | morto (2) |
| M4 domingo vira sábado | morto (2) |
| M5 data civil de São Paulo vira UTC | morto (3) |
| M6 sobreposição de 1 h: menos vira mais | morto (1) |
| M7 supressão ignorada na lista dos ids a pedir (`coleta.ts:160`) | **sobreviveu, equivalente**: `resolverResponsaveis` repete a supressão com o sal (A1 da segurança, `usuarios.ts:55-68`), então a camada de fora é redundante. Provado: M7 junto com a remoção da camada de dentro cai (4 testes) e a remoção da camada de dentro sozinha também cai (2 testes). Aceito como defesa em duas camadas |
| M8 lote completo ignorado antes de gravar exclusão | morto (2) |
| M9 limiar de massa 20 vira 25 por cento | morto (1) |
| M10 teto 1000 vira 1001 (`http.ts`) | morto (52) |
| M11 `recusa_em_massa` `>` vira `>=` | morto (1) |
| M12 mínimo de 10 recusas `>=` vira `>` | morto (2) |
| M13 pedido sem o `fields` fixo | morto (47) |

12 mortos e 1 equivalente justificado. Os mutantes M1 a M13 rodaram com a árvore do autor intacta (`git status` limpo ao fim).

## Cenários fora do que o código cobre, e limites desta rodada
- Os casos de abuso do plano (`CA-AP-n`) já existem como testes do autor, com varredura de `information_schema`, grants e redact; por isso o QA **não criou** os arquivos `qa-059-*` do plano: um segundo teste que falha pelo mesmo motivo é redundante pela regra de parada da skill, e a independência foi garantida pelos 13 mutantes e pelo vermelho acima. Se o tech-lead preferir arquivos separados do QA, vira cartão.
- Não rodou com dado real nem contra o BusinessMap (PE-6 e PE-8 são do dono); só servidor falso em `127.0.0.1`.
- Não há E2E nem acessibilidade nesta branch (sem interface).
- Pendências de outros papéis, não bloqueantes aqui: A4 da segurança (nome de Outra área em `dim_responsavel`, fatia de retenção) e A10 do review (comentário da entrada do worklog), ambos recomendados e abertos nos pareceres deles. A linha `teto: excedido` do PR é do tech-lead.
- Conflito de numeração de migração da rota (view de quem é do time) e coleta já tratado na E2.48; não faz parte desta branch.

## Bugs
Nenhum. Nada registrado em `docs/qa/bugs/`.
