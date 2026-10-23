Agente destino: forge:agile-coach
Pedido: docs/pedidos/037-pr-131-release-com-falhas.md
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8

## Objetivo
Retrospectiva do pedido 037 (PR #131 com falhas, C6 de /operacional e Web Worker da ADR 0021), etapa R.1, cartão K-113. O pedido levou de 2026-10-20 a 2026-10-23, com sonda, Worker, 101 E2E vermelhos (W037-001), várias voltas de review e QA, promoção e release #144 (main, 2026-10-23 17:28Z) com a corrida do `homolog-aprovada` (K-108). O time precisa saber o que custou tempo e o que vira melhoria. Repositório principal `/home/rodrigoisensee/Metricas/MetricasDSPD`, branch `docs/jarvis-2026-10-23` (do Jarvis); não troque de branch. Outros agentes podem commitar nesta branch ao mesmo tempo: se o `git commit` acusar `index.lock`, espere alguns segundos e tente de novo.

## Ler
- `docs/pedidos/037-pr-131-release-com-falhas.md`, seções "Escopo", "Etapas", "Andamento" e "Histórico".
- `docs/kanban/historico.md`, linhas do K-113 e do K-108.
- `docs/kanban/conferencias.md`, linhas do 037.
- `docs/retrospectivas/2026-10-22-040-banco-local.md`, só como modelo de forma.

## Entregar
- (E1, E2) Retrospectiva em `docs/retrospectivas/2026-10-23-037-c6-worker-release.md`: dados do fluxo (lead time e esperas, com as horas do `historico.md`), conferências (rodadas de brief e de entrega do 037, reprovadas e aprovadas de primeira, contadas no `conferencias.md`, agregadas por classe de causa), retrabalho (voltas do review, do QA e do portão), o que funcionou, o que não funcionou, e linhas `MELHORIA:` com problema, evidência e se é do projeto ou do Forge (F21 e F22 do `docs/kanban/prompt-jarvis-forge-2026-10-21.md` já estão registradas: cite, não repita).
- (E1, E2) Gravar com Write ou Edit, nunca por Bash; um commit só da retrospectiva, `git add` explícito por caminho, linha `Cartão: K-113`, mensagem conforme a seção de commits do `docs/engineering/praticas.md`; sem push.

## Fora do escopo
- As etapas E1.1 a E1.5 e E2.1 a E2.9 do pedido (dono, devops-engineer, qa-engineer, react-frontend, software-architect e tech-lead) · etapas de outro papel ou do dono, cumpridas.
- Implementar qualquer melhoria (vira cartão ou PR depois, pelo Jarvis); o quadro (`KANBAN.md` e `historico.md`); o arquivo do pedido; os pedidos 025 e 041; push.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): D1, opção A ("A se d1 foi feito e vai subir certo"): o D1 deixa de ser pendência; no 037 aparece como W037-001, encontrado e corrigido na entrega, e no 025 como não se aplica; condição: a correção sobe certa (check `e2e` do PR do 037 verde); o K-131 fecha depois do merge. D2 continua pendência (K-132).
- DECISÃO DO DONO (2026-10-21): defeitos D1 (média: 100 E2E defasados na develop, K-131) e D2 (baixa: 9 E2E instáveis com 8 workers, K-132), já existentes na develop, opção A ("A"): acompanham as entregas do 037 e do 025 como pendências listadas no PR e são corrigidos depois nos cartões K-131 e K-132 (R-QA).
- DECISÃO DO DONO (2026-10-21): comando de pronto, opção A ("A"): durante o desenvolvimento só os testes e o typecheck do pacote alterado; `pnpm run pronto` completo uma vez, antes do commit final. Vale para as próximas delegações deste projeto; a regra geral vai ao Forge (F3 do prompt de melhorias).
- DECISÃO DO DONO (2026-10-20): rodar de novo os jobs que falharam no #131, opção A ("A"), com o custo de minutos do Actions.
- DECISÃO DO DONO (2026-10-20): C6 do #131, opção A ("A"): medir antes (C6 de /operacional local no código da main × no da homolog, para confirmar se a causa é o @playwright/test 1.64.1 do #130); depois o software-architect decide o tratamento sem afrouxar o limite (K-113).
- DECISÃO DO DONO (2026-10-20): C6, opção A ("A"): seguir com o Web Worker da ADR 0021 (proposta docs/architecture/propostas/037-c6-operacional.md, alternativa A), precedido pela sonda S0; o #131 espera de 2 a 3 dias com o portão vermelho.
- DECISÃO DO DONO (2026-10-21): PR #136 (release homolog → main, homolog-aprovada vermelho: portão não disparou em d722901 e o C6 ainda não corrigido), opção A ("A"): esperar o 037; o #136 fica aberto e, com o Worker na develop (review e QA), o tech-lead promove para a homolog com os pareceres da promoção, o portão roda e o dono mescla o #136.
- Superada pelo ato do dono (pedido, Andamento de 2026-10-22): "O dono mesclou o #136 (homolog → main) em 2026-10-21 13:10 (merge 17fee18), antes do 037. A decisão "esperar o 037" ficou superada pelo ato do dono." A retrospectiva trata a decisão do #136 como superada, e a correção do C6 como entregue na release #144 (E2.8).
- DECISÃO DO DONO (2026-10-22): "Vou dormir toque tudo que puder" (ordem ampla: só o que já está confirmado ou delegado segue, R-DECISAO "Complemento"; aqui, E2.6 a E2.8, a promoção com o 025 e o PR de release para o dono validar).
- DECISÃO DO DONO (2026-10-23): homolog-aprovada do #144, opção A ("A"): o devops-engineer roda de novo o check, com o custo de ~7 s de Actions; o merge do #144 na main continua do dono.
- ADR 0003 (citada no pedido): orçamento de performance; a retrospectiva só a cita como contexto do C6, sem propor afrouxar.
- ADR 0021 (citada no pedido): Web Worker do C6; nada a decidir nesta etapa.
- Métricas de processo, nunca de pessoa ou de agente individual (regra inviolável do projeto, CLAUDE.md).

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-10-23-037-c6-worker-release.md`
- PQ-2 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-10-23-037-c6-worker-release.md` · espera: rc=0
- PQ-3 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-10-23-037-c6-worker-release.md` · espera: o sha40 do commit da retrospectiva

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
