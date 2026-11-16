---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-classe-pela-prioridade
commit: d3795d73
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: classe pela prioridade nativa do BusinessMap (E7.100, E7.161; review E7.173; revalidação E7.204 e E7.222)

## Revalidação (volta 2, E7.222)
- Delta lido: `forge-check parecer delta docs/reviews/105-classe-pela-prioridade.md`, intervalo `fa07f541..a0ee7f04`: "nenhum arquivo do domínio mudou"; dispensado `e2e/tests/b12-fluxo.spec.ts` (teste do QA aprovado em `d3795d7`). Fora isso, só os pareceres do QA e deste review mudaram.
- **A6 resolvido em `d3795d73`.** TAT-02/03 (`b12-fluxo.spec.ts:327`) afirma "Sem prioridade (BusinessMap): N de M entregues (P%)" com N >= 1.
- **A7 resolvido em `d3795d73`.** TAT-06 (`b12-fluxo.spec.ts:363`) deixa "itens mínimos" e afirma a faixa do T4 com o universo "cartões com chegada ou entrega no período", o que a tela mostra.
- **CI:** run `43877746733` (pull_request, `0b4afd15`, merge sem mudança de código sobre `d3795d73`) verde: `e2e`, `e2e-parte (1/2)` e `(2/2)`, `build`, `testes`, `banco`, `openapi`, `seguranca`, `imagem`, `filtro` e `rapida`; `perf` pulado. Citado, não rerrodado.

## Revalidação (volta 1)
- Delta lido: `forge-check parecer delta docs/reviews/105-classe-pela-prioridade.md`, intervalo `8ec2598e..d4c535de`, sem o que veio da `develop`. O código da volta está em `ae49e54e` (40 arquivos, +443 −185); depois vieram `1e3f1bf2` (merge da `develop` com conflito) e `fa07f541` (merge do `fcd3a117`, hash do QA).
- **A1 resolvido.** `painel-real-f6.pg.test.ts:113` tira o T1 da lista "sem dado real" e o caso novo `(d1)` (`:124`) afirma o T1 real: sem `estado`, schema válido, `base.n > 0` e `semPrioridade.total = base.n + semPrioridade.n`. Job `banco` verde.
- **A2 resolvido em `fcd3a117`** (QA, E7.205): `hash-base-fase-a.json` passa a ef67b23e e 1f3e6fd7, os valores que o CI calculava, com o motivo na nota; Acelerato intacto. Job `build` verde.
- **A3 resolvido.** `catalogos.test.ts:21` cobre os seis ramos de `prioridadePorClasse`; `mock.test.ts` cobre o bug com severidade. Job `testes` verde (cobertura do mock no limite).
- **A4 resolvido.** `t4.ts:36` (`cartoesDe`) conta cartões distintos com chegada ou entrega em semana completa; o teste novo `prioridade.test.ts:109` (7 entregues sem prioridade) espera `{ n: 7, total: 7 }`, a sonda S1 do primeiro parecer agora passando. O `total` usa a mesma função sobre todos os cartões, então N e M têm a mesma unidade.
- **A5 resolvido.** `SemPrioridade.tsx` diz "Sem prioridade (BusinessMap): N de M <universo> (P%)", explica o campo vazio e destaca a partir de 20% com ícone, borda e texto (não só cor). Cada cartão passa o próprio universo; com `total = 0` cai em "N <universo>" sem divisão por zero. Parecer da UX versionado em `docs/ux/105-revisao-prioridade.md`.
- **Universos conferidos.** T1, T2 e T6: `total = base + sem prioridade` do mesmo filtro (entregues na janela). O6: 39 + 7 = 46 no teste. O24: `iniciosNoPeriodo` é o filtro comum, e `n` e `total` saem dele (`o24.ts:106`).
- **Contrato (politica-de-mudanca §5): aceite ratificado.** `semPrioridade` ganha `total: number` obrigatório em T1, T2, T4, O6, T6 e O24 (`schemas.ts:53`, `tambem.ts`). O objeto `semPrioridade` nasce neste mesmo PR e nunca foi à `develop`, então nenhum consumidor publicado quebra; é mudança compatível sem impacto estrutural, aprovada pelo tech-lead no review. `openapi.json`, `docs/api/metricas.md`, `docs/contratos/metricas/*.md` e as fotografias `snapshots/resultados/*.json` acompanham; job `openapi` verde.
- **Conflito da `develop` em `1e3f1bf2`** (O8 por tamanho, `cc2b7535`), resolvido em `allow-list.ts`, `normalizador.ts`, `projetor.ts` e `fluxo.tsx`. Lido o diff combinado: as duas saídas convivem (`severidade` e `tamanho_declarado` fora de `COLUNAS_LISTA`, ambas no `projetarCard` e em `COLUNAS_DIM`; imports de `SemPrioridade` e da régua juntos). Correto.
- Suíte na cabeça `fa07f541`: run `43874159036` (push) verde; run `43874169191` (pull_request) vermelho só em `e2e-parte (1/2)`, TAT-02/03 e TAT-06 (A6 e A7).

## Achados
- A1 (bloqueante) server/tests/painel-real-f6.pg.test.ts:112 · resolvido em `ae49e54e` (caso `(d1)`; `banco` verde).
- A2 (bloqueante) docs/qa/evidencias/hash-base-fase-a.json:5 · resolvido em `fcd3a117` (hash regravado com nota; `build` verde).
- A3 (bloqueante) packages/mock/src/businessmap/catalogos.ts:144 · resolvido (`catalogos.test.ts:21`; `testes` verde).
- A4 (bloqueante) packages/metricas/src/businessmap/t4.ts:35 · resolvido (`cartoesDe`, teste `prioridade.test.ts:109`).
- A5 (recomendado) web/src/components/ui/SemPrioridade.tsx:10 · resolvido (N de M, P%, universo e frase do campo vazio).
- A6 (bloqueante) e2e/tests/b12-fluxo.spec.ts:327 · resolvido em `d3795d73` (faixa "N de M entregues (P%)"; e2e verde no run 43877746733).
- A7 (bloqueante) e2e/tests/b12-fluxo.spec.ts:363 · resolvido em `d3795d73` (TAT-06 afirma a faixa do T4; e2e verde no run 43877746733).

## Sondas
- S1 · calcularT4 com 7 stories sem prioridade entregues na janela · espera: semPrioridade.n = 7 · obtido: 7 (teste prioridade.test.ts:109 na volta 1, testes verde)

## Riscos e pendências fora do review
- Tamanho: bem acima de 150 linhas fora de `.md`; o corpo do PR precisa de `teto: excedido`.
- `docs/engineering/achados-recorrentes.md` não existe neste repositório; a recorrência do A2 (hash do mock, também A1 de `105-s11.md`) fica registrada aqui.
- `classe_servico` segue na `DimCard` como coluna legada sem leitor no painel (`modelo.ts:24`); remoção é trabalho próprio.
- Arquivo solto `docs/qa/bugs/105-001-teste-pg-do-dominio-bm-desatualizado.md` na worktree não é desta revisão e ficou fora do commit.
