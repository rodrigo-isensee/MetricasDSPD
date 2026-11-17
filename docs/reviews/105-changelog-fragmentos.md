---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: chore/105-changelog-fragmentos
commit: b6147682212f3600fdf055fd12327ff1411c217d
parecer: reprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: K-377, CHANGELOG em fragmentos (E7.440; review E7.441)

Branch `chore/105-changelog-fragmentos`, head `b6147682`, base `cbfbc760`. Um commit muda seis arquivos: `scripts/changelog.mjs` (novo), `scripts/changelog.test.sh` (novo), `changelog.d/README.md`, o fragmento do próprio PR, a linha nova na seção 9 de `docs/engineering/praticas.md` e o `package.json` (script `changelog` e as duas chamadas em `test:trava`).

## Parecer
**Reprovado** no head `b6147682`.

A mecânica está correta. O `juntar` só acrescenta linhas: nenhuma entrada atual do `CHANGELOG.md` se perde, e o histórico a partir da 0.2.0 fica igual byte a byte. O teste prova isso, e eu o rodei. O `CHANGELOG.md` do head é idêntico ao da base: sha256 `7cad6bc9…de861b` nos dois.

Dois problemas impedem a aprovação.

O primeiro: o formato aceita só três tipos de subseção. Nos últimos 80 commits que tocaram o `CHANGELOG.md`, 24 trechos foram escritos em outras subseções, que agora ficam sem lugar (A1).

O segundo: o fluxo de promoção não diz em qual branch nem em qual PR entra o commit do `juntar`. Também deixa desatualizados o §8 do `fluxo-homologacao.md` e o cabeçalho do `CHANGELOG.md` (A2).

## Achados
- A1 (bloqueante) scripts/changelog.mjs:18 · só três tipos; a regex da linha 35 recusa "Mudanças de critério de cálculo" (T2.6, §8) e as outras seções do projeto, e o PR não pode mais editar o `CHANGELOG.md` (S1; detalhe abaixo).
- A2 (bloqueante) docs/engineering/praticas.md:127 · o fluxo de promoção não diz de que branch e por qual PR entra o commit do `juntar`; `fluxo-homologacao.md:103` e a linha 3 do `CHANGELOG.md` ficam desatualizados.
- A3 (recomendado) scripts/changelog.test.sh:5 · o teste herda `GIT_DIR`, `GIT_INDEX_FILE` e `GIT_WORK_TREE` e grava commits no repositório de fora (S2); falta o `unset` dos testes vizinhos.
- A4 (recomendado) scripts/changelog.mjs:24 · `feature/x` e `fix/x` geram o mesmo `changelog.d/x.md`, e o conflito entre os dois PRs volta.
- A5 (recomendado) scripts/changelog.mjs:166 · o `conferir-release` não está ligado a nenhum check (nem `homolog-aprovada`, nem workflow da `homolog`).
- A6 (recomendado) package.json:15 · 299 linhas de código e teste, acima de 150; o corpo do PR deve trazer `teto: excedido, 299 linhas, <motivo>`.

