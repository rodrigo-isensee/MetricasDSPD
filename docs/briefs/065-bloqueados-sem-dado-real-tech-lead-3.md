Agente destino: forge:tech-lead
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
PR do 065 para a develop e merge por squash (pedido 065, E1.6, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta 8dba5ed.

## Ler
- Os pareceres na branch: `docs/reviews/065-bloqueados.md`, `docs/qa/065-bloqueados.md`, `docs/ux/065-revisao-bloqueados.md`; seção de commits e de PR de `/home/rodrigoisensee/MetricasDSPD-052d/docs/engineering/praticas.md`.

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge." (E1.6)
- (E1) (E2) (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; `forge-check pr 065-bloqueados-sem-dado-real --ref origin/feature/065-bloqueados --base origin/develop` limpo antes de abrir; PR para a develop com título citando o pedido 065 (BLOQUEADOS e O5 sem dado real até a coleta gravar bloqueios), corpo com o resumo, as decisões do dono (C, isso, B), os 3 pareceres, as ressalvas (A1 e A7 do review, M2 e B1 a B3 do UX, A3 do QA: o dono roda test:pg antes da release; a ADR 0026 precisa da linha de revisão citando o 065) e a linha `teto: excedido, 563 linhas, <motivo>`; merge por squash quando os checks ficarem verdes, sem `--admin`; se a develop andou, `gh pr update-branch` e esperar os checks; se um parecer desatualizar, pare e relate; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; o A7 do review fica como recomendado, sem mudança nesta etapa
- 2026-11-04 11:48: E1.4 cumprida pelo tech-lead: formatação commitada em 742e4f3fdecb553b2ef2a39305225560f2e1ebb8; review regravado em 545924e3c6f72780b2766c1b7d29615d93d7740a (commit: 742e4f3), aprovado sem bloqueante; A2 do QA resolvido; A7 recomendado: a API de teste importa por caminho relativo entre pacotes (ADR 0002), passa porque server/tests/pg está fora do lint; lote com 563 linhas, o PR precisa da linha teto. DECISÃO TÉCNICA (Jarvis): o QA regrava o parecer citando 742e4f3 (depois só entra parecer); depois o PR (E1.6).
- 2026-11-04 12:04: forma do parecer de QA acertada pelo qa-engineer em 8dba5ed (A2 no formato; autoria registrada); forge-check pr rc 0. DECISÃO TÉCNICA (Jarvis): E1.6 com o tech-lead: PR para a develop com a linha teto (563 linhas) e merge por squash com a CI verde; sem promover para a homolog enquanto o PR de release 211 estiver aberto com o dono, para não mudar o que ele valida.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- O agente não abre, lê nem edita arquivos `.env*`.
- Nada na `main` nem na `homolog` (CLAUDE.md, A main é do usuário; o PR de release 211 está com o dono).
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
- PQ-1 (merge): `gh pr view --repo rodrigo-isensee/MetricasDSPD feature/065-bloqueados --json state,baseRefName` · espera: contém 'MERGED'
- PQ-2 (cmd): `gh pr view --repo rodrigo-isensee/MetricasDSPD feature/065-bloqueados --json body --jq .body` · espera: contém 'teto: excedido'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).