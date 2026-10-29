Agente destino: forge:security-engineer
Pedido: 047-pendencias-decididas-2026-10-28
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: review

## Objetivo
Etapa E3.2 do pedido 047 (E3, cartão K-164): review de segurança (R-SEGURANCA; hooks e `forge-check` são controles do Forge) da proposta ao Forge na branch `melhoria/MetricasDSPD-k164-mesma-base`, commit a779854509371951e47e27ec3bcc487f57e46034, já no origin do Forge. O code review (E3.3) aprovou sem bloqueantes. Revisão só de leitura na worktree `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164`; o parecer fica no projeto, como os do pedido 043.

## Ler
- `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164 diff 4afeec7e1d69d9324e9c33cb3061241131ff72ec a779854509371951e47e27ec3bcc487f57e46034` (6 arquivos: `bin/forge-check`, `hooks/parecer.py`, `tests/test_forge.py`, dois casos novos do corpus e o `changelog.d`).
- O parecer de review aprovado `/home/rodrigoisensee/MetricasDSPD/docs/reviews/047-k164-mesma-base.md` (recomendados R1 a R3).
- Um parecer de segurança do pedido 043 (`/home/rodrigoisensee/MetricasDSPD/docs/security/043-f22-release.md`) como modelo de forma.

## Entregar
- (E3.2, E3) Review de segurança do diff 4afeec7e1d69d9324e9c33cb3061241131ff72ec..a779854509371951e47e27ec3bcc487f57e46034: nenhum controle afrouxado além da DECISÃO DO DONO do K-164 (opção B); a base usada pelo hook `parecer` não pode ser escolhida pelo autor para escapar do portão (base fora do fluxo ou inexistente segue estrita); o `git merge` simulado não escreve na branch de integração nem deixa estado; o formato `arquivo:linha-linha` não abre injeção nem passa achado malformado; o R1 do review (sem `--base`, hook simula sobre a develop e o `forge-check pr` segue estrito) tem ou não efeito de segurança.
- (E3.2) Parecer `/home/rodrigoisensee/MetricasDSPD/docs/security/047-k164-mesma-base.md` com o cabeçalho dos pareceres de segurança (`tipo: revisao-seguranca`, `contrato: 1`, `pedido: 047-pendencias-decididas-2026-10-28`, `branch: melhoria/MetricasDSPD-k164-mesma-base`, `commit: a779854509371951e47e27ec3bcc487f57e46034`, `parecer:`, `revisor: forge:security-engineer`, `data:`) e a seção `## Achados` (achado bloqueante com `arquivo:linha` e a correção). Sem commit: o arquivo fica no projeto como os pareceres do 043.
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
- "E3.4 (forge:qa-engineer): parecer de QA da branch do E3.1 (testes do Forge), antes do E3.5." · etapa de outra delegação; continua no pedido
- "E3.5 (forge:tech-lead): PR da branch do E3.1 para a develop do Forge, depois do review, da segurança e do QA aprovados; só propor (R-CONTRIB)." · etapa de outra delegação; continua no pedido
- "E4.1 (forge:tech-lead): política do Dependabot no `praticas.md` (E4), com review, QA e PR." · etapa de outra delegação; já entregue
- "E4.2 (forge:tech-lead): revalidar o review `docs/reviews/047-select-timeout.md` (E1, já mesclado no #158) sobre o head da `docs/047-dependabot` (o `forge-check pr` o acusa desatualizado porque o `praticas.md` mudou) e, em seguida, o PR da `docs/047-dependabot` para a develop e o merge (fecho do E4.1)." · etapa de outra delegação; já entregue
- "E5.1 (forge:agile-coach): retrospectiva do pedido em `docs/retrospectivas/2026-10-28-047-pendencias.md`, com as linhas `MELHORIA:`." · etapa de outra delegação; continua no pedido
- Commit, push ou qualquer escrita no clone `~/.forge-contrib/MetricasDSPD` e nas worktrees dele; abrir PR; rodar a suíte inteira do Forge (o pre-push dela recusa sessão do Claude, histórico de 22:39); editar o cache do plugin ou `~/Forge`; o quadro e o arquivo do pedido; ler ou editar o `.env`.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-28): K-150 confirmado ("150 sim"): o node-backend corrige o teste "reprova: SELECT *" de server/tests/plataforma2.test.ts:269, que estoura 30 s com outra suíte junto, sem aumentar o timeout e sem retry.
- DECISÃO DO DONO (2026-10-28): K-144, "Signs o padrão da forge." / "Siga" (lido como "Siga o padrão da Forge"): o padrão da Forge (R-FLUXO) é a bateria completa no PR e no push da homolog, sem rodada noturna como portão; a noturna segue informativa (EXIGIR_NOTURNA continua false). Resta a parte técnica: o devops confere que o portão da homolog roda a E2E completa.
- DECISÃO DO DONO (2026-10-28): K-164, opção B ("B"): propor ao Forge (PR na develop do Forge, só propor) só a parte que não afrouxa: a mesma base no hook parecer e no forge-check pr, e achado aceitando arquivo:linha-linha. Não cobrar parecer de branch mesclada e não revalidar por .forge/versao ficam fora, para decisão futura com medição.
- DECISÃO DO DONO (2026-10-28): K-169, opção A ("A"): PR do Dependabot é mesclado um por vez, só com todos os checks verdes, pelo tech-lead; check vermelho para e avisa o Jarvis. O tech-lead registra a política no docs/engineering/praticas.md por PR.
- DECISÃO DO DONO (2026-10-23): "Rode no máximo uma suíte de teste por vez e poucos agentes em paralelo." (pedido 041).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto (pedido 025).
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 5 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- R-CONTRIB: sessão de outro projeto só propõe; nada se integra ao Forge daqui.
- Revisão estática e defensiva: só leitura de arquivos e `git` de leitura; sem rodar testes (são do E3.4).
- O hook barra `$`, `$?`, crase, chaves e `?` no Bash: comandos literais, um por linha.
- R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`. Recusa de hook: pare e relate a mensagem literal.

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD/docs/security/047-k164-mesma-base.md`
- PQ-2 (cmd): `grep -c '^commit: a779854509371951e47e27ec3bcc487f57e46034' /home/rodrigoisensee/MetricasDSPD/docs/security/047-k164-mesma-base.md` · espera: igual '1'
- PQ-3 (cmd): `grep -c '^## Achados' /home/rodrigoisensee/MetricasDSPD/docs/security/047-k164-mesma-base.md` · espera: igual '1'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real: o veredito e os achados bloqueantes com arquivo:linha; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