## Detalhe dos achados
- **A1.** `TIPOS` aceita só `Adicionado`, `Alterado` e `Corrigido`, e a regex `^### (\w+)\s*$` recusa como "formato inválido" qualquer título de subseção com espaço. O `CHANGELOG.md` deste projeto usa mais seções. O `fluxo-homologacao.md:103` exige **Mudanças de critério de cálculo** (T2.6, com data), Desempenho e Mudanças que quebram, e o "Não publicado" de hoje tem também "Dependências e Forge" e "Ações do dono na base real depois da release N". Nos 80 commits anteriores à base, os trechos novos do `CHANGELOG.md` caíram nestas subseções: 7 em "Mudanças de critério de cálculo", 6 em "Mudanças que quebram", 7 em "Ações do dono…", 2 em "Desempenho" e 2 em "Dependências e Forge" (contagem pelo `###` anterior a cada trecho). A regra nova diz que o PR "não edita o `CHANGELOG.md`", e o `conferir` roda em `test:trava`. Assim o próximo PR que mudar critério de cálculo não tem onde registrar a mudança. Sugestão: aceitar as seções do §8 e as que o arquivo já usa, numa lista fechada, com título de várias palavras, e manter a ordem delas no `juntar`. A outra saída é registrar como exceção, com data, que essas seções continuam escritas à mão e onde. O formato do `forge-changelog` é o ponto de partida, mas este projeto tem as seções próprias da T2.6.
- **A2.** O texto diz que "na promoção `develop` → `homolog`" o `tech-lead` roda o `juntar`, mas a `develop` e a `homolog` são protegidas, e o `CLAUDE.md` proíbe commit direto nelas. Falta dizer onde nasce o commit: de qual branch sai (por exemplo, `chore/release-X.Y.Z` saindo da `develop`), qual PR o leva à `develop` antes do PR de promoção, e quem roda o `conferir-release` e quando. Há também dois textos desatualizados. O `docs/engineering/fluxo-homologacao.md:103` ainda descreve o CHANGELOG "gerado dos Conventional Commits… `git-cliff`" e um commit `chore(release)` "na `homolog`". O cabeçalho do `CHANGELOG.md` (linha 3) diz "Escrito à mão a partir dos Conventional Commits". A seção 9 contradiz os dois. Sugestão: escrever o passo a passo no §8 do `fluxo-homologacao.md`, ajustar a linha 3 do `CHANGELOG.md` e deixar na seção 9 só a regra do PR, com o link para o §8.
- **A3.** Com `GIT_DIR` definido, como acontece num hook ou num `git rebase --exec`, o `git init` e os commits do teste vão para o repositório de fora. Os testes vizinhos se protegem com `unset GIT_DIR GIT_INDEX_FILE GIT_WORK_TREE` (`scripts/pre-push.test.sh:24`, `scripts/lint-alterados.test.sh:6`). Sugestão: a mesma linha depois do `set -uo pipefail`.
- **A4.** `slugDaBranch` tira só o prefixo, e o `novo` acrescenta ao arquivo que já existe. O caso é raro, porque o slug traz o número do pedido. Sugestão: recusar o `novo` quando o arquivo já existe na base, ou documentar a colisão no README.
- **A5.** Hoje o `conferir-release` depende de alguém lembrar de rodá-lo. Sugestão: chamá-lo no portão do PR `homolog` → `main` ou, no mínimo, citá-lo no passo a passo do A2.
- **A6.** As 299 linhas são `scripts/changelog.mjs` (183), `scripts/changelog.test.sh` (113) e `package.json` (3).

## Sondas
- S1 · `changelog.d/a.md` com `### Mudanças de critério de cálculo` / `- x` e `node scripts/changelog.mjs --raiz <tmp> conferir` · espera: aceito (a seção é exigida pelo §8 e pela T2.6) · obtido: `changelog.d/a.md: formato inválido; esperado '### <tipo>' seguido de linhas '- texto'.`, rc=1
- S2 · `GIT_DIR=<repo descartável>/.git bash scripts/changelog.test.sh` · espera: o teste usa só o repositório temporário · obtido: o repositório descartável ganhou os commits `base`, `um`, `dois`, `b`, `a` e `juntado` e as branches `feature/ccc-tres`, `velha-a` e `velha-b`; 4 falhas

## Verificação
- Rodei `bash scripts/changelog.test.sh` no `b6147682`: 19 de 19 `ok` ("tudo ok"). Rodei `node scripts/changelog.mjs conferir`: "1 fragmento(s) válido(s)".
- Nada do CHANGELOG atual se perde. O `fundirNoChangelog` (linhas 70 a 98) só insere no topo da primeira subseção do tipo e não reordena nem funde as subseções repetidas. O "Não publicado" de hoje tem dois `### Alterado` e dois `### Adicionado`, e o teste confere que o total de linhas `- ` sobe exatamente pelo número de entradas novas. O trecho a partir de `## [0.2.0]` mantém o mesmo sha256 antes e depois. O `CHANGELOG.md` não muda neste diff.
- O teste de contraste (seção 6) mostra que duas edições do topo dão conflito. É um teste de comportamento, não lê o texto da fonte.
- Suíte: não há PR, então a suíte inteira fica para o CI do PR. Este parecer não afirma CI verde e cita só o teste do item, que rodei.
- `praticas.md` não marca regras com "decidida por". Li a seção 9, que é a que o diff toca.
- Regras invioláveis: o diff não toca cálculo, coleta nem dado de pessoa. O A1 toca a T2.6 de forma indireta: tira o lugar onde o CHANGELOG registra a mudança de critério.
- Entregar contra os commits: o único item (K-377) está no commit `b6147682`.

## Revalidação
Primeira passada; não há delta. Na volta, leia só o delta contra `b6147682`.
