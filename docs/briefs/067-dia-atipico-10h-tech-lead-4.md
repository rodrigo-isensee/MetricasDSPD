Agente destino: forge:tech-lead
Pedido: 067-dia-atipico-10h
Tipo: codigo
Branch: feature/067-dia-atipico   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: merge-integracao   Cobre: E1.7

## Objetivo
Mesclar o PR 215 do 067 na develop por squash com a CI verde (pedido 067, E1.7, K-218). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/067-dia-atipico`.

## Ler
- `gh pr view 215 --repo rodrigo-isensee/MetricasDSPD --json state,headRefOid,mergeStateStatus`; `gh pr checks 215 --repo rodrigo-isensee/MetricasDSPD`.

## Entregar
- "E1.7 (tech-lead): merge do PR 215 por squash com a CI verde." (E1.7)
- (E1) (E1.7) `forge-check pr 067-dia-atipico-10h --ref origin/feature/067-dia-atipico --base origin/develop` limpo; esperar os checks por laço com pausa (sem `--watch`); com todos verdes, `gh pr merge 215 --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se a develop andou, `gh pr update-branch` e esperar de novo; se um check falhar ou a permissão negar o merge, pare e relate; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Atipico acima de 10 horas" (decisão 3, valores fixos da aba do apontamento): o dia da pessoa passa a ser marcado como atípico acima de 10 horas.
- DECISÃO DO DONO (2026-11-04): "o demais pode seguir por enquanto" (recibo do 067): os outros cinco limites dos achados seguem como estão, provisórios.
- 2026-11-04 15:46: E1.6 cumprida pelo qa-engineer: parecer regravado em e697ce7 (commit: 46ea941), aprovado; prettier limpo; metricas 1258 com cobertura 100%. DECISÃO TÉCNICA (Jarvis): E1.7 com o tech-lead, merge do PR 215.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064-lacunas-dado-real) - 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064-lacunas-dado-real) - 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064-lacunas-dado-real) - 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- O agente não abre, lê nem edita arquivos `.env*`.
- Nada na `main` nem na `homolog`.
- Recusa do `forge-check pr`, de hook, do sandbox ou do classificador: pare e relate a mensagem literal, sem contornar.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): troca do limite, versão de critério com data, testes e documentação." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): formatação do index.ts do apontamento que o check rapida acusou, com o review regravado na ponta nova." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): parecer de QA regravado na ponta depois da formatação." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr view 215 --repo rodrigo-isensee/MetricasDSPD --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).