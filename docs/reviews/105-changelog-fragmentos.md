---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: chore/105-changelog-fragmentos
commit: 206daf0604a3f4a1a640b23bbe9d9690db73ca2d
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: K-377, CHANGELOG em fragmentos (E7.440; review E7.441; revalidação E7.444)

Branch `chore/105-changelog-fragmentos`, head `206daf06`, base `cbfbc760`. Revalidação da volta 1 (commit `206daf06`, E7.443) sobre o parecer reprovado no `b6147682`.

## Parecer
**Aprovado** no head `206daf06`.

Os dois bloqueantes foram resolvidos. O fragmento aceita as oito seções que o `CHANGELOG.md` usa, inclusive "Mudanças de critério de cálculo" (T2.6), e o `juntar` cria a seção que falta na ordem do projeto (A1). O §8 do `fluxo-homologacao.md`, a seção 9 do `praticas.md`, o `changelog.d/README.md` e a linha 3 do `CHANGELOG.md` agora dizem a mesma coisa: quem roda o `juntar` é o `tech-lead`, numa branch `chore/changelog-juntar-<data>` saída da `develop`, por PR para a `develop` antes da promoção (A2). Dos recomendados, a volta também tratou o A3 (isolamento do `GIT_DIR`) e o A4 (o nome do fragmento leva o prefixo da branch), e documentou o A5. O A6 continua valendo para o corpo do PR.

## Achados
- A1 (bloqueante) scripts/changelog.mjs:18 · resolvido no `206daf06`: `TIPOS` (linhas 22 a 30) e `ACOES_DO_DONO` (linha 31) cobrem as oito seções do `CHANGELOG.md`; a regex aceita título com espaço; o `juntar` cria a seção que falta antes da primeira de ordem posterior.
- A2 (bloqueante) docs/engineering/praticas.md:127 · resolvido no `206daf06`: quem junta, de qual branch e por qual PR estão em `praticas.md:128`, `fluxo-homologacao.md:103` e `changelog.d/README.md`; a linha 3 do `CHANGELOG.md` foi atualizada.
- A3 (recomendado) scripts/changelog.test.sh:7 · resolvido: `unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE …` depois do `set -uo pipefail`.
- A4 (recomendado) scripts/changelog.mjs:43 · resolvido: `slugDaBranch` usa o nome inteiro da branch, e o teste prova que `feature/aaa-um` e `fix/aaa-um` geram arquivos distintos.
- A5 (recomendado) docs/engineering/praticas.md:129 · documentado: o `conferir-release` ainda não é check de workflow; o `tech-lead` o roda à mão no PR do juntar e antes do PR de release, e a ligação ao check fica como proposta ao dono (`R-CONFORMIDADE`).
- A6 (recomendado) package.json:24 · 340 linhas de código e teste (`scripts/changelog.mjs` 208, `scripts/changelog.test.sh` 130, `package.json` 3), acima de 150; o corpo do PR deve trazer `teto: excedido, 340 linhas, <motivo>`.

## Verificação
- Rodei `bash scripts/changelog.test.sh` no `206daf06`: 23 de 23 `ok` ("tudo ok"), incluindo os casos novos de critério de cálculo, quebra, ação do dono, a seção nova criada antes da versão fechada e a não colisão `feature/x` × `fix/x`. `node scripts/changelog.mjs conferir`: "1 fragmento(s) válido(s)".
- Mutante: tirei `'Mudanças de critério de cálculo'` de `TIPOS` e rodei o teste: 3 falhas ("juntar só acrescenta…", "juntar traz critério de cálculo, quebra e ação do dono", "o critério entra na subseção Mudanças de critério de cálculo"). Mutante morto; o arquivo foi restaurado.
- Seções do `CHANGELOG.md` atual (`grep '^### '`): Adicionado, Alterado, Corrigido, Desempenho, Mudanças que quebram, Mudanças de critério de cálculo, Dependências e Forge e "Ações do dono na base real depois da release N". Todas estão na lista fechada.
- Nada do CHANGELOG atual se perde: o delta muda só a linha 3 (cabeçalho) do `CHANGELOG.md`; o `fundirNoChangelog` continua só inserindo, e o teste confere a soma exata das linhas `- ` e o sha256 do histórico a partir da 0.2.0.
- Fluxo de promoção: a regra é clara e não pede commit direto em `develop` nem em `homolog`; o CHANGELOG chega à `homolog` pela promoção.
- Suíte: não há PR, então a suíte inteira fica para o CI do PR. Este parecer não afirma CI verde; cita o teste do item e o mutante, que rodei.
- Regras invioláveis: o diff não toca cálculo, coleta nem dado de pessoa. A T2.6 ganhou lugar no fragmento.

## Revalidação
Delta lido com `forge-check parecer delta docs/reviews/105-changelog-fragmentos.md`, intervalo `b6147682..206daf06`, domínio código e testes: `CHANGELOG.md`, `changelog.d/105-changelog-fragmentos.md` (apagado), `changelog.d/README.md`, `changelog.d/chore-105-changelog-fragmentos.md` (novo), `docs/engineering/fluxo-homologacao.md`, `docs/engineering/praticas.md`, `scripts/changelog.mjs` e `scripts/changelog.test.sh`. Nada fora do que os achados A1 a A5 pediam.
