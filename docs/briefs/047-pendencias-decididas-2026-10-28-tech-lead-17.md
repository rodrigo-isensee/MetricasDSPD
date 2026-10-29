Agente destino: forge:tech-lead
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Etapa E3.1 do pedido 047 (cartão K-164): implementar no Forge a opção B do dono, a parte que não afrouxa: o hook `parecer` e o `forge-check pr` passam a ler a mesma base ao decidir se um parecer está desatualizado, e a linha de achado aceita `arquivo:linha-linha`. Commit e push da branch, sem PR: o PR (E3.5) só sai depois do review, da segurança e do QA. Worktree nova `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164` do clone de contribuição `/home/rodrigoisensee/.forge-contrib/MetricasDSPD`, branch `melhoria/MetricasDSPD-k164-mesma-base` a partir de `origin/develop` do Forge (3b94791a8e96771c061eabb8e2b77381151289d1 na hora deste brief). Os campos Branch e Base-sha do cabeçalho são do projeto (nada muda nele); a entrega mora no repositório do Forge.

## Ler
- Skill `contribuir-com-o-forge` (passos 3 a 5): acesso, mudança e testes.
- `docs/retrospectivas/2026-10-28-problemas-para-o-forge.md` deste projeto, só a seção P-C2 (a evidência e o custo).
- No Forge: `hooks/parecer.py` (como acha a base e decide "desatualizado") e o subcomando `pr` de `bin/forge-check` (a base que ele usa e a gramática da linha de achado).

## Entregar
- (E3, E3.1) Worktree `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164` com `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD worktree add -b melhoria/MetricasDSPD-k164-mesma-base /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164 origin/develop`, depois de `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD fetch origin`. Não mexa na worktree principal `/home/rodrigoisensee/.forge-contrib/MetricasDSPD` (tem mudanças sem commit do K-152, de outra delegação) nem em `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/f22`.
- (E3, E3.1) Mesma base: o hook `parecer` e o `forge-check pr` usam uma só função ou regra para a base do delta (a do `forge-check pr`, que aceita o merge puro da base), de modo que arquivo vindo só da base por merge não torne o parecer desatualizado nos dois; achado aceita `arquivo:linha-linha` além de `arquivo:linha`. Testes nas classes existentes de `tests/test_forge.py` com corpus próprio (casos: merge puro da develop não invalida; mudança real do autor depois do parecer invalida nos dois; intervalo aceito; intervalo malformado recusado); fragmento em `changelog.d/`. Uma classe de comportamento por PR em `hooks/`: se as duas partes exigirem classes diferentes, faça só a mesma base e relate o intervalo como segunda branch a abrir.
- (E3, E3.1) Os três comandos do passo 5 da skill verdes; commit com `git add` explícito por caminho; push com `git push origin melhoria/MetricasDSPD-k164-mesma-base` (sem `-u`). Rascunho do corpo do PR em `/home/rodrigoisensee/MetricasDSPD/docs/analises/047-k164-corpo-do-pr.md` (modelo de PR do Forge: situação observada sem dados deste projeto, o que muda, como medir: revalidações de parecer sem mudança de conteúdo por PR, base medida na P-C2, meta 0), sem commit. Sem PR; depois do push, pare.
- (E1, E2, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Fora do escopo
- "E1.1 (forge:node-backend): correção do teste (E1) na branch `feature/047-select-timeout`." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E1.2 (forge:tech-lead): code review do E1.1." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E1.3 (forge:qa-engineer): parecer de QA do E1.1." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E1.4 (forge:tech-lead): PR para a develop e merge." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E1.5 (forge:qa-engineer): corrigir o campo `pedido:` do parecer `docs/qa/047-select-timeout.md` (está `047-select-timeout`; o certo é `047-pendencias-decididas-2026-10-28`), que o `forge-check pr` não acha." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E1.6 (forge:tech-lead): tirar do bloco `## Achados` do parecer `docs/reviews/047-select-timeout.md` a linha solta "Sem achado bloqueante...", fora do formato do `forge-check pr`, junto com o E1.4." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E1.7 (forge:qa-engineer): tirar do bloco `## Achados` do parecer `docs/qa/047-select-timeout.md` a linha solta "Sem achado bloqueante.", fora do formato do `forge-check pr`." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.1 (forge:devops-engineer): conferência do portão (E2), parecer de devops em `docs/devops/047-portao-e2e.md`; mudança no workflow só se faltar a E2E completa." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.2 (forge:devops-engineer): divisão da E2E do portão da homolog em 2 partes (E5), na mesma branch `docs/047-portao-e2e`, com o parecer atualizado." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.3 (forge:tech-lead): code review do E2.1 e do E2.2." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.4 (forge:qa-engineer): parecer de QA do E2.1 e do E2.2." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.5 (forge:tech-lead): PR da `docs/047-portao-e2e` para a develop e merge." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.6 (forge:security-engineer): parecer de segurança do E2.2 (CI/CD, R-SEGURANCA), em paralelo ao E2.3." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.7 (forge:tech-lead): encurtar para até 300 caracteres o achado A1 do review `docs/reviews/047-portao-e2e.md` (aviso do conferente no brief qa-4, R-REVIEW), antes do E2.5." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.8 (forge:devops-engineer): regravar pela ferramenta Write o parecer `docs/devops/047-portao-e2e.md` (o `forge-check pr` acusa autoria sem registro do papel devops), alinhando o resumo e as linhas ao workflow novo e o `commit:` (A1 e A2 do review e A2 do QA, recomendados), antes do E2.7." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.9 (forge:tech-lead): revalidar o review `docs/reviews/047-select-timeout.md` (E1, já mesclado no #158) sobre o head da `docs/047-portao-e2e` depois do merge da develop: o `forge-check pr` o acusa desatualizado porque o `homolog.yml` mudou; atualizar o `commit:` e registrar a revalidação, antes do E2.10." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.10 (forge:qa-engineer): revalidar o parecer `docs/qa/047-select-timeout.md` do mesmo jeito, depois do E2.9 e antes do E2.5." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.11 (forge:devops-engineer): revalidar o parecer `docs/devops/047-portao-e2e.md` sobre o head da `docs/047-portao-e2e`: o hook `parecer` (sem `--base`) o acusa desatualizado porque o `server/tests/plataforma2.test.ts` entrou pela develop (#158); atualizar o `commit:` e registrar a revalidação, antes do E2.12." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.12 (forge:security-engineer): revalidar o parecer `docs/security/047-portao-e2e.md` do mesmo jeito, depois do E2.11 e antes do E2.5." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.13 (forge:tech-lead): trazer a develop com o #157 (d9a7ea0074ac55ab6dc326d7a2ed3087502721bb) para a `docs/047-portao-e2e` por merge, push, rodar o `forge-check pr` sem `--base` e revalidar os pareceres de review que ele acusar (`docs/reviews/047-portao-e2e.md`, `docs/reviews/047-select-timeout.md`), antes do E2.14." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.14 (forge:qa-engineer): revalidar os pareceres de QA do 047 que o `forge-check pr` acusar depois do E2.13, antes do E2.15." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.15 (forge:devops-engineer): revalidar o parecer `docs/devops/047-portao-e2e.md` do mesmo jeito, se acusado, antes do E2.16." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E2.16 (forge:security-engineer): revalidar o parecer `docs/security/047-portao-e2e.md` do mesmo jeito, se acusado, antes do E2.5." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E4.2 (forge:tech-lead): revalidar o review `docs/reviews/047-select-timeout.md` (E1, já mesclado no #158) sobre o head da `docs/047-dependabot` (o `forge-check pr` o acusa desatualizado porque o `praticas.md` mudou) e, em seguida, o PR da `docs/047-dependabot` para a develop e o merge (fecho do E4.1)." · etapa de outra delegação; já entregue (PRs #158, #159 e #160 mesclados)
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- "E3.2 (forge:security-engineer): parecer de segurança da branch do E3.1 no clone de contribuição (hooks e `forge-check` são controles do Forge, R-SEGURANCA), antes do E3.5." · etapa de outra delegação; continua no pedido
- "E3.3 (forge:tech-lead, outra instância): code review da branch do E3.1 (R-REVIEW), antes do E3.2 e do E3.4." · etapa de outra delegação; continua no pedido
- "E3.4 (forge:qa-engineer): parecer de QA da branch do E3.1 (testes do Forge), antes do E3.5." · etapa de outra delegação; continua no pedido
- "E3.5 (forge:tech-lead): PR da branch do E3.1 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- Fica fora pela decisão do dono (opção B): deixar de cobrar parecer de branch já mesclada e não revalidar por `.forge/versao`; nada disso entra na branch.
- Abrir, mesclar, rotular, fechar ou editar PR no Forge; enviar para `develop`, `homolog` ou `main` do Forge; editar `/home/rodrigoisensee/Forge` ou o cache do plugin (R-COPIA); a worktree principal do clone e a do F22; mudar arquivo deste projeto fora do rascunho do corpo do PR; subir a versão do manifesto do plugin; ler ou editar o `.env`; o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 5 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- R-CONFORMIDADE: a mudança não afrouxa o portão; mudança real do autor depois do parecer continua invalidando. R-NEUTRO: nada de dados deste projeto no PR nem nos testes. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONTRIB: só propor. Os testes do Forge são Python e leves; não rode suíte deste projeto (trava de suíte única).

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164 log -1 --format=%H` · espera: o sha40 do commit do K-164
- PQ-2 (push): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164 ls-remote origin refs/heads/melhoria/MetricasDSPD-k164-mesma-base` igual ao `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164 rev-parse HEAD`
- PQ-3 (cmd): `cd /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164 && python3 -m unittest discover -s tests` · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164 status --porcelain` · espera: linhas=0
- PQ-5 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD status --porcelain` · espera: linhas=5
- PQ-6 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/analises/047-k164-corpo-do-pr.md`

## Relatório
Até 8 linhas, resultado real: a regra de base escolhida e onde ela mora, se o intervalo coube na mesma branch, o sha e o resultado dos testes; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
