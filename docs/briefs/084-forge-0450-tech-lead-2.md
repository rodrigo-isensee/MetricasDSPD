Agente destino: forge:tech-lead
Pedido: 084-forge-0450
Tipo: merge
Branch: forge/upgrade-0.45.2   Base: develop   Base-sha: 528ae770bee1a71af06dbea4f4a7042a383ccf57
Etapa: pr   Cobre: E1.4

## Objetivo
PR da branch `forge/upgrade-0.45.2` para a develop (pedido 084, K-255): o projeto passa a registrar o Forge 0.45.2, com review (41bb2efb) e QA (76765d8c) aprovados; o merge é do dono. Worktree `/home/rodrigoisensee/MetricasDSPD-052h`.

## Ler
- Do pedido `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/084-forge-0450.md`, só o `## Histórico`.

## Entregar
- "E1.4 (tech-lead): PR para a develop, depois do QA; o merge é do dono." (E1.4)
- (E1) (E1.4) `forge-check pr 084-forge-0450 --ref origin/forge/upgrade-0.45.2 --base origin/develop` (da raiz `/home/rodrigoisensee/Metricas/MetricasDSPD`) aprovado; abrir o PR em rascunho com `gh pr create --draft --repo rodrigo-isensee/MetricasDSPD --base develop --head forge/upgrade-0.45.2 --title "chore(forge): atualiza para 0.45.2" --body-file <arquivo gravado por Write no scratchpad>` (corpo no molde do PR 275: objetivo, o que mudou, como testar, pareceres de review e QA e os achados pré-existentes A1 e A2 do QA); se o hook recusar por prazo de decisão, repita até duas vezes e, persistindo, relate a mensagem literal; esperar todos os checks verdes por chamadas curtas; `gh pr ready <número> --repo rodrigo-isensee/MetricasDSPD` uma vez; não mesclar. `api.github.com` e `github.com` em allowed_domains. Sem `--admin` nem `--force`.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 084-forge-0450 até 341194f8d4e32dee62ac9f0578ce9e4ae0ac7d0d5e3b62f3704f518dd393bb89 (4 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/084-forge-0450.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.4 (copiadas literalmente):
- - 2026-11-10: DECISÃO DO DONO (literal): "sim" ao recibo "Mudo o pedido 084 para mirar a 0.45.2?". Alvo passa a 0.45.2; E1 e E1.1 reescritas (a E1.1 é do dono: atualizar o plugin, reiniciar, rodar o forge-upgrade, enviar a branch). A branch forge/upgrade-0.45.0 fica parada e será descartada quando a 0.45.2 entrar.
- - 2026-11-10 11:06: DECISÃO DO DONO (2026-11-10 11:00): recibo confirmado: "rode e atualize e depois retome" (vou fazer: forge-upgrade para a 0.45.2 numa worktree limpa, envio da branch, review, QA e PR para a develop; não vou: mesclar). Branch forge/upgrade-0.45.2 enviada pelo Jarvis (378c05685d2bd8fa52b0d03297b24e692f4622a1), como parte da ordem do dono de rodar e atualizar; o review (E1.2) segue com o tech-lead.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (dono): atualizar o plugin Forge para 0.45.2, reiniciar a sessão, rodar o `forge-upgrade` e enviar a branch dele." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA (`pnpm run pronto`)." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva curta, junto com a próxima rodada de retrospectivas." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (pr): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head forge/upgrade-0.45.2 --state open --json number --jq length` · espera: igual '1'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
