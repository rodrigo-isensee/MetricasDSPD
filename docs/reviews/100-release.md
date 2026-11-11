---
tipo: review
contrato: 1
pedido: 100-release-bloqueios-simulador
branch: docs/100-release-b
commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: release 100 (develop em 27ac9064 contra a homolog), volta B

Escopo: `git log origin/homolog..27ac9064`, 12 commits: os 10 PRs da primeira passada (#315 a #324), o #325 (K-271) e o #326 (CHANGELOG e pareceres da release); 66 arquivos, +2285 −302. Etapa E1.1 do pedido `100-release-bloqueios-simulador`.

## Conferências

- **Primeira passada (77c208a9, branch docs/100-release):** mantida. CI, review por PR, contrato do 9b, ADR 0030, migrações e regras invioláveis seguem como lidos lá; os achados A1 a A3 de então seguem valendo e estão repetidos abaixo.
- **Delta #325 (c7c3e092, K-271):** muda só `server/src/entradas/criterios-apontamento.ts` (+12 −7) e `server/tests/criterios-apontamento-entrada.test.ts` (+30 −3), mais os pareceres próprios. `git diff 56763414 c7c3e092` nesses dois arquivos é vazio: o código mesclado é o mesmo que o review `096-k271-criterios-robustez` aprovou (commit 56763414), com QA aprovado (`docs/qa/096-k271-criterios-robustez.md`). Não refaço o review do item.
- **Checks do #325:** cabeça 1d2267cf; mesclado às 19:36:31 com `testes` (19:41:15) e `e2e` (19:53:54) ainda rodando; todos terminaram SUCCESS. O CI da develop no c7c3e092 (run 43088790240) está `completed/success`.
- **Delta #326 (27ac9064):** só `CHANGELOG.md` e os três pareceres da release; o CHANGELOG já traz o #325 em [Não publicado] (linha 44, junto do #319). Run 43096344190 da develop nesse commit estava `queued` na leitura; o #326 não tem código.
- **Workflows e action:** o range muda `.github/actions/playwright/action.yml`, `.github/workflows/ci.yml` e `homolog.yml` (vindos do #318, com parecer de devops do item). O parecer de devops da release é do `devops-engineer`: não o refaço.
- **Migrações:** nenhuma no range; a última segue 0035, já na homolog.
- **Regras invioláveis:** o K-271 só trata erro, data e argumentos de uma entrada de linha de comando; não mistura fontes, não avalia pessoa nem calcula fora da biblioteca.

## Achados

- A1 (recomendado) CHANGELOG.md:43 · O #321 foi mesclado com o check `banco` já em FAILURE (18:03:33, merge 18:12:11) e a develop ficou vermelha até o #324. Corrigido na ponta; vale para a retrospectiva (E1.7): merge na develop só com os checks da cabeça concluídos e verdes.
- A2 (recomendado) CHANGELOG.md:52 · #322 e #323 entraram com checks rodando e com o `banco` herdado do #321 em falha; no #323 o `e2e` ficou FAILURE por cancelamento das partes. A ponta segue verde (c7c3e092, run 43088790240); não bloqueia.
- A3 (recomendado) CHANGELOG.md:30 · O #315 (retrospectivas 091 e 092, só docs) também está na develop e não na homolog; entrou nas notas para o CHANGELOG cobrir o range inteiro.
- A4 (recomendado) CHANGELOG.md:44 · O #325 foi mesclado às 19:36:31 com `testes` e `e2e` ainda rodando (verdes às 19:41 e 19:53) e depois dos pareceres da release, o que forçou esta volta. Mesma classe do A2; vale para a retrospectiva (E1.7).

## Parecer

Aprovado. A release em 27ac9064 pode seguir para a homolog quando os pareceres de QA, segurança e devops desta volta estiverem gravados; o meu não depende deles.

## Delta lido

Primeira passada em fc0f952a (develop 77c208a9, branch docs/100-release). Delta desta volta: `77c208a9..27ac9064`, commits c7c3e092 (#325, K-271, código igual ao 56763414 revisado) e 27ac9064 (#326, só CHANGELOG e pareceres).
