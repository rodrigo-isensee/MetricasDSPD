Agente destino: forge:node-backend
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.2

## Objetivo
Volta 4 do 065: deixar o docs-contratos verde (páginas geradas e fotografias de contrato do O1, O2, O3 e O5) pela política de contratos do projeto (pedido 065, E1.2, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta e6ae9cc.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/tools/docs-contratos/src/insumos.test.ts` (linhas 120 a 136) e o código que ele chama; a política de mudança de contrato do projeto (procure em `/home/rodrigoisensee/MetricasDSPD-052d/docs/` e nas ADRs por contrato, fotografia e mudança incompatível); a saída de `pnpm run docs:gerar` e de `pnpm run docs:fotografar` (ou o nome que o package.json tiver).

## Entregar
- "E1.2 (node-backend): implementação no server e testes." (E1.2)
- (E1) (E2) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052d branch --show-current` deve dar `feature/065-bloqueados`; `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; antes de mudar qualquer coisa, ler a política e decidir se a mudança do 065 (campos que passam a aceitar null e valor novo no enum de notas) pode ser registrada como mudança incompatível aceita na própria versão ou se exige o contrato novo em paralelo (/api/v2); se exigir /api/v2 ou decisão de arquitetura, pare e relate com a citação da regra, sem codar; se puder registrar, regenerar as páginas e as fotografias e fazer o registro que a política pede; `cd /home/rodrigoisensee/MetricasDSPD-052d/tools/docs-contratos && pnpm exec vitest run` verde; vitest do server com no máximo 2 workers; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-205' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem merge.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; não muda nesta etapa
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: vale só para o levantamento do 064; não se aplica a esta etapa de código do 065.]
- O agente não abre, lê nem edita arquivos `.env*`.
- Não mexa em `web/` nem nos pareceres.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, os pareceres, a ADR 0026, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052d/tools/docs-contratos && pnpm exec vitest run` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --oneline e6ae9cc..origin/feature/065-bloqueados` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).