Agente destino: forge:tech-lead
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: codigo
Branch: docs/047-dependabot   Base: develop   Base-sha: be0a8d7978714e091d0f4e776c606333d8f33fc9
Etapa: merge-integracao

## Objetivo
Fecho da etapa E4.2 do pedido 047 (cartão K-169): o PR #160 da `docs/047-dependabot` para a `develop` já está aberto, com o head 3250f59aa78b68377e36d941a059c030d71fb7f9, todos os checks verdes e `mergeStateStatus` CLEAN, mas o merge pelo número foi recusado pelo hook `parecer`, que exige o nome da branch no `gh pr merge`. Falta só o merge e a limpeza. Worktree `/home/rodrigoisensee/MetricasDSPD-047c`, branch `docs/047-dependabot`, head 3250f59aa78b68377e36d941a059c030d71fb7f9, já no origin.

## Ler
- `gh pr view docs/047-dependabot --json state,headRefOid,mergeStateStatus,statusCheckRollup`.

## Entregar
- (E4.2, E4) Merge squash do PR da `docs/047-dependabot` com `gh pr merge docs/047-dependabot --squash` (nome da branch, não o número), só com todos os checks verdes e o head igual a 3250f59aa78b68377e36d941a059c030d71fb7f9 (decisão K-169), sem `--admin` e sem `--delete-branch`. Check vermelho ou pendente, head diferente ou recusa do GitHub ou de hook: pare, não re-execute nada e relate a mensagem literal.
- (E4.2) Depois do merge, apague a worktree `/home/rodrigoisensee/MetricasDSPD-047c` (`git worktree remove`) e a branch local `docs/047-dependabot` (R-FLUXO, "Depois do merge"), rodando do repositório principal `/home/rodrigoisensee/MetricasDSPD` sem trocar a branch dele; a branch remota não (ação do dono).
- (E1, E2, E3, E5) Nada a entregar aqui: já entregues ou em outras delegações (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; já entregue (b42b2610abf65e6ded9ce8db989ac06f4726aaa2)
- "E1.2 (forge:tech-lead): code review do E1.1." · etapa de outra delegação; já entregue (mesclado no PR #158)
- "E1.3 (forge:qa-engineer): parecer de QA do E1.1." · etapa de outra delegação; já entregue (mesclado no PR #158)
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; já entregue (efbc0877c33c0d0359e8a0b309731ab23f4269ff, PR #158)
- "E1.5 (forge:qa-engineer): corrigir o campo `pedido:` do parecer `docs/qa/047-select-timeout.md` (está `047-select-timeout`; o certo é `047-pendencias-decididas-2026-10-28`), que o `forge-check pr` não acha." · etapa de outra delegação; já entregue (mesclado no PR #158)
- "E1.6 (forge:tech-lead): tirar do bloco `## Achados` do parecer `docs/reviews/047-select-timeout.md` a linha solta "Sem achado bloqueante...", fora do formato do `forge-check pr`, junto com o E1.4." · etapa de outra delegação; já entregue (mesclado no PR #158)
- "E1.7 (forge:qa-engineer): tirar do bloco `## Achados` do parecer `docs/qa/047-select-timeout.md` a linha solta "Sem achado bloqueante.", fora do formato do `forge-check pr`." · etapa de outra delegação; já entregue (mesclado no PR #158)
- "E2.1 (forge:devops-engineer): conferência do portão (E2), parecer de devops em `docs/devops/047-portao-e2e.md`; mudança no workflow só se faltar a E2E completa." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.2 (forge:devops-engineer): divisão da E2E do portão da homolog em 2 partes (E5), na mesma branch `docs/047-portao-e2e`, com o parecer atualizado." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.3 (forge:tech-lead): code review do E2.1 e do E2.2." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.4 (forge:qa-engineer): parecer de QA do E2.1 e do E2.2." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.5 (forge:tech-lead): PR da `docs/047-portao-e2e` para a develop e merge." · etapa de outra delegação; já entregue (be0a8d7978714e091d0f4e776c606333d8f33fc9, PR #159)
- "E2.6 (forge:security-engineer): parecer de segurança do E2.2 (CI/CD, R-SEGURANCA), em paralelo ao E2.3." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.7 (forge:tech-lead): encurtar para até 300 caracteres o achado A1 do review `docs/reviews/047-portao-e2e.md` (aviso do conferente no brief qa-4, R-REVIEW), antes do E2.5." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.8 (forge:devops-engineer): regravar pela ferramenta Write o parecer `docs/devops/047-portao-e2e.md` (o `forge-check pr` acusa autoria sem registro do papel devops), alinhando o resumo e as linhas ao workflow novo e o `commit:` (A1 e A2 do review e A2 do QA, recomendados), antes do E2.7." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.9 (forge:tech-lead): revalidar o review `docs/reviews/047-select-timeout.md` (E1, já mesclado no #158) sobre o head da `docs/047-portao-e2e` depois do merge da develop: o `forge-check pr` o acusa desatualizado porque o `homolog.yml` mudou; atualizar o `commit:` e registrar a revalidação, antes do E2.10." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.10 (forge:qa-engineer): revalidar o parecer `docs/qa/047-select-timeout.md` do mesmo jeito, depois do E2.9 e antes do E2.5." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.11 (forge:devops-engineer): revalidar o parecer `docs/devops/047-portao-e2e.md` sobre o head da `docs/047-portao-e2e`: o hook `parecer` (sem `--base`) o acusa desatualizado porque o `server/tests/plataforma2.test.ts` entrou pela develop (#158); atualizar o `commit:` e registrar a revalidação, antes do E2.12." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.12 (forge:security-engineer): revalidar o parecer `docs/security/047-portao-e2e.md` do mesmo jeito, depois do E2.11 e antes do E2.5." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.13 (forge:tech-lead): trazer a develop com o #157 (d9a7ea0074ac55ab6dc326d7a2ed3087502721bb) para a `docs/047-portao-e2e` por merge, push, rodar o `forge-check pr` sem `--base` e revalidar os pareceres de review que ele acusar (`docs/reviews/047-portao-e2e.md`, `docs/reviews/047-select-timeout.md`), antes do E2.14." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.14 (forge:qa-engineer): revalidar os pareceres de QA do 047 que o `forge-check pr` acusar depois do E2.13, antes do E2.15." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.15 (forge:devops-engineer): revalidar o parecer `docs/devops/047-portao-e2e.md` do mesmo jeito, se acusado, antes do E2.16." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E2.16 (forge:security-engineer): revalidar o parecer `docs/security/047-portao-e2e.md` do mesmo jeito, se acusado, antes do E2.5." · etapa de outra delegação; já entregue (mesclado no PR #159)
- "E3.1 (forge:tech-lead): PR de proposta no Forge (E3), pela skill `contribuir-com-o-forge`, clone em `~/.forge-contrib/MetricasDSPD`." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; já entregue (6983dd8c167f7c24e4761b2dbbbf67e069298561, review revalidado e PR #160 aberto)
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Mudar qualquer arquivo, reabrir o review ou criar outro PR; alterar o `praticas.md` (inclusive a tabela das linhas 9 a 19, vermelha no prettier já na base, cartão técnico à parte), o parecer `docs/reviews/047-dependabot.md` e o código; o QA (isento); o quadro e o arquivo do pedido; as outras worktrees; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 4 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido 026): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 17:12, Histórico deste pedido): o QA do E4.1 fica isento (R-QA, diff só de .md); a bateria do PR na CI segue obrigatória.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 17:10, Histórico deste pedido): a frase "A revisão semanal do CI (10.1) só confere os pendentes." fica no `praticas.md`.
- DECISÃO TÉCNICA do Jarvis (2026-10-28 18:03, Histórico deste pedido): o E4.2 foi entregue em parte (PR #160 aberto, checks verdes); esta delegação faz só o merge por nome da branch e a limpeza.
- Não rode a suíte, o `pronto` nem testes nesta delegação (o QA da worktree 048a e o front da 048b usam a trava de suíte única); a bateria roda na CI do PR.
- NÃO tocar: código, workflows, pareceres, a branch do repositório principal, a `main`, o `.env`, as outras worktrees.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas. Parecer se edita só pela ferramenta Edit ou Write.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. A `main` é do usuário.

## Pronto quando
- PQ-1 (merge): `gh pr view docs/047-dependabot --json state` mostra `MERGED`, e o sha do `mergeCommit` (`gh pr view docs/047-dependabot --json mergeCommit`) é ancestral de `origin/develop` depois de `git fetch origin` (`git merge-base --is-ancestor`, rc=0)
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD worktree list --porcelain` filtrado por `grep -c MetricasDSPD-047c` · espera: igual '0'
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD branch --list docs/047-dependabot` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o resultado dos checks no momento do merge, o sha do merge e a limpeza; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
