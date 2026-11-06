# 073 E6.1: como as releases entram no CHANGELOG (proposta, sem commit)

Base: develop em 8a789d43 (checkout 056d), `origin/main` em 8bb1210b. A `main` tem o mesmo `CHANGELOG.md` da develop (sem diff): os PRs de release #226 e #235 só trocaram o texto da `[Não publicado]`, sem abrir seção por versão.

## O que a §8 já manda (fluxo-homologacao.md:101-104)
SemVer `vX.Y.Z` na promoção para a main; `feat` vira MINOR (em `0.x`, MINOR absorve MAJOR); um commit `chore(release): vX.Y.Z` atualiza o CHANGELOG **na homolog**, antes do gate 3; a versão exposta vem do `package.json` raiz (hoje `0.2.0`, em todas as promoções). Nada disso foi aplicado desde a v0.2.0 (2026-10-29).

## Releases já na main desde a v0.2.0
| PR | Data | Pedido | Seção no CHANGELOG |
|---|---|---|---|
| #201 | 2026-11-02 | 059 (aba Apontamento) | não existe; itens nem estão no arquivo |
| #211 | 2026-11-04 | 060 a 063 | não existe; itens nem estão no arquivo |
| #229 | 2026-11-05 | 068 | não existe; itens na `[Não publicado]` |
| #237 | 2026-11-05 | 071 | não existe; itens na `[Não publicado]` |

**Número de versão (pela §8 cada promoção é um feat, logo um MINOR).** Contando #201 e #211: 068 = `0.5.0`, 071 = `0.6.0`. Contando só 068 e 071: `0.3.0` e `0.4.0`, deixando #201 e #211 sem versão. A §8 manda versionar na promoção, então recomendo a primeira; a escolha muda a numeração e as duas releases omitidas precisam de texto (fora desta entrega). Pergunta ao dono (`R-DECISAO`): contar #201 e #211? Abaixo uso a primeira opção (0.5.0 e 0.6.0).

## Seção `## [0.5.0] - 2026-11-05` (release 068, PR #229; sai da `[Não publicado]`)
- Adicionado: #212 (063, ADR 0025 e especificação); #214 (065, BLOQUEADOS e O5); #215 (067, dia atípico 10 h) e #219 (M1-a, coleta parcial); #216 (066, S8); #217 (L3-a); #220 (L2-a) e #221 (L2-b); #225 (L9-a) e #224 (L9-b).
- Corrigido: nenhum item.
- Desempenho: "Nenhuma mudança nesta versão."
- Mudanças que quebram: "Nenhuma. Sem migração de esquema nesta versão." (conferir contra `docs/qa/068-release.md` ao escrever).
- Mudanças de critério de cálculo: as linhas de #215 (067, 2026-11-04), #216 (066, 2026-11-04), 065 (#214) e L9-b (#224), com a nota "L3-a e L9-a não recalculam".
- Dependências e Forge: `zod` 4 e `ws` 8.22.0 para 8.22.1 (#218).

## Seção `## [0.6.0] - 2026-11-05` (release 071, PR #237; sai da `[Não publicado]`)
- Adicionado: #222 (L7-a, calendário por domínio e `ref:sync-calendario`, ADR 0027); #232 (L7-b); #230 (070 L1 e L2) e #233 (070 L3, E2E e C6); #234 (ADR 0028 vigente).
- Corrigido: #231 (gate de fronteiras, F9) e #233 (marca d'água SIMULADO, bug 070-001).
- Desempenho e Mudanças que quebram: as mesmas frases-padrão do 0.5.0.
- Mudanças de critério de cálculo: a linha do L7 (#222, #232).
- Dependências e Forge: Forge 0.32.0 (#223); `server/package.json` ganha só o script `ref:sync-calendario` (#222).
Conferência: os 7 PRs de `docs/reviews/071-release.md` (222, 223, 230 a 234) batem com as linhas acima.

## O que fica na `[Não publicado]`
Cabeçalho com as subseções-padrão, hoje vazias. Entram: a L9-c (ainda sem linha no arquivo) e os PRs do pedido 073, quando mesclados na develop, cada um com seu fragmento ou linha.

## Passo da release combinada (L9-c e 073; decisão do dono de 2026-11-05 20:27, "A")
1. Só depois de os PRs do 073 estarem na develop e a L9-c também.
2. Versão: MINOR pela §8 (`0.7.0` na opção recomendada, `0.5.0` na outra); BREAKING só se algum item mudar contrato, critério ou esquema (conferir na hora).
3. Na `homolog` (antes do gate 3, §8), commit `chore(release): v0.7.0`: renomeia a `[Não publicado]` para `## [0.7.0] - <data da promoção>`, recria a `[Não publicado]` vazia e sobe `version` no `package.json` raiz; o PR para a main leva o trecho novo, o parecer do QA, riscos e roteiro de rollback (§8, linha 104).
4. Antes dela, uma branch de documentação (fora desta entrega) aplica as seções 0.5.0 e 0.6.0 acima; o 0.5.0 e o 0.6.0 retroativos não ganham tag.

## O que da §8 continua pendente
- Ferramenta de geração (`git-cliff` ou `conventional-changelog`, "a decidir"; o arquivo segue escrito à mão, como o cabeçalho diz).
- Tags `vX.Y.Z-rc.N` e a final: só existem `v0.2.0` e `v0.2.0-rc.1`; quem cria a tag final é pergunta aberta 6 do usuário.
- Job `release` (§10 item 6, "workflow de release" pendente na linha 174), que publica a release com o trecho do CHANGELOG.
- Squash feature para a develop (pergunta 3) já vale na prática; `package.json` ainda em 0.2.0.
