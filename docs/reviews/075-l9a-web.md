---
tipo: review
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-9a
commit: f79685e841932a7043b681d9224cac66168de104
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---
# Code review: 075 L9a, a web deixa de depender da nota `bloqueio-sem-dado-real` (K-204)

## Parecer

Aprovado. O lote faz o que a seção "Lote 9a" de `docs/analises/075-plano.md` pede, nem mais nem menos: O1 e O2 deixam de ler a nota, o teste do 065 se inverte e nenhum uso do id sobra em `web/src`. Os dois achados são recomendados e não devolvem o lote.

## O que foi lido (diff `eac38a64...f79685e8`, 1 commit, 4 arquivos)

- **O1** (`CartaoO1.tsx:34`): `semBloqueio` passa a depender só de `d.hoje.bloqueados === null`. O ramo do null fica (texto "Bloqueados: sem dado real", série sem Bloqueados), porque o contrato ainda aceita o null até o 9b. Nada inventa 0.
- **O2** (`CartaoO2.tsx:69`, `:131`, `:206`): saem o `semBloqueio` pela nota, a legenda condicional e a célula "Sem dado real". A coluna Bloqueado mostra o motivo real ou "—"; o anel "bloqueado" volta à legenda; `naoClass` segue coberto por `motivo-nao-classificado.test.tsx:68`.
- **`CartaoComplementar.tsx:30`**: só comentário.
- **Contrato:** nenhum arquivo de `packages/` nem `server/` no diff. O id segue em `NOTA_CARTAO_IDS` até o 9b, como o plano manda.
- **Estado genérico de métrica sem fonte real:** o diff não toca `FaixaAtencao.tsx`, `EstadoSemDadoReal` nem o `SemDadoRealErro`; o testid `faixa-atencao-sem-dado-real-parcial` continua em `FaixaAtencao.tsx:148` para outras métricas. BLOQUEADOS e a faixa não tinham ramo próprio da nota (o `grep` abaixo confirma); o que o plano chama de ramo deles era o estado genérico, que fica.
- **Teste** (`bloqueio-sem-dado.test.tsx`): o bloco W1 a W5 do 065 (nota presente) sai; o bloco do 6b (W0 a W5, sem nota, dado real) fica; entra o caso do O1 com `bloqueados` null, com e sem equipe, que guarda o ramo do null até o 9b. Nenhuma asserção do bloco que fica foi afrouxada.
- **Guardas mudadas:** `CartaoO1.tsx:34` (menos um `||`, ramo do null testado pelo caso novo), `CartaoO2.tsx:69` (menos um `!semBloqueio &&`, testado por `motivo-nao-classificado`), ternários de `:131` e `:206` removidos (W3 do 6b e mutante M2 do QA).
- **Regras invioláveis:** sem cálculo, sem mistura de fontes, sem dado de pessoa; a tela só deixa de consumir uma marca.

## Execução

- `vitest run --maxWorkers=2 src/features/operacional` (web, no commit revisado): 12 arquivos, 163 testes, todos passam.
- `grep -rn bloqueio-sem-dado-real web/src`: vazio (o QA leu o mesmo; conferido aqui).
- `git diff --numstat --no-renames eac38a64 f79685e8`: 33 adições e 140 remoções, 173 linhas; 125 delas são remoção do teste do 065.
- Suíte completa: no CI do PR.

## A1 do QA (mutação M1 sobreviveu)

Fica recomendado, sem promoção. Religar a leitura da nota no O2 sobrevive porque nenhuma fixture traz a nota, e a API não a emite desde o 6b. O buraco fecha no 9b: o id sai de `NOTA_CARTAO_IDS`, e `d.notas.includes('bloqueio-sem-dado-real')` deixa de compilar no `typecheck`. Um teste agora teria de injetar uma nota que o 9b apaga, e sairia no lote seguinte. Recomendo não escrever o teste e conferir no review do 9b que o `typecheck` mata o M1.

## Achados
- A1 (recomendado) web/src/features/operacional/bloqueio-sem-dado.test.tsx:66 · A1 do QA: M1 sobrevive por falta de fixture com a nota. Fecha no 9b pelo tipo (o id sai do enum e a leitura deixa de compilar); conferir no review do 9b, sem teste novo agora.
- A2 (recomendado) web/src/features/operacional/bloqueio-sem-dado.test.tsx:1 · 173 linhas, acima de 150, sem declaração ainda (o commit não diz). O corpo do PR (E1.9) leva `teto: excedido, 173 linhas, remoção do teste do 065 (140 remoções); dividir quebraria o teste`, recontado no PR.

## Delta lido

Primeira passada; sem delta anterior.
