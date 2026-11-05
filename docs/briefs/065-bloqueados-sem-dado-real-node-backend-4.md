Agente destino: forge:node-backend
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.2

## Objetivo
Volta 4 do 065 com a decisão de contrato aprovada: aceite na v1 para O1 e O3, fotografia do O2, O5 de volta ao contrato anterior, docs-contratos verde (pedido 065, E1.2, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta e6ae9cc.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-decisao-contrato.md` (decisão do arquiteto e aprovação do tech-lead); `/home/rodrigoisensee/MetricasDSPD-052d/docs/contratos/politica-de-mudanca.md` (fluxo de mudança incompatível aceita).

## Entregar
- "E1.2 (node-backend): implementação no server e testes." (E1.2)
- (E1) (E2) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052d branch --show-current` deve dar `feature/065-bloqueados`; `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; copiar `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-decisao-contrato.md` para `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-decisao-contrato.md`; O5: `horasBloqueio` volta a `z.number()` (schemas.ts:860), sai o `notas` do O5 (schemas.ts:865-866), sai o cast de `packages/metricas/src/complementares.test.ts:167` e o teste C3 se ajusta; seguir o fluxo de mudança incompatível aceita da política para O1 e O3 (aceite em `docs/contratos/snapshots/aceitas.json` com motivo, data e o hash do `docs:check`, `docs:fotografar`, remover as entradas, `docs:check` verde) e fotografar o O2; `pnpm run docs:gerar` para as páginas; `cd /home/rodrigoisensee/MetricasDSPD-052d/tools/docs-contratos && pnpm exec vitest run` verde; vitest do server e dos pacotes com no máximo 2 workers; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-205' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem merge.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; não muda nesta etapa
- 2026-11-04 13:33: E1.9 cumprida pelo tech-lead: decisão de contrato aprovada (docs/analises/065-decisao-contrato.md): O1 e O3 com aceite na v1; O2 só fotografar; O5 desfazer o nullable (schemas.ts:860 volta a z.number()) e tirar o notas do O5 (schemas.ts:865-866), sem fotografia nova do O5; tirar o cast em packages/metricas/src/complementares.test.ts:167 e ajustar o teste C3; hashes do docs:check; entradas saem do aceitas.json no mesmo PR; PR com a linha contrato: incompatível (aceite na v1, ...). DECISÃO TÉCNICA (Jarvis): volta 4 do node-backend com a decisão aprovada; ele leva a decisão para a branch (docs/analises/065-decisao-contrato.md) no mesmo commit do aceite.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Não mexa em `web/` nem nos pareceres; se o web precisar mudar por causa do O5, pare e relate.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, a política, os pareceres, a ADR 0026, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- "E1.8 (software-architect): decisão de contrato pela política de mudança (aceite na v1 em aceitas.json ou contrato /api/v2) para O1, O3 e O5, que o tech-lead aprova depois." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): aprovar ou recusar a decisão de contrato do arquiteto (política, §5)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052d/tools/docs-contratos && pnpm exec vitest run` · espera: rc=0
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052d && pnpm run docs:check` · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/065-bloqueados:docs/analises/065-decisao-contrato.md` · espera: contém 'Aprovação do tech-lead'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).