---
tipo: qa
contrato: 1
pedido: 011-fase2-taticas
branch: feature/011-fase2-taticas
commit: a1c0ee0
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-16
---

# QA: back da fase 2 do pedido 011, lote 2 (táticas: T13, T14 e o B11-001 no T10)

Links: plano `docs/qa/011-back-plano.md` (casos T10; T13 e T14 não tinham seção na fase 1 e saem da especificação), arquitetura `docs/architecture/features/metricas-tambem-disponiveis.md` §2 e §9, review `docs/reviews/011-fase2-taticas.md` (aprovado, rodada 4), segurança `docs/security/011-fase2-taticas.md` (aprovado sobre `6eda1cc`).

**Veredito: aprovado.** Zero bug aberto. Escopo incremental: o que o lote acrescenta ao lote 1 (T13, T14, B11-001 no T10). Os testes de produto já existiam, escritos pelo autor; o QA conferiu a cobertura por obrigação, aplicou mutantes e escreveu o teste que faltava (B-1 da segurança, P6 no T14 com equipe).

## Execução
- `pnpm run pronto` na raiz da worktree, sobre `a1c0ee0`: **rc=0** (load 1,29 e 4,2 GB livres no início). metricas 1041, mock 234, contratos 148, server 580 passaram (84 pulados, os que exigem banco real, preexistentes), web 1047, tools-docs 102; `docs:check` ok (67 métricas).
- Nenhum teste foi marcado `skip` por este lote.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| D-14' = A, R-4, CA-40 (T13: vínculo `predecessor` com outro quadro, vigente antes da entrega, inclusive removido antes dela) | `t13.test.ts:61`, `:75` | vínculo criado depois da entrega não conta; mesmo quadro e não predecessor não contam | passou |
| T13 quadro desconhecido nunca vira "não dependeu" | `t13.test.ts:54`, `:89` | sem fonte e quadro nulo vão a `semDado` | passou |
| Mínimo 20 e par com × sem do mesmo tipo (CA-6) | `t13.test.ts:104`, `:121`, `:143` | 19/20; 20 em tipos diferentes não forma par | passou |
| CA-8 (T13 por granularidade, story e frente em blocos separados) | `t13.test.ts:176` | nunca somadas | passou |
| T13 sem quadro, equipe, card relacionado nem pessoa na saída | `t13.test.ts:208` | schema estrito | passou |
| CA-28 (T14 só com UMA equipe no filtro) | `t14.test.ts:103` | "Todas" e mais de uma = `semEquipe` | passou |
| Q-T14-6 = A, R-1 = B (T14: "outros times" é um inteiro somado, nunca listado; oculto quando o booleano é falso ou ausente) | `t14.test.ts:113`, `:126`, `:137`, `:380` | booleano ausente = `null` e o resto do projeto sai; sem nome de outra equipe | passou |
| Q-T14-9 = A (campo múltiplo conta se o meu time estiver entre os marcados) | `t14.test.ts:293` | meu entre vários | passou |
| CA-31, CA-33 (T14: percentual só com n >= 20; sem time fora do denominador) | `t14.test.ts:147` | 19/20, inclusive total >= 20 com n < 20 | passou |
| Q-T14-5 = D, CA-41 (projeto ligado ao meu time com 0%; com 1 card do meu time) | `t14.test.ts:165`, `:180`, `:197` | ligado sem card, card sem ligação, equipe desconhecida | passou |
| CA-30 (ordem pelo total, nunca pela participação), CA-32 (blocos separados) | `t14.test.ts:270`, `:307`, `:351` | empate por código; descartado, subtarefa e projeto fora | passou |
| Projeto no período (Q-T14-4) | `t14.test.ts:216`, `:242`, `:334` | descartado, não iniciado, concluído antes do período | passou |
| B11-001 (T10: grafias que diferem só em caixa e espaços viram um fornecedor; exibe a mais frequente; empate em ordem neutra) | `bloqueios.test.ts:221`, `:241` | caixa, espaços nas pontas e repetidos; empate ALFA/Alfa | passou |
| T2.6 (versão de critério de 2026-10-17 marcada só no T10) | `o23.test.ts:73` | período antes e depois de 2026-10-17; outras métricas sem a marca | passou |
| Nenhum valor de pessoa na saída da T14 com equipe no filtro (B-1 da segurança) | `regras.property.test.ts`, bloco "P6 (B-1)" (novo, commit `a1c0ee0`) | uma execução por equipe da base (6) com guarda: a base tem >= 2 equipes e ao menos uma devolve projetos | passou |

## Teste novo e vermelho antes do verde (B-1)
- Teste: bloco "P6 (B-1)" em `packages/metricas/src/regras.property.test.ts`. A P6 antiga rodava o T14 sem equipe, que responde `semEquipe` vazio, e nunca via um valor. Agora roda o T14 uma vez por equipe da base e usa a mesma varredura (valor igual a nome de pessoa ou chave por pessoa falha). Quebra se o T14 passar a expor responsável ou usuário em título, lista ou qualquer valor.
- Mutante: `t14.ts`, `titulo: p.card.responsaveis[0] ?? p.card.titulo`. Comando: `npx vitest run src/regras.property.test.ts`. Falha observada nas 6 equipes: `T14.porGranularidade[0].projetos[0].titulo: valor é nome de pessoa`. Com o código real: 350 passam. Código de produção restaurado.
- A guarda contra varredura vazia está no próprio bloco (exige >= 2 equipes e >= 1 resposta com projetos).

## Mutação no diff (manual, `packages/metricas`)
Sem Stryker (teto de recursos); cinco mutantes, um por vez, base de 62 testes em `t10`, `bloqueios`, `t13`, `t14`, `o23`.
| Mutante | Falha observada |
|---|---|
| T10: tirar `toLowerCase()` | `bloqueios.test.ts` B11-001 (2 falhas) |
| T10: tirar a colagem de espaços repetidos | `bloqueios.test.ts` B11-001 |
| T13: vigência `criado_em > concluidoEm` → `false` (vínculo posterior passa a contar) | `t13.test.ts:75` |
| T14: `outrosPublicavel === true` → `!== false` (ausente publica) | `t14.test.ts:126` e `:373` |
| T14: `equipe.length !== 1` → `< 1` (várias equipes calculam) | `t14.test.ts:103` |
Nenhum sobrevivente. Restaurado por `git checkout` (um incidente de processo: o `checkout` também desfez o teste novo, ainda não commitado; reescrito e commitado, e a execução completa acima é sobre o commit final).

## Observações (sem bug)
- T14-M1 = B e M-1a (agregado e `base` do bloco permitem recuperar `n` de projeto oculto por subtração), e T14-ordem: decididos, mas **por desenho a fase 2 ainda publica `k de n`, `total` e a ordem pelo total**; o ajuste é pré-condição da fase 3 (cartão K-112, teste de propriedade "n de projeto oculto não recuperável"). Não testado como definitivo aqui, e nenhum teste atual afirma o contrário.
- "Menos de 2 pessoas" (Q-T14-10 = B, cadastro de membros) só existe na fase 3; na fase 2 o booleano é gerado pelo mock, e o teste cobre apenas o contrato do booleano (falso ou ausente oculta).
- Não testado aqui: front (pedido 025 em diante), lote 3 (operacionais), coleta real.
