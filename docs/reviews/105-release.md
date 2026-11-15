---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: docs/105-release
commit: 4d89240da40fb458d2c4b607c52b887219e15229
parecer: reprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: release 105 (develop em 4d89240d contra a main)

Escopo: `git log --first-parent origin/main..origin/develop`, 52 PRs (#418 a #469, todos) sobre a `main` em b01a9d6a (release 104); mais a branch `docs/105-release` (CHANGELOG da 105 com "Ações do dono" e `docs/devops/105-roteiro-dono.md`). Etapa E5.14. O #469 (ac:reprojetar-fluxo, squash 4d89240d) entrou na `develop` durante a espera; a develop foi mesclada na branch de docs com conflito só no CHANGELOG (a linha prevista do #469 e a linha que o próprio PR trouxe): mantive o texto da branch, troquei "linha prevista" por "#469, E6.16" e juntei o aviso do "última carga". Cada PR teve review e QA próprios; este parecer lê a release por amostragem dos riscos e não os refaz.

## Conferências

- **Árvores (prova do assistente de 15/11):** `git rev-parse origin/main^{tree} origin/homolog^{tree}` dá `ae5fbd15...` nas duas (main e homolog idênticas). `git merge-tree --write-tree origin/main origin/develop` e `git merge-tree --write-tree origin/homolog origin/develop` dão a mesma árvore, `8c99c2ac...`: mesclar a develop na homolog e depois na main equivale a mesclar direto na main.
- **PRs no CHANGELOG:** os 52 PRs do range conferidos por script contra o texto (K-xxx, lote, D1a, D1b, D2, número do PR e palavra-chave). Os que não citam número nem K aparecem por assunto (O18, O24, registro posterior, Forge 0.47.0). Sem PR omitido; os de ferramenta, teste e documentos (K-333, K-309, K-325, K-236/K-243, K-330, K-089) entram em Adicionado ou Corrigido pelo assunto.
- **Migração:** uma nova, a 0038 (`server/migrations/0038_ac_dim_chamado_fluxo.ts`): `ADD COLUMN IF NOT EXISTS fluxo text NULL` em `dim_chamado`, com `down` `DROP COLUMN IF EXISTS` simétrico; `checksums.json` atualizado. Coluna nula, sem preenchimento: não reescreve histórico. Só `dim_chamado` (derivada); `dim_chamado_versao` e o staging não mudam.
- **`ac:reprojetar-fluxo` (#469):** `server/src/modulos/acelerato/reprojecao-fluxo.ts`: uma transação, lotes, `UPDATE` só onde `fluxo IS NULL` e só com valor não nulo (nunca troca valor existente), reaplica `fluxoDoChamado` sem regra nova, não chama o Acelerato, imprime só contagens; do staging só saem descrições de workflow, sem pessoa nem texto livre. Não depende de `ac:ref-sync` (a lista `fluxo_proc` não é lida aqui).
- **Ações do dono, ordem:** CHANGELOG e roteiro batem: `db:migrate` (0038), `ac:reprojetar-fluxo` com a coleta parada, `ac:ref-sync` em dia diferente, `bm:ref-sync`, `bm:coleta carga-inicial --projetar`, `bm:criterios-classe-servico <data do passo 5>`, coletas. A reprojeção vem antes das cargas e depois da migração, como pede o código (a coluna precisa existir). Em ordem certa.
- **Critério de cálculo (T2.6):** a seção traz `105:classe-por-etiqueta` (O6, O24, T1, T2, T4, T6), `criterio-2026-11-14-o12-prazo-do-card` e as versões do 099, com data e o comando que grava; O15 e O18 sem versão própria declarada no texto e sem recálculo de histórico. Sem alerta.
- **Regras invioláveis no conjunto:** BusinessMap e Acelerato seguem separados (fluxo, setor e classe só no BusinessMap; fluxo do chamado só no Acelerato); cálculo pela biblioteca; histórico preservado (0038 aditiva; `ac:reprojetar-fluxo` preenche só nulo; `bm:coleta carga-inicial --projetar` relê sem apagar); abaixo de 20 não publica (O15 passa a `contagem` nula abaixo de 20); sem ranking individual nem comparação entre times (filtro Setor e Apontamento consolidam). Sem achado.
- **CI:** #469 com todos os checks verdes (`gh pr checks 469`: código 0) antes do merge; `gh run list --branch develop`: run 43764517252 sobre 4d89240d ainda `in_progress` quando escrevi (o anterior, 4d19dbc6, `success`). A release só segue com esse run `success`.

## Achados
- A1 (bloqueante) CHANGELOG.md:147 · "Mudanças que quebram" sem entrada da 105, e o contrato quebrou (Intangível sai do enum, campos anulados no O12 e no O15, O8/S5/S6 reescritos); detalhe em "Quebras de contrato sem entrada".
- A2 (recomendado) CHANGELOG.md:226 · O Intangível fora do enum só consta em "Alterado", fora da seção de quebras (ver A1).
- A3 (recomendado) docs/devops/105-roteiro-dono.md:65 · O roteiro ainda chama o #469 de "branch feature/105-ac-reprojetar-fluxo ... precisa estar mesclado"; já está na develop.
- A4 (recomendado) CHANGELOG.md:225 · O "### Alterado" fica depois das "Ações do dono", fora da ordem das demais seções.

## Quebras de contrato sem entrada (A1)

Lido em `git diff origin/main...origin/develop -- packages/contratos/src`: `CLASSES_SERVICO` perde `Intangível` e ganha `Prioritário` sem convivência (só consta em "### Alterado", CHANGELOG.md:226, fora da seção); O12 `vencidosCausaInterna` passa a `nullable` e `porResponsabilidade` também, com `motivoResponsabilidade`; O15 `contagem` passa a `nullable` (o item da linha 12 diz "sem mudar contrato"); `resultadoO8`, `resultadoS5` e `resultadoS6` reescritos em `schemas.ts`; saem `MOTIVO_AGUARDANDO_CAMPO`, `MOTIVO_AGUARDANDO_CAMPO_CHAMADO`, `MOTIVO_AGUARDANDO_PRAZOS_SLA` e `MOTIVO_S9_MOTIVO_PENDENCIA` do pacote, e a migração 0038 não consta. A 104 listou o `porCausa` anulável do O17 (K-275) na mesma seção, com o consumidor único; o mesmo critério pede as entradas da 105 (mudança que quebra contrato é item do brief). Correção: acrescentar as entradas com PR, consumidor (só a web deste repositório) e a migração 0038 (aditiva, `down` simétrico), e tirar "sem mudar contrato" do O15 se o campo anulável for desse PR.
## Parecer

Reprovado sobre a develop em 4d89240d por A1: o CHANGELOG é fiel ao que entra (52 PRs cobertos, ações do dono em ordem certa, critérios com data e comando, migração 0038 com `down`, regras invioláveis preservadas), mas deixa de declarar na seção própria as mudanças que quebram contrato da 105. A1 se corrige só no texto do CHANGELOG, sem código; A2 a A4 vão junto. Volta ao autor da E5.12; na revalidação leio só o delta do CHANGELOG e do roteiro, e o run do CI da develop fica a conferir.
