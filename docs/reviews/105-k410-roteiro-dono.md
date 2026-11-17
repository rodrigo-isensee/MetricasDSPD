---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-k410-roteiro-dono
commit: 907470582198670e6b51f28f1f0248726f4fbdfe
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: roteiro do dono, receita B alinhada à volta da 0041 (K-410; E7.566, revalidação E7.571)

## Escopo lido
Primeira rodada: diff `acb62951..ed794f06`, só `docs/devops/105-roteiro-dono.md`. Revalidação: delta `ed794f06..90747058` no mesmo arquivo (os outros dois arquivos do delta são os pareceres do QA e deste review). Não há código, teste nem guarda, então não há mutante a declarar, e o teto M14 não se aplica porque o diff é só texto `.md`.

Conferido contra:
- `server/migrations/0041_bm_ref_tipo_card_habilitador.ts`: o `down` recria o CHECK de seis valores com o nome `ref_tipo_card_categoria_check` e falha com linha `habilitador`.
- `server/migrations/0018_bm_referencia_workflow_tipo_times.ts` e o `ENUM` de `server/src/plataforma/db/ddl.ts`: o CHECK original é de coluna, sem nome explícito, e o PostgreSQL o nomeia `ref_tipo_card_categoria_check`, o mesmo nome que a 0041 derruba e recria.
- a seção "Reversão da migração 0041" de `docs/devops/105-implantacao-vm.md`, aprovada no K-407 (`origin/docs/105-k407-roteiro-vm`, head 39daacb5, ainda fora da `develop`).

## Revalidação (head 90747058)
Delta lido: `git diff ed794f06..90747058 -- docs/devops/105-roteiro-dono.md`.
- A1 (bloqueante) resolvido.
  - Linhas 248 a 265: a receita B tem uma conferência por migração.
  - Depois do `down 1` da 0040, espera `0`, `2` e `0039_bm_toque_primeiro`.
  - Depois do da 0041, espera `1`, `2`, `0040_ac_dim_chamado_escala_p` e `0`.
  - O "não repita" diz qual sai no segundo `down 1` em cada ramo.
  - O SQL do `pg_constraint` usa o nome real do CHECK, conferido acima.
  - O efeito no T3 está declarado.
- A2 (recomendado) resolvido.
  - Linhas 31, 59 a 61, 198, 207, 209, 214, 218 e 230: a 0041 entra na contagem ("quatro"), na tabela e na conferência da receita A.
  - A linha 209 trata a 0041 aplicada como o caso comum.
  - A conferência da linha 226 diz "as quatro saíram (deve imprimir `0`, `0` e `0`)": são três consultas, e a terceira, com os quatro nomes, imprime `0`. Está certo.
- A3 (recomendado) resolvido. Linha 275: "`down 1` só para a última migração aplicada (receita B)".
- Verificador de documentação: `pnpm run docs:check` rodado neste head, nesta worktree, com rc=0 e `docs:check: ok (1764 páginas Markdown, 70 métricas, 2 eventos).`
- Suíte: não há PR para esta branch, então a suíte inteira fica para o CI do PR. Este parecer não afirma CI verde.

## Achados
- A4 (recomendado) docs/devops/105-roteiro-dono.md:242 · "ou por outro `down 1` depois de conferir a volta da 0041" contradiz o "Não repita o comando" (linha 248) e o "Não faça `down 2` nem mais sem falar com o Jarvis" (linha 209); sugestão: tirar a 0040 depois da 0041 só falando com o Jarvis.
- A5 (recomendado) docs/devops/105-roteiro-dono.md:265 · "o Enabler sai da categoria `habilitador`": no ramo da contagem 0 nenhuma linha era `habilitador`; o efeito real é o `bm:ref-sync` do código da release ser recusado pelo CHECK até reaplicar ou reverter.
- A6 (recomendado) docs/devops/105-roteiro-dono.md:60 · falta vírgula entre "(tabelas do toque do BusinessMap)" e "`0040`".

## Itens do Entregar
- E7.566 (review do K-410): coberto pela primeira rodada deste parecer.
- E7.571 (revalidação do K-410, head 90747058): coberto pela seção Revalidação. O delta tem um commit de autor (`90747058`), e não há item sem commit.

## Parecer
**Aprovado.** Os A1, A2 e A3 da primeira rodada estão resolvidos. O A4, o A5 e o A6 são recomendados e não bloqueiam: o roteiro, seguido ao pé da letra, não leva a uma volta errada, porque as duas travas e a conferência da última migração aplicada continuam antes de cada `down 1`.
