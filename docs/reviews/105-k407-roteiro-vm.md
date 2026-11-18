---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-k407-roteiro-vm
commit: 39daacb50b2949bfc081d87abb5f6fc3c5b988b1
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: roteiro da VM, reversão da 0041 e prazos do T2 (K-407, K-409; E7.552, revalidado no E7.558)

## Escopo lido
Diff `acb62951..e8b897f6`: só `docs/devops/105-implantacao-vm.md` (11 linhas a mais, 7 a menos). Sem código, teste nem guarda: não há mutante a declarar, e o teto M14 não se aplica (texto `.md`).

## Conferências
- **`bm:ref-sync-sle` na subida (K-409): correto.** `server/package.json:37` tem o script `bm:ref-sync-sle` (`src/entradas/ref-sync-sle.ts`); `server/src/plataforma/db/vm-preparar.ts:15-23` lista 9 passos, com `bm:ref-sync-sle` em 4º, depois do `bm:ref-sync` e antes do `ac:ref-sync`, como o roteiro renumerou. O `deploy/systemd/metricas-referencias.service:17-20` roda só os quatro comandos que o texto cita. Os prazos citados batem com `docs/architecture/fontes/businessmap-sle.json`. Papel `dspd_ref` confirmado (`ref-sync-sle.ts:23`, `PG_REF_URL`). O "9 passos, não 8" do item da 0040 está certo.
- **Reversão da 0041 (K-407), no `e8b897f6`: errada.** A 0041 (`server/migrations/0041_bm_ref_tipo_card_habilitador.ts`) troca só o CHECK; o `down` recria o CHECK de seis valores, que o PostgreSQL valida contra **todas** as linhas da tabela. O `bm:ref-sync` fecha a vigência com `UPDATE ... SET vigente_ate` (`server/src/modulos/businessmap/referencia.ts:322`) e não reescreve a categoria da linha fechada (histórico nunca sobrescrito). A linha fechada continua `habilitador`, e o `down` falha do mesmo jeito (sonda S1). Corrigido no `39daacb5` (ver Revalidação).
- **Ordem entre o código antigo e o `down` (só do review):** no `e8b897f6` o texto deixava implícita uma ordem impossível (o `bm:ref-sync` do código antigo antes do `down`, que exige o código novo). Com o caminho do `bm:ref-sync` retirado no `39daacb5`, a ordem da seção 7 (banco no passo 2, código anterior no passo 3) volta a valer sem exceção.
- Ferramentas e CI: sem PR para a branch, a suíte fica para o CI do PR; não afirmo CI verde neste head e o brief não traz PQ do autor. O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance este arquivo. Parecer de implantação é do `devops-engineer`; cito, não refaço.

## Revalidação (E7.558, head 39daacb5)
- **Delta lido:** `forge-check parecer delta docs/reviews/105-k407-roteiro-vm.md` → `intervalo: e8b897f6..39daacb5`, `delta: nenhum arquivo do domínio mudou` (a ferramenta conta código e teste; o `.md` fica fora). Pelo `git diff --stat e8b897f6..39daacb5`, além dos dois pareceres, mudou só `docs/devops/105-implantacao-vm.md` (3 linhas trocadas: 113, 258 e 263), e foi isso que reli.
- **A1 resolvido** (linha 258): o texto agora diz que a linha `habilitador` fechada continua `habilitador`, que com contagem maior que 0 a volta é só pelo backup anterior à subida, proíbe o `bm:ref-sync` de "limpeza" e traz o SQL de conferência (`SELECT count(*) FROM dspd_bm.ref_tipo_card WHERE categoria = 'habilitador'`), com schema, tabela e coluna conferidos na 0041 (linhas 7, 15 e 19). O `down 1` da 0041 fica restrito à contagem 0, o que bate com a S1.
- **A2 resolvido** (linhas 113 e 263): "última migração aplicada", com a 0041 nomeada como última quando aplicada; o passo 2 da seção 7 aceita 0040 ou 0041 e remete à regra da 0041.
- **Ordem entre o código antigo e o `down`:** some com o A1, como dito acima.
- **`pnpm run docs:check`** no `39daacb5` (rodado por mim; o autor não rodou): `docs:check: ok (1764 páginas Markdown, 70 métricas, 2 eventos).`

## Achados
- A3 (recomendado) docs/devops/105-implantacao-vm.md:113 · Remete à "receita B, `down 1` só da 0040" de `105-roteiro-dono.md:208`, que chama a 0040 de última; com a 0041 aplicada, o `down 1` tira a 0041. Alinhar o roteiro do dono.

### Detalhe do A3
Fora do diff; não bloqueia porque o `down` com linha `habilitador` falha sem alterar nada.

## Sondas
- S1 · PG 16 local: CHECK de 7 valores, linha `habilitador`; UPDATE `vigente_ate` e INSERT `produto` (o `bm:ref-sync`); `down` da 0041 · espera: `down` aceito · obtido: `ERROR: check constraint "ref_tipo_card_categoria_check" ... is violated by some row` (psql saída 3)
