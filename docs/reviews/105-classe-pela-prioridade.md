---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-classe-pela-prioridade
commit: 1e3f1bf2907bfff30eb7411107e2e3402e2f35dd
parecer: reprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: classe pela prioridade nativa do BusinessMap (E7.100, E7.161; review E7.173; revalidação E7.204)

## Revalidação (volta 1, cabeça `d4c535de`)
- Delta lido: `forge-check parecer delta docs/reviews/105-classe-pela-prioridade.md`, intervalo `8ec2598e..d4c535de`, sem o que veio da `develop`. O código da volta está em `ae49e54e` (40 arquivos, +443 −185); `d13e294a` e `d4c535de` são merges (branch e `develop`).
- **A1 resolvido.** `painel-real-f6.pg.test.ts:113` tira o T1 da lista "sem dado real" e o caso novo `(d1)` (`:124`) afirma o T1 real: sem `estado`, schema válido, `base.n > 0` e `semPrioridade.total = base.n + semPrioridade.n`. Job `banco` verde no run `43872330381`.
- **A2 aberto.** `docs/qa/evidencias/hash-base-fase-a.json` não mudou no delta; job `build` segue vermelho com a mesma linha: "hash da base mock (vs fase A): REPROVADO", "difere em hashBase, hashBusinessMap (antes: b6a3c384, 8d47d431; agora: ef67b23e, 1f3e6fd7)". Com isso `e2e` e `perf` seguem pulados.
- **A3 resolvido.** `catalogos.test.ts:21` cobre os seis ramos de `prioridadePorClasse`; `mock.test.ts` cobre o bug com severidade. Job `testes` verde (cobertura do mock no limite).
- **A4 resolvido.** `t4.ts:36` (`cartoesDe`) conta cartões distintos com chegada ou entrega em semana completa; o teste novo `prioridade.test.ts:109` (7 entregues sem prioridade) espera `{ n: 7, total: 7 }`, que é a sonda S1 do primeiro parecer agora passando. O universo `total` usa a mesma função sobre todos os cartões, então N e M têm a mesma unidade.
- **A5 resolvido.** `SemPrioridade.tsx` diz "Sem prioridade (BusinessMap): N de M <universo> (P%)", explica o campo vazio e destaca a partir de 20% com ícone, borda e texto (não só cor). Cada cartão passa o próprio universo; com `total = 0` cai em "N <universo>" sem divisão por zero. Parecer da UX versionado em `docs/ux/105-revisao-prioridade.md`.
- **Universos conferidos.** T1, T2 e T6: `total = base + sem prioridade` do mesmo filtro (entregues na janela). O6: 39 + 7 = 46 no teste. O24: `iniciosNoPeriodo` é o filtro comum, e `n` e `total` saem dele (`o24.ts:106`).
- **Contrato (politica-de-mudanca §5): aceite ratificado.** `semPrioridade` ganha `total: number` obrigatório em T1, T2, T4, O6, T6 e O24 (`schemas.ts:53`, `tambem.ts`). O objeto `semPrioridade` nasce neste mesmo PR e nunca foi à `develop`, então nenhum consumidor publicado quebra; é mudança compatível sem impacto estrutural, aprovada pelo tech-lead no review. `openapi.json`, `docs/api/metricas.md`, `docs/contratos/metricas/*.md` e as fotografias `snapshots/resultados/*.json` acompanham; job `openapi` verde.

- **Cabeça nova `1e3f1bf2`** (chegou durante a revisão): merge da `develop` (O8 por tamanho, `cc2b7535`) com conflito resolvido em `allow-list.ts`, `normalizador.ts`, `projetor.ts` e `fluxo.tsx`. Lido o diff combinado: as duas saídas convivem (`severidade` e `tamanho_declarado` fora de `COLUNAS_LISTA`, ambas no `projetarCard` e em `COLUNAS_DIM`; imports de `SemPrioridade` e da régua juntos). Correto. Mock e `hash-base-fase-a.json` não mudam, então o A2 segue igual. CI dessa cabeça (runs `43873680248` e `43873689111`) em andamento na hora do parecer.

## Suíte (CI do head, citado e não rerrodado)
Run `43872330381` (push, `d4c535de`): **vermelho**. `build` em failure (A2); `e2e` e `perf` pulados; `testes`, `banco`, `openapi`, `seguranca`, `imagem`, `filtro` e `rapida` verdes.

## Achados
- A1 (bloqueante) server/tests/painel-real-f6.pg.test.ts:112 · resolvido em `ae49e54e` (caso `(d1)`; `banco` verde).
- A2 (bloqueante) docs/qa/evidencias/hash-base-fase-a.json:5 · pendente: hash da base mock não regravado; `build` vermelho no run 43872330381 (b6a3c384, 8d47d431 viram ef67b23e, 1f3e6fd7). Regravar (`hash-base --salvar`) e anotar o motivo na nota. Recorrente: A1 de `105-s11.md`.
- A3 (bloqueante) packages/mock/src/businessmap/catalogos.ts:144 · resolvido (`catalogos.test.ts:21`; `testes` verde).
- A4 (bloqueante) packages/metricas/src/businessmap/t4.ts:35 · resolvido (`cartoesDe`, teste `prioridade.test.ts:109`).
- A5 (recomendado) web/src/components/ui/SemPrioridade.tsx:10 · resolvido (N de M, P%, universo e frase do campo vazio).

## Sondas
- S1 · calcularT4 com 7 stories sem prioridade entregues na janela · espera: semPrioridade.n = 7 · obtido: 7 (teste prioridade.test.ts:109 na volta 1, testes verde)

## Riscos e pendências fora do review
- Tamanho: bem acima de 150 linhas fora de `.md`; o corpo do PR precisa de `teto: excedido`.
- `docs/engineering/achados-recorrentes.md` não existe neste repositório; a recorrência do A2 fica registrada aqui.
- `classe_servico` segue na `DimCard` como coluna legada sem leitor no painel (`modelo.ts:24`); remoção é trabalho próprio.
- Arquivo solto `docs/qa/bugs/105-001-teste-pg-do-dominio-bm-desatualizado.md` na worktree não é desta revisão e ficou fora do commit.
