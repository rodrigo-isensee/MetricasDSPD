Agente destino: forge:tech-lead
Pedido: 083-pre-push-lint-alterados
Tipo: merge
Branch: feature/083-pre-push-lint   Base: develop   Base-sha: 54f02c42b51aba3355e9f0428f058113f916c4c9
Etapa: pr   Cobre: E1.4

## Objetivo
PR do pedido 083 (K-249) para a develop: pre-push com lint só nos `.ts`/`.tsx` alterados, com cache, pulando sem esses arquivos; a CI segue com o lint inteiro. Review, segurança e QA aprovados (forge-check pr aprovado no head d0d6c430). Worktree `/home/rodrigoisensee/MetricasDSPD-052e`, branch `feature/083-pre-push-lint`. O merge é do dono.

## Ler
- Do pedido `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/083-pre-push-lint-alterados.md`, só `## Etapas` e as linhas do `## Histórico` do review, da segurança e do QA.

## Entregar
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." (E1.4)
- (E1) (E1.4) `forge-check pr 083-pre-push-lint-alterados --ref origin/feature/083-pre-push-lint --base origin/develop` (da raiz `/home/rodrigoisensee/Metricas/MetricasDSPD`) aprovado no head atual; abrir o PR em rascunho com `gh pr create --draft --repo rodrigo-isensee/MetricasDSPD --base develop --head feature/083-pre-push-lint --title "chore(083): pre-push com lint só nos arquivos alterados" --body-file <arquivo gravado por Write no scratchpad>` (corpo: o problema medido no diagnóstico do 077, a mudança, que a CI segue com o lint inteiro, a troca do hook feita pelo dono, os pareceres de review, segurança e QA e os achados recomendados); esperar todos os checks do PR concluídos e verdes, por chamadas curtas; `gh pr ready <número> --repo rodrigo-isensee/MetricasDSPD` uma vez (recusado: relate a mensagem literal); não mesclar.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- - 2026-11-08 20:01: DECISÃO DO DONO (literal): "A" (aplicar a correção 1 do diagnóstico E2.7 do 077: pre-push com lint só nos .ts/.tsx alterados e cache, pulando push só de docs; a CI segue com eslint inteiro). Pedido aberto (Jarvis). Recibo: vou fazer: o devops-engineer muda o pre-push numa branch, com parecer de devops, review, QA e PR para a develop; não vou: mudar CI, typecheck, ambiente nem o guarda; o merge é do dono. DECISÃO TÉCNICA (Jarvis): branch melhoria/083-pre-push-lint na worktree 052e (livre: a integração foi descartada), a partir da develop 54f02c42; depois do merge, cada branch em curso recebe a develop e passa a usar o hook novo.
- - 2026-11-08 20:02: DECISÃO DO DONO (2026-11-08 20:02): recibo confirmado: "A" (a opção A levada ao dono descrevia o que se faz: lint só nos arquivos alterados, com cache, CI com o lint inteiro, mudança numa branch com review e PR, merge do dono).
- O agente não abre, lê nem edita arquivos `.env*`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify`, `--force` nem `--admin`. Caminhos e números literais, sem `$VAR`; `github.com` e `api.github.com` em allowed_domains.
- NÃO tocar: arquivos do repositório (sem commit nesta etapa), outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `.githooks/pre-push` (e `package.json`, se precisar de script novo), com teste do hook se o projeto já testa scripts, e parecer de devops em docs/devops/." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (push com e sem `.ts` alterado; push só de docs; CI ainda com eslint inteiro)." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.6 (security-engineer): parecer de segurança (o pre-push é controle local; o forge-check pr exige revisão de segurança)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/083-pre-push-lint --state open --json number --jq length` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
