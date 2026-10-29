Agente destino: forge:tech-lead
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: pr

## Objetivo
Etapa E3.5 do pedido 047 (E3, cartão K-164): abrir o PR de proposta da branch `melhoria/MetricasDSPD-k164-mesma-base` (commit a779854509371951e47e27ec3bcc487f57e46034, já no origin do Forge) para a `develop` do Forge (`rodrigo-isensee/Forge`), depois de review (E3.3), segurança (E3.2) e QA (E3.4) aprovados sem bloqueante. Só propor (R-CONTRIB): abre o PR e para. Worktree `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD/docs/analises/047-k164-corpo-do-pr.md` (corpo do PR já escrito).
- Seção `## Achados` dos três pareceres aprovados: `/home/rodrigoisensee/MetricasDSPD/docs/reviews/047-k164-mesma-base.md`, `/home/rodrigoisensee/MetricasDSPD/docs/security/047-k164-mesma-base.md` e `/home/rodrigoisensee/MetricasDSPD/docs/qa/047-k164-mesma-base.md`.

## Entregar
- (E3.5, E3) Montar o corpo do PR em `/tmp/pr-047-k164.md` a partir de `/home/rodrigoisensee/MetricasDSPD/docs/analises/047-k164-corpo-do-pr.md`, acrescentando uma seção `## Pareceres` com o veredito dos três pareceres (review, segurança e QA, todos aprovados) e os recomendados de cada um com arquivo:linha, como sugestão ao mantenedor, sem caminho nem nome do projeto de origem (R-NEUTRO); no checklist, marcar só o que foi rodado de fato (tests.test_forge 437 OK e tests.test_hooks 52 OK, relatados no parecer de QA) e dizer que a suíte inteira e o `validar-plugin` não rodaram nesta sessão (o pre-push dela recusa sessão do Claude; o push foi feito pelo dono fora dela). O corpo termina com a linha `🤖 Generated with [Claude Code](https://claude.com/claude-code)`, uma linha em branco e `https://claude.ai/code/session_01VGwu56Tfg29UZnqDRmsU9H`.
- (E3.5) `gh pr create --repo rodrigo-isensee/Forge --base develop --head melhoria/MetricasDSPD-k164-mesma-base --title <título curto em português, sem cartão nem nome do projeto de origem (R-NEUTRO)> --body-file /tmp/pr-047-k164.md`, rodado da worktree; sem rótulo, sem revisor, sem merge, sem mexer em PR alheio. Se um hook ou a ferramenta recusar, pare e relate a mensagem inteira (bloqueio não se contorna, R-CONFORMIDADE).
- (E1, E2, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; já entregue
- "E1.2 (forge:tech-lead): code review do E1.1." · etapa de outra delegação; já entregue
- "E1.3 (forge:qa-engineer): parecer de QA do E1.1." · etapa de outra delegação; já entregue
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; já entregue
- "E1.5 (forge:qa-engineer): corrigir o campo `pedido:` do parecer `docs/qa/047-select-timeout.md` (está `047-select-timeout`; o certo é `047-pendencias-decididas-2026-10-28`), que o `forge-check pr` não acha." · etapa de outra delegação; já entregue
- "E1.6 (forge:tech-lead): tirar do bloco `## Achados` do parecer `docs/reviews/047-select-timeout.md` a linha solta "Sem achado bloqueante...", fora do formato do `forge-check pr`, junto com o E1.4." · etapa de outra delegação; já entregue
- "E1.7 (forge:qa-engineer): tirar do bloco `## Achados` do parecer `docs/qa/047-select-timeout.md` a linha solta "Sem achado bloqueante.", fora do formato do `forge-check pr`." · etapa de outra delegação; já entregue
- "E2.1 (forge:devops-engineer): conferência do portão (E2), parecer de devops em `docs/devops/047-portao-e2e.md`; mudança no workflow só se faltar a E2E completa." · etapa de outra delegação; já entregue
- "E2.2 (forge:devops-engineer): divisão da E2E do portão da homolog em 2 partes (E5), na mesma branch `docs/047-portao-e2e`, com o parecer atualizado." · etapa de outra delegação; já entregue
- "E2.3 (forge:tech-lead): code review do E2.1 e do E2.2." · etapa de outra delegação; já entregue
- "E2.4 (forge:qa-engineer): parecer de QA do E2.1 e do E2.2." · etapa de outra delegação; já entregue
- "E2.5 (forge:tech-lead): PR da `docs/047-portao-e2e` para a develop e merge." · etapa de outra delegação; já entregue
- "E2.6 (forge:security-engineer): parecer de segurança do E2.2 (CI/CD, R-SEGURANCA), em paralelo ao E2.3." · etapa de outra delegação; já entregue
- "E2.7 (forge:tech-lead): encurtar para até 300 caracteres o achado A1 do review `docs/reviews/047-portao-e2e.md` (aviso do conferente no brief qa-4, R-REVIEW), antes do E2.5." · etapa de outra delegação; já entregue
- "E2.8 (forge:devops-engineer): regravar pela ferramenta Write o parecer `docs/devops/047-portao-e2e.md` (o `forge-check pr` acusa autoria sem registro do papel devops), alinhando o resumo e as linhas ao workflow novo e o `commit:` (A1 e A2 do review e A2 do QA, recomendados), antes do E2.7." · etapa de outra delegação; já entregue
- "E2.9 (forge:tech-lead): revalidar o review `docs/reviews/047-select-timeout.md` (E1, já mesclado no #158) sobre o head da `docs/047-portao-e2e` depois do merge da develop: o `forge-check pr` o acusa desatualizado porque o `homolog.yml` mudou; atualizar o `commit:` e registrar a revalidação, antes do E2.10." · etapa de outra delegação; já entregue
- "E2.10 (forge:qa-engineer): revalidar o parecer `docs/qa/047-select-timeout.md` do mesmo jeito, depois do E2.9 e antes do E2.5." · etapa de outra delegação; já entregue
- "E2.11 (forge:devops-engineer): revalidar o parecer `docs/devops/047-portao-e2e.md` sobre o head da `docs/047-portao-e2e`: o hook `parecer` (sem `--base`) o acusa desatualizado porque o `server/tests/plataforma2.test.ts` entrou pela develop (#158); atualizar o `commit:` e registrar a revalidação, antes do E2.12." · etapa de outra delegação; já entregue
- "E2.12 (forge:security-engineer): revalidar o parecer `docs/security/047-portao-e2e.md` do mesmo jeito, depois do E2.11 e antes do E2.5." · etapa de outra delegação; já entregue
- "E2.13 (forge:tech-lead): trazer a develop com o #157 (d9a7ea0074ac55ab6dc326d7a2ed3087502721bb) para a `docs/047-portao-e2e` por merge, push, rodar o `forge-check pr` sem `--base` e revalidar os pareceres de review que ele acusar (`docs/reviews/047-portao-e2e.md`, `docs/reviews/047-select-timeout.md`), antes do E2.14." · etapa de outra delegação; já entregue
- "E2.14 (forge:qa-engineer): revalidar os pareceres de QA do 047 que o `forge-check pr` acusar depois do E2.13, antes do E2.15." · etapa de outra delegação; já entregue
- "E2.15 (forge:devops-engineer): revalidar o parecer `docs/devops/047-portao-e2e.md` do mesmo jeito, se acusado, antes do E2.16." · etapa de outra delegação; já entregue
- "E2.16 (forge:security-engineer): revalidar o parecer `docs/security/047-portao-e2e.md` do mesmo jeito, se acusado, antes do E2.5." · etapa de outra delegação; já entregue
- "E3.1 (forge:tech-lead): implementação da proposta do E3 no Forge, pela skill `contribuir-com-o-forge`, na branch `melhoria/MetricasDSPD-k164-mesma-base` de uma worktree própria do clone `~/.forge-contrib/MetricasDSPD`, com commit e push, sem PR (o PR é o E3.5)." · etapa de outra delegação; já entregue (a779854, push do dono)
- "E3.3 (forge:tech-lead, outra instância): code review da branch do E3.1 (R-REVIEW), antes do E3.2 e do E3.4." · etapa de outra delegação; já entregue (docs/reviews/047-k164-mesma-base.md, aprovado)
- "E3.2 (forge:security-engineer): parecer de segurança da branch do E3.1 no clone de contribuição (hooks e `forge-check` são controles do Forge, R-SEGURANCA), antes do E3.5." · etapa de outra delegação; já entregue (docs/security/047-k164-mesma-base.md, aprovado, A1 e A2 recomendados)
- "E3.4 (forge:qa-engineer): parecer de QA da branch do E3.1 (testes do Forge), antes do E3.5." · etapa de outra delegação; já entregue (docs/qa/047-k164-mesma-base.md, aprovado, A1 a A3 recomendados)
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; já entregue
- "E4.2 (forge:tech-lead): revalidar o review `docs/reviews/047-select-timeout.md` (E1, já mesclado no #158) sobre o head da `docs/047-dependabot` (o `forge-check pr` o acusa desatualizado porque o `praticas.md` mudou) e, em seguida, o PR da `docs/047-dependabot` para a develop e o merge (fecho do E4.1)." · etapa de outra delegação; já entregue
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Commit, push ou qualquer mudança de código na branch; corrigir os recomendados; merge, rótulo ou revisor no PR; mexer em PR alheio; rodar a suíte inteira do Forge; editar o cache do plugin ou `~/Forge`; o quadro e o arquivo do pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 5 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- R-CONTRIB: sessão de outro projeto só propõe; nada se integra ao Forge daqui.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/Forge --head melhoria/MetricasDSPD-k164-mesma-base --state open --json number --jq length` · espera: igual '1'
- PQ-2 (cmd): `gh pr view --repo rodrigo-isensee/Forge melhoria/MetricasDSPD-k164-mesma-base --json baseRefName --jq .baseRefName` · espera: igual 'develop'
- PQ-3 (cmd): `gh pr view --repo rodrigo-isensee/Forge melhoria/MetricasDSPD-k164-mesma-base --json headRefOid --jq .headRefOid` · espera: igual 'a779854509371951e47e27ec3bcc487f57e46034'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: número e URL do PR, o título e o que o corpo diz dos pareceres e do checklist; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
