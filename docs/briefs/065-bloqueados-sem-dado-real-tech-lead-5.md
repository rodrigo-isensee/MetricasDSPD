Agente destino: forge:tech-lead
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
Mesclar o PR 214 do 065 na develop por squash com os checks verdes (pedido 065, E1.6, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta e6ae9cc.

## Ler
- `gh pr view 214 --repo rodrigo-isensee/MetricasDSPD --json state,headRefOid,body`; `gh pr checks 214 --repo rodrigo-isensee/MetricasDSPD`.

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge." (E1.6)
- (E1) (E2) (E1.6) `forge-check pr 065-bloqueados-sem-dado-real --ref origin/feature/065-bloqueados --base origin/develop` limpo; recontar as linhas de código e teste e atualizar a linha `teto: excedido, <n> linhas, <motivo>` no corpo do PR com o motivo escrito (`gh pr edit 214 --repo rodrigo-isensee/MetricasDSPD --body-file <arquivo em $TMPDIR com 065 no nome>`); esperar os checks por laço com pausa (sem `--watch`); com todos verdes, `gh pr merge 214 --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se a develop andou, `gh pr update-branch` e esperar de novo; se um check falhar, pare e relate; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; não muda nesta etapa
- 2026-11-04 12:43: pareceres regravados em a629434: review aprovado em a4ff25dd9925006ca486ef02cd9f49fda0fada19 e QA aprovado em e6ae9ccdc4395c9fda57d6dad33eb2260cdf39a3 (web com cobertura 100%, 1426 testes); forge-check pr limpo. O QA relatou ter trocado um heredoc com redirecionamento e commit na mesma chamada por Write e commit separado depois da recusa do hook: é a forma que o próprio hook indica, não contorno. DECISÃO TÉCNICA (Jarvis): o tech-lead mescla o PR 214 por squash com os checks verdes, recontando a linha teto.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- O agente não abre, lê nem edita arquivos `.env*`.
- Nada na `main` nem na `homolog` (o PR de release 211 está com o dono).
- Recusa do `forge-check pr`, de hook, do sandbox ou do classificador: pare e relate a mensagem literal, sem contornar.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr view 214 --repo rodrigo-isensee/MetricasDSPD --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).