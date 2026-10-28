Agente destino: forge:tech-lead
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: review
Branch: docs/047-dependabot   Base: develop   Base-sha: be0a8d7978714e091d0f4e776c606333d8f33fc9
Etapa: review

## Objetivo
Etapa E4.1 do pedido 047 (cartão K-169), só a parte de code review: a política do Dependabot no `docs/engineering/praticas.md`, já escrita no commit 6983dd8c167f7c24e4761b2dbbbf67e069298561 da branch `docs/047-dependabot` (conferência de entrega cumprida). Review antes do QA (R-REVIEW). Worktree `/home/rodrigoisensee/MetricasDSPD-047c`, head 6983dd8c167f7c24e4761b2dbbbf67e069298561, já no origin.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-047c diff be0a8d7978714e091d0f4e776c606333d8f33fc9 6983dd8c167f7c24e4761b2dbbbf67e069298561` (2 linhas a mais e 1 a menos, só `docs/engineering/praticas.md`).
- `docs/engineering/praticas.md` na worktree, só a seção 9 (perto da linha 116) e o item "Versões das actions" da 10.1 (perto da linha 142).
- `docs/pedidos/047-pendencias-decididas-2026-10-28.md`, só a linha DECISÃO DO DONO do K-169.

## Entregar
- (E4.1, E4) Code review do commit 6983dd8c167f7c24e4761b2dbbbf67e069298561 (R-REVIEW): o texto da política confere com a DECISÃO DO DONO do K-169 (um por vez, só com todos os checks verdes, pelo tech-lead, check vermelho para e avisa o Jarvis); diga no parecer se a frase a mais "A revisão semanal do CI (10.1) só confere os pendentes." contradiz ou estende a decisão (o conferente a apontou como fora da decisão) e, se estende, registre como achado com a sua classificação (bloqueante ou recomendado) e o motivo; coerência com a 10.1. Parecer em `docs/reviews/047-dependabot.md`, no formato que o `forge-check pr` lê (frontmatter com `pedido: 047-pendencias-decididas-2026-10-28`, `commit: 6983dd8c167f7c24e4761b2dbbbf67e069298561` e veredito; achados no bloco `## Achados`, com arquivo:linha e até 300 caracteres cada), escrito pela ferramenta Write.
- (E4.1) Commit só do parecer, no padrão de commits do `praticas.md`, com `Cartão: K-169` e `git add docs/reviews/047-dependabot.md`; push com `git push origin docs/047-dependabot`, sem `--force` e sem PR.
- (E1, E2, E3, E5) Nada a entregar aqui: já entregues ou em outras delegações (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; continua no pedido
- "E1.2 (forge:tech-lead): code review do E1.1." · etapa de outra delegação; continua no pedido
- "E1.3 (forge:qa-engineer): parecer de QA do E1.1." · etapa de outra delegação; continua no pedido
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.5 (forge:qa-engineer): corrigir o campo `pedido:` do parecer `docs/qa/047-select-timeout.md` (está `047-select-timeout`; o certo é `047-pendencias-decididas-2026-10-28`), que o `forge-check pr` não acha." · etapa de outra delegação; continua no pedido
- "E1.6 (forge:tech-lead): tirar do bloco `## Achados` do parecer `docs/reviews/047-select-timeout.md` a linha solta "Sem achado bloqueante...", fora do formato do `forge-check pr`, junto com o E1.4." · etapa de outra delegação; continua no pedido
- "E1.7 (forge:qa-engineer): tirar do bloco `## Achados` do parecer `docs/qa/047-select-timeout.md` a linha solta "Sem achado bloqueante.", fora do formato do `forge-check pr`." · etapa de outra delegação; continua no pedido
- "E2.1 (forge:devops-engineer): conferência do portão (E2), parecer de devops em `docs/devops/047-portao-e2e.md`; mudança no workflow só se faltar a E2E completa." · etapa de outra delegação; continua no pedido
- "E2.2 (forge:devops-engineer): divisão da E2E do portão da homolog em 2 partes (E5), na mesma branch `docs/047-portao-e2e`, com o parecer atualizado." · etapa de outra delegação; continua no pedido
- "E2.3 (forge:tech-lead): code review do E2.1 e do E2.2." · etapa de outra delegação; continua no pedido
- "E2.4 (forge:qa-engineer): parecer de QA do E2.1 e do E2.2." · etapa de outra delegação; continua no pedido
- "E2.5 (forge:tech-lead): PR da `docs/047-portao-e2e` para a develop e merge." · etapa de outra delegação; continua no pedido
- "E2.6 (forge:security-engineer): parecer de segurança do E2.2 (CI/CD, R-SEGURANCA), em paralelo ao E2.3." · etapa de outra delegação; continua no pedido
- "E2.7 (forge:tech-lead): encurtar para até 300 caracteres o achado A1 do review `docs/reviews/047-portao-e2e.md` (aviso do conferente no brief qa-4, R-REVIEW), antes do E2.5." · etapa de outra delegação; continua no pedido
- "E2.8 (forge:devops-engineer): regravar pela ferramenta Write o parecer `docs/devops/047-portao-e2e.md` (o `forge-check pr` acusa autoria sem registro do papel devops), alinhando o resumo e as linhas ao workflow novo e o `commit:` (A1 e A2 do review e A2 do QA, recomendados), antes do E2.7." · etapa de outra delegação; continua no pedido
- "E2.9 (forge:tech-lead): revalidar o review `docs/reviews/047-select-timeout.md` (E1, já mesclado no #158) sobre o head da `docs/047-portao-e2e` depois do merge da develop: o `forge-check pr` o acusa desatualizado porque o `homolog.yml` mudou; atualizar o `commit:` e registrar a revalidação, antes do E2.10." · etapa de outra delegação; continua no pedido
- "E2.10 (forge:qa-engineer): revalidar o parecer `docs/qa/047-select-timeout.md` do mesmo jeito, depois do E2.9 e antes do E2.5." · etapa de outra delegação; continua no pedido
- "E2.11 (forge:devops-engineer): revalidar o parecer `docs/devops/047-portao-e2e.md` sobre o head da `docs/047-portao-e2e`: o hook `parecer` (sem `--base`) o acusa desatualizado porque o `server/tests/plataforma2.test.ts` entrou pela develop (#158); atualizar o `commit:` e registrar a revalidação, antes do E2.12." · etapa de outra delegação; continua no pedido
- "E2.12 (forge:security-engineer): revalidar o parecer `docs/security/047-portao-e2e.md` do mesmo jeito, depois do E2.11 e antes do E2.5." · etapa de outra delegação; continua no pedido
- "E2.13 (forge:tech-lead): trazer a develop com o #157 (d9a7ea0074ac55ab6dc326d7a2ed3087502721bb) para a `docs/047-portao-e2e` por merge, push, rodar o `forge-check pr` sem `--base` e revalidar os pareceres de review que ele acusar (`docs/reviews/047-portao-e2e.md`, `docs/reviews/047-select-timeout.md`), antes do E2.14." · etapa de outra delegação; continua no pedido
- "E2.14 (forge:qa-engineer): revalidar os pareceres de QA do 047 que o `forge-check pr` acusar depois do E2.13, antes do E2.15." · etapa de outra delegação; continua no pedido
- "E2.15 (forge:devops-engineer): revalidar o parecer `docs/devops/047-portao-e2e.md` do mesmo jeito, se acusado, antes do E2.16." · etapa de outra delegação; continua no pedido
- "E2.16 (forge:security-engineer): revalidar o parecer `docs/security/047-portao-e2e.md` do mesmo jeito, se acusado, antes do E2.5." · etapa de outra delegação; continua no pedido
- "E3.1 (forge:tech-lead): PR de proposta no Forge (E3), pela skill `contribuir-com-o-forge`, clone em `~/.forge-contrib/MetricasDSPD`." · etapa de outra delegação; continua no pedido
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- O QA e o PR da `docs/047-dependabot` (resto do E4.1, depois deste review); reformatar a tabela das linhas 9 a 19 do `praticas.md` para o prettier (vermelho já na base be0a8d7978714e091d0f4e776c606333d8f33fc9, cartão técnico à parte); o quadro e o arquivo do pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 4 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- DECISÃO TÉCNICA do Jarvis (2026-10-28 11:50, Histórico do pedido 026): commits só de parecer (review e QA) não são o commit final da branch e saem sem `pronto`.
- Neste review não rode a suíte, o `pronto` nem testes (o QA da worktree 048a pode estar rodando): o review é por leitura do diff.
- NÃO tocar: o `praticas.md` e qualquer outro arquivo além do parecer (achado vira linha no parecer, não correção); o `.env`, a `main`, as outras worktrees.
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha, também nas provas. Parecer se escreve só pela ferramenta Write ou Edit.
- R-VERIFY: nunca `--no-verify` nem `--force`. A `main` é do usuário.

## Pronto quando
- PQ-1 (cmd): `grep -c '^commit: 6983dd8c167f7c24e4761b2dbbbf67e069298561' /home/rodrigoisensee/MetricasDSPD-047c/docs/reviews/047-dependabot.md` · espera: igual '1'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047c diff --name-only 6983dd8c167f7c24e4761b2dbbbf67e069298561 HEAD` · espera: igual 'docs/reviews/047-dependabot.md'
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-047c ls-remote origin refs/heads/docs/047-dependabot` igual ao `git -C /home/rodrigoisensee/MetricasDSPD-047c rev-parse HEAD`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-047c status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: veredito, achados bloqueantes (arquivo:linha) e recomendados, a leitura da frase a mais, e o sha do commit do parecer; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
