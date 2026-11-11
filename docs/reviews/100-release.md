---
tipo: review
contrato: 1
pedido: 100-release-bloqueios-simulador
branch: docs/100-release
commit: fc0f952ab1d746fbd0a4cd1728cf086126a66cfb
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: release 100 (develop em 77c208a9 contra a homolog)

Escopo: `git log origin/homolog..77c208a9`, 10 PRs (#315 a #324), 61 arquivos, +2021 −294; mais o commit do `CHANGELOG.md` desta branch (fc0f952a). Etapa E1.1 do pedido `100-release-bloqueios-simulador`.

## Conferências

- **CI da develop no 77c208a9:** run 43084376256 (workflow CI, `push` em `develop`, headSha 77c208a9) `completed/success`.
- **Review por PR:** os 10 PRs têm parecer de review `aprovado` na develop: #315 `092-retros-2026-11-11b`, #316 `092-k174-calendario`, #317 `092-k268-simulado`, #318 `095-runner-ubuntu-2404`, #319 `096-criterios-apontamento-env`, #320 `075-l9a-web`, #321 `097-k272-ap-tipo`, #322 `099-l1-sem-simulador`, #323 `075-l9b-contrato`, #324 `097-k272-teste-pg`. QA aprovado em `docs/qa/` para todos os de código (#316 a #323; #324 é só teste, com review); segurança em #318 e #319; devops em #318. O `reviewDecision` do GitHub é vazio em todos (o ruleset da develop pede 0 aprovações); a prova é o parecer no repositório.
- **Checks no merge (statusCheckRollup contra mergedAt):** #316 a #320 entraram com os checks da cabeça do PR concluídos (a rodada pós-atualização seguiu na develop). #321 entrou às 18:12:11 com `banco` FAILURE já concluído às 18:03:33, e a develop ficou vermelha no `banco` até o #324. #322 (18:25:58) e #323 (19:06:00) entraram com checks ainda rodando e com o `banco` herdado do #321 em falha; no #323 o `e2e` terminou FAILURE com as duas partes CANCELLED (19:16). #324 (19:08:23) entrou com `banco` verde e o `e2e` ainda rodando (verde às 19:28). A ponta 77c208a9 está verde no run 43084376256.
- **Contrato do 9b (aceite de uso único):** o enum de `notas` de O1, O2 e O3 perde `bloqueio-sem-dado-real` (schemas, `docs/contratos/metricas/O1.md` a O3 e as fotografias de resultado); `docs/contratos/snapshots/aceitas.json` volta a `{"aceitas": []}` no range (aceite fotografado e removido no mesmo PR, sem `/api/v2`), como o review do 9b aprovou (TL-A2). A web não lê o id desde o 9a (#320). Coerente.
- **ADR 0030:** vigente, revoga a 0028 por inteiro; a 0028 só teve a linha `Estado:` trocada para "substituída pela ADR 0030 em 2026-11-11", como a 0030 manda. O #322 faz só o L1 (sai o `FonteComSimulado` do `App.tsx`); o código do simulador fica parado até L2a a L3 (Q-099-3). Coerente com o review do 099-L1.
- **Migrações:** nenhuma no range (última segue 0035, já na homolog). O portão da homolog não tem migração nova para ensaiar.
- **Regras invioláveis:** nada no range mistura BusinessMap e Acelerato, avalia pessoa ou cria cálculo fora da biblioteca; o #316 muda só a forma de consulta do `ehDiaUtil`, com teste de equivalência. O agrupamento do AP-TIPO (#321) segue decisão do dono (P-097-7).
- **CHANGELOG:** notas dos 10 PRs nas seções de [Não publicado], no formato das anteriores; o #323 também em "Mudanças que quebram" (enum removido). Sem versão de critério nova no range.

## Achados

- A1 (recomendado) CHANGELOG.md:43 · O #321 foi mesclado com o check `banco` já em FAILURE (18:03:33, merge 18:12:11) e a develop ficou vermelha até o #324. Já corrigido na ponta; vale para a retrospectiva (E1.7): merge na develop só com os nove checks da cabeça concluídos e verdes.
- A2 (recomendado) CHANGELOG.md:52 · #322 e #323 entraram com checks rodando e com o `banco` herdado do #321 em falha; no #323 o `e2e` ficou FAILURE por cancelamento das partes. A ponta 77c208a9 está verde (run 43084376256), então não bloqueia a release.
- A3 (recomendado) CHANGELOG.md:30 · O brief citava os PRs 316 a 324, mas o #315 (retrospectivas 091 e 092, só docs) também está na develop e não na homolog; entrou nas notas para o CHANGELOG cobrir o range inteiro.

## Delta lido

Primeira passada; sem delta anterior.
