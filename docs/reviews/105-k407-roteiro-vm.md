---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-k407-roteiro-vm
commit: e8b897f6ba227696f1c7a9f544dbea6f82f3edff
parecer: reprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: roteiro da VM, reversão da 0041 e prazos do T2 (K-407, K-409; E7.552)

## Escopo lido
Diff `acb62951..e8b897f6`: só `docs/devops/105-implantacao-vm.md` (11 linhas a mais, 7 a menos). Sem código, teste nem guarda: não há mutante a declarar, e o teto M14 não se aplica (texto `.md`).

## Conferências
- **`bm:ref-sync-sle` na subida (K-409): correto.** `server/package.json:37` tem o script `bm:ref-sync-sle` (`src/entradas/ref-sync-sle.ts`); `server/src/plataforma/db/vm-preparar.ts:15-23` lista 9 passos, com `bm:ref-sync-sle` em 4º, depois do `bm:ref-sync` e antes do `ac:ref-sync`, como o roteiro renumerou. O `deploy/systemd/metricas-referencias.service:17-20` roda só os quatro comandos que o texto cita. Os prazos citados batem com `docs/architecture/fontes/businessmap-sle.json`. Papel `dspd_ref` confirmado (`ref-sync-sle.ts:23`, `PG_REF_URL`). O "9 passos, não 8" do item da 0040 está certo.
- **Reversão da 0041 (K-407): errada.** A 0041 (`server/migrations/0041_bm_ref_tipo_card_habilitador.ts`) troca só o CHECK; o `down` recria o CHECK de seis valores, que o PostgreSQL valida contra **todas** as linhas da tabela. O `bm:ref-sync` fecha a vigência com `UPDATE ... SET vigente_ate` (`server/src/modulos/businessmap/referencia.ts:322`) e não reescreve a categoria da linha fechada (histórico nunca sobrescrito, regra inviolável). A linha fechada continua com `habilitador`, e o `down` falha do mesmo jeito (sonda S1). O passo recomendado ainda grava em produção uma vigência nova do Enabler (com o dicionário antigo, `mapa_tipos.padrao` = `produto`, já que o Enabler não existia em `businessmap-conferencia.json` antes do `acb62951`) que não sai depois.
- **Ordem entre o código antigo e o `down` (só do review):** o texto deixa implícita uma ordem impossível de cumprir. "A categoria anterior, a do dicionário da versão a que se volta" exige rodar o `bm:ref-sync` do código **antigo**; o `down` da 0041 exige o código **novo** (o arquivo da migração só existe nele); e o rollback geral (seção 7) põe o código antigo **depois** do banco (passo 3). Com o `bm:ref-sync` do código novo, a vigência fechada abriria outra igual (`habilitador`), e nada muda. Como o A1 mostra que nenhuma das duas ordens faz o `down` passar, a correção é tirar o caminho do `down`, não ordená-lo.
- **`pnpm run docs:check`** (rodado por mim no `e8b897f6`, worktree com `node_modules`): `docs:check: ok (1762 páginas Markdown, 70 métricas, 2 eventos).`, saída 0.
- Ferramentas e CI: sem PR para a branch, a suíte fica para o CI do PR; não afirmo CI verde neste head e o brief não traz PQ do autor. O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance este arquivo. Parecer de implantação é do `devops-engineer`; cito, não refaço.

## Achados
- A1 (bloqueante) docs/devops/105-implantacao-vm.md:258 · Fechar a vigência do Enabler só grava `vigente_ate` (referencia.ts:322); a linha fechada segue `habilitador` e o `down` da 0041 falha (S1), depois de gravar vigência nova em produção. Sugestão: 0041 com Enabler só volta por restauração.
- A2 (recomendado) docs/devops/105-implantacao-vm.md:113 · Este item e o passo 2 da seção 7 (linha 263) dizem que o `down 1` vale só para a 0040, "a última"; com a 0041 aplicada, a última é a 0041. Sugestão: atualizar os dois trechos junto com o A1.

### Detalhe do A1
O `down` da 0041 só passa em base sem linha `habilitador` (`SELECT count(*) FROM dspd_bm.ref_tipo_card WHERE categoria = 'habilitador'` = 0); o roteiro deve dizer isso e tirar o passo do `bm:ref-sync`. O parágrafo da linha 258 ainda remete ao "passo 2 abaixo", que só permite o `down` quando a última é a 0040 (A2). Outra saída (manter a 0041 aplicada sob o código antigo, cujo CHECK de sete valores é superconjunto) é decisão do dono: pergunta, não inferência.

## Sondas
- S1 · PG 16 local: CHECK de 7 valores, linha `habilitador`; UPDATE `vigente_ate` e INSERT `produto` (o `bm:ref-sync`); `down` da 0041 · espera: `down` aceito · obtido: `ERROR: check constraint "ref_tipo_card_categoria_check" ... is violated by some row` (psql saída 3)
