Agente destino: forge:tech-lead
Pedido: 068-release-065-067
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 2b316e5771f1c03de39e0808c165e18132689687
Etapa: merge-integracao   Cobre: E1.1

## Objetivo
Trazer para a develop o que está na main e não está nela (zod 4 do PR 213 e os merges de release), por PR com merge commit e CI verde (pedido 068, E1.1, K-219).

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD fetch origin`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log --oneline origin/develop..origin/main`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD diff origin/develop...origin/main --stat`.

## Entregar
- "E1.1 (tech-lead): PR da main para a develop (zod 4 e merges de release), merge commit com a CI verde." (E1.1)
- (E1) (E1.1) abrir PR com `gh pr create --repo rodrigo-isensee/MetricasDSPD --base develop --head main` (título citando o pedido 068 e o zod 4 do PR 213; corpo dizendo que é a volta do que o dono mesclou na main, pelo fluxo de hotfix do CLAUDE.md); esperar os checks por laço com pausa (sem `--watch`); se a CI do zod 4 falhar, pare e relate; com tudo verde, mesclar por merge commit (`gh pr merge main --repo rodrigo-isensee/MetricasDSPD --merge --match-head-commit <head>`), sem `--admin`; se a permissão negar o merge, pare e relate; sem tocar na homolog nem na main.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (depois de avisar que o PR 211 já estava mesclado): seguir com o trabalho sem esperar.
- 2026-11-04 17:53: pedido aberto: o dono avisou que o PR 211 já estava mesclado (2026-11-04 11:03Z) e mandou seguir sem ficar parado; a main tem também o zod 4 (b32dc87, PR 213) que não está na develop. DECISÃO TÉCNICA (Jarvis): fluxo de release do CLAUDE.md, começando pela volta do zod 4 à develop; cartão K-219.
- O agente não abre, lê nem edita arquivos `.env*`.
- Nada na `main` nem na `homolog` nesta etapa.
- Recusa do `forge-check`, de hook, do sandbox ou do classificador: pare e relate a mensagem literal, sem contornar.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, pareceres, o `CLAUDE.md`, os arquivos `.env*`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): PR da develop para a homolog, merge commit com o portão verde." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR de release da homolog para a main, sem merge (o merge é do dono)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --base develop --head main --state merged --limit 1 --json number` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).