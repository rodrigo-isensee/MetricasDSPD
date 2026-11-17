---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-k411-roteiro-dono-texto
commit: 38e5579fc4b11408a372b3aecd549cc3e822f876
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: roteiro do dono, três textos da receita B e do passo 0.2 (K-411; E7.588)

## Escopo lido
Delta `origin/docs/105-k410-roteiro-dono..38e5579f`: um commit de autor (`38e5579f`), só `docs/devops/105-roteiro-dono.md`, 3 linhas trocadas (60, 242 e 265), que respondem aos A4, A5 e A6 recomendados do review do K-410 (`docs/reviews/105-k410-roteiro-dono.md`). Não há código, teste nem guarda, então não há mutante a declarar, e o teto M14 não se aplica porque o diff é só texto `.md`.

## Conferência
- A6 (linha 60): a vírgula entre "(tabelas do toque do BusinessMap)" e "`0040`" entrou. Resolvido.
- A4 (linha 242): o texto passou a "para tirá-la, só pela receita A, sem repetir o `down 1`".
  - Fica coerente com a linha 248 ("**Não repita o comando**").
  - Fica coerente com a linha 209 ("Não faça `down 2` nem mais sem falar com o Jarvis"): o roteiro do dono não dá mais um segundo `down 1` como saída própria, e a receita A já é decisão do Jarvis (item 4, linha 267).
  - Resolvido.
- A5 (linha 265): o efeito agora é "o CHECK volta a seis valores e recusa o `bm:ref-sync` do código da release (que grava `habilitador`)". Conferido contra `server/migrations/0041_bm_ref_tipo_card_habilitador.ts`:
  - o `down` recria `ref_tipo_card_categoria_check` com os seis valores de `ANTES`, sem `habilitador`;
  - o comentário da migração registra que, sem o CHECK de sete valores, "o `bm:ref-sync` com a categoria nova seria recusado pelo banco";
  - `server/src/modulos/businessmap/conferencia.ts:10` traz `habilitador` em `CATEGORIAS`, e o `changelog.d/feat-105-t3-habilitador.md:16` diz que o `bm:ref-sync` traz o Enabler com a categoria `habilitador`.
  - O efeito descrito está certo. Resolvido.
- Verificador de documentação: `pnpm run docs:check` rodado neste head, na worktree `/home/rodrigoisensee/MetricasDSPD-059`, com rc=0 e `docs:check: ok (1764 páginas Markdown, 70 métricas, 2 eventos).`
- Suíte: não há PR para esta branch, então a suíte inteira fica para o CI do PR. O CI está parado por cobrança; este parecer não afirma CI verde.

## Achados

## Itens do Entregar
- E7.588 (review do K-411, head 38e5579f): coberto por este parecer. O item do autor (E7.587) tem o commit `38e5579f`; não há item sem commit.

## Parecer
**Aprovado.** Os A4, A5 e A6 do review do K-410 estão resolvidos, sem achado novo.
