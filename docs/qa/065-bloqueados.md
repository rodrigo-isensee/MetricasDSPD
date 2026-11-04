---
tipo: qa
contrato: 1
pedido: 065-bloqueados-sem-dado-real
branch: feature/065-bloqueados
commit: a6294341107cadb3017da374f3278a5cbb631d2b
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-04
---
# QA: 065, bloqueados sem dado real (E1.5, K-205)

Código testado: `a629434` (ponta atual). Desde `742e4f3` mudou só o teste W2b, sem código de produção; o restante da evidência vem de `742e4f3` e `917ee0b` (código de produção e testes iguais, fora o W2b). Obrigações: o desenho `docs/analises/065-desenho.md` (seções 1 a 4 e 8) e as decisões do dono (C, "isso", B). Não há especificação de UX com `CA-n`: cada decisão virou um teste.

## Escopo
- Dentro: BLOQUEADOS e O5 inteiros com Sem dado real; O1 e O2 com só a parte de bloqueio sem dado real (null, nunca 0) e o resto visível; faixa Pede atenção sem afirmar nada bloqueado; versão de critério T2.6; modo mock com bloqueios do seed intactos.
- Fora: `test:pg` e `pronto` (ficam com o dono; os `.pg.test.ts` aparecem como skipped); Postgres não estava no ar. A base real não foi exercitada neste parecer.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| BLOQUEADOS fora do mapa real, motivo próprio | contrato C1 e C2 (`origem.test.ts`); Q65-01 (E2E); W1 | mapa de 17 ids reais | passou |
| BLOQUEADOS sem número nem "Nenhum item bloqueado" | Q65-01; W1 | zero falso | passou |
| O1: bloqueados `null` (nunca 0), nota, WIP intacto | S2 (server); Q65-02; W2; W2b (descrição por coluna sem bloqueio) | null no lugar de 0 | passou |
| O2: nota, itens e percentis intactos, coluna Bloqueado "Sem dado real" | S3; Q65-03; W3 | "não bloqueado" distinto de "não sabemos" | passou |
| O5 inteiro Sem dado real, sem percentual (decisão B) | Q65-05; W4 | nenhum % publicado | passou |
| Faixa Pede atenção sem "Nada pede atenção" e sem falar de bloqueado | Q65-04; W5 | falso "tudo bem" | passou |
| Troca só na base real; mock mantém bloqueios | S6 | modo mock | passou |
| Outra métrica não recebe a nota (O3 mantém a sua) | S5 e S5b | vazamento entre métricas | passou |
| T2.6: versão de critério em O1, O2 e O5 | S7; `complementares.test.ts` | marca no gráfico | passou |
| Acessibilidade das telas mudadas | Q65-06 (Diária) e Q65-07 (Semanal com O5) | axe WCAG 2.2 AA, sérias e críticas | zero violações |

## Regravação na ponta a629434 (E1.5, cobertura do web)
- `git pull --ff-only origin feature/065-bloqueados`: Already up to date.
- web, `vitest run --coverage --maxWorkers=2`: `94 files passed, 1426 passed`.
- Cobertura do web: Statements 100% (5369/5369), Branches 100% (4995/4995), Functions 100% (1987/1987), Lines 100% (4601/4601).
- O teste novo W2b cobre a ramificação que faltava, a descrição do O1 por coluna sem bloqueio.
- E2E, server, contratos, typecheck e lint não rerodados: sem mudança de código desde `742e4f3`.

## Regravação na ponta 742e4f3
- web: `94 files passed, 1425 passed`.
- E2E `tests-api/bloqueio-sem-dado-065.spec.ts`, `chromium-api`, 2 workers, contra a API de teste `api-stub-065.ts` (porta 3199): `7 passed (19.5s)`.
- A2 resolvido: a formatação de `fluxo.tsx` foi commitada em `742e4f3`.

## Execução da rodada anterior (ponta 917ee0b)
- E2E novo, projeto `chromium-api`, 2 workers, contra a SPA em `VITE_FONTE=api` e `server/tests/pg/api-stub-065.ts` (API de teste sem banco: núcleo do mock, regras do mapa real e `semParteDeBloqueio` do servidor importado sem cópia): `7 passed (16.7s)`.
- contratos e metricas: `42 files, 1257 passed`.
- server: `80 files passed, 33 skipped; 1622 passed, 232 skipped` (skipped = `.pg.test.ts`, dono).
- web: `94 files, 1425 passed`.
- `pnpm run typecheck` rc 0; `pnpm run lint` limpo (a API de teste saiu de `e2e/` para `server/tests/pg/`, porque o lint do e2e proíbe import por caminho, ADR 0002).

## Mutação no código alterado (`parte-sem-dado.ts`)
- `bloqueados: null` trocado por `bloqueados: 0`: 2 testes caem (S2 e um teste de F6). Morto.
- O2 sem `comNota`: 2 testes caem (S3 e S5b). Morto.
- Arquivo restaurado depois; árvore sem alteração em código de produção.

## Vermelho antes do verde
Os testes de unidade (S, W, C) são do autor; vi cair com os dois mutantes acima. Para o E2E novo, o vermelho contra a base `1f1da67` não foi rodado: a API de teste importa `parte-sem-dado.ts`, que não existe na base, então a base nem carrega. Fica como limite desta evidência.

## Achados
- A1 (recomendado) packages/contratos/src/origem.ts:47 · JSDoc do interruptor `BLOQUEIOS_COM_DADO_REAL` ficou acima da constante do O5; ver o review.
- A2 (recomendado) web/src/features/complementares/fluxo.tsx:64 · resolvido em 742e4f3: o format:check do Prettier falhava neste arquivo.
- A3 (recomendado) docs/qa/065-bloqueados.md:1 · os `.pg.test.ts` (S1 na base real) não rodaram aqui; o dono roda `test:pg` antes da release.

## Limites declarados
- O E2E usa API de teste, não a API com banco: prova a SPA e o contrato, não a leitura de `fato_bloqueio` vazia.
- Contraste do tema escuro (M2 do UX) não medido por mim além do axe, que passou.
- O parecer de interface cita um commit anterior; o review fica desatualizado e é regravado pelo tech-lead.
