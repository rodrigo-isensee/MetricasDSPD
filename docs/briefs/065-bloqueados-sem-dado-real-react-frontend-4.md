Agente destino: forge:react-frontend
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.3

## Objetivo
Cobrir com teste as ramificações do web que deixaram a cobertura de branches em 99,97% no PR 214 (pedido 065, E1.3, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta 8dba5ed.

## Ler
- O comando de cobertura do web no `/home/rodrigoisensee/MetricasDSPD-052d/package.json` ou `/home/rodrigoisensee/MetricasDSPD-052d/web/package.json` (o que a CI roda em `pnpm run cobertura`); os arquivos do web mudados pelo 065: `CartaoO1.tsx`, `CartaoO2.tsx`, `fluxo.tsx`, `CartaoComplementar.tsx`.

## Entregar
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." (E1.3)
- (E1) (E2) (E1.3) `git -C /home/rodrigoisensee/MetricasDSPD-052d branch --show-current` deve dar `feature/065-bloqueados`; `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; rodar a cobertura do web com no máximo 2 workers e achar as ramificações sem teste; cobrir com teste novo ou ampliado, sem mudar código de produção (se só der mudando código, pare e relate); cobertura do web em 100% de branches; commit só de testes com `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-205' -- <arquivos de teste>`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem PR novo (o PR 214 já existe).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; não muda nesta etapa
- 2026-11-04 12:16: E1.6 parcial pelo tech-lead: PR 214 aberto (develop), sem merge: o check testes falhou na cobertura do web (run 41853752754: branches 99.97% contra 100%); forge-check pr rc 0 antes de abrir; corpo com decisões, pareceres, ressalvas e linha teto. DECISÃO TÉCNICA (Jarvis): volta 3 do front: achar as ramificações sem teste do web e cobri-las só com teste; depois o tech-lead regrava o review e o QA regrava o parecer, e o merge segue no PR 214.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código de produção, `server/`, `packages/`, `e2e/`, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only 8dba5ed origin/feature/065-bloqueados` · espera: contém '.test.'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --oneline 8dba5ed..origin/feature/065-bloqueados` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).