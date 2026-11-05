Agente destino: forge:qa-engineer
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: qa   Cobre: E1.5

## Objetivo
Regravar o parecer de QA do 065 na ponta c1e0c06fb01b0cf162f7f9fbedb302782e4b6bba, depois da volta do contrato (pedido 065, E1.5, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff e6ae9ccdc4395c9fda57d6dad33eb2260cdf39a3 c1e0c06fb01b0cf162f7f9fbedb302782e4b6bba` (contrato do O5 revertido, aceites de O1 e O3, fotografias, páginas e openapi); `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-decisao-contrato.md`.
- o seu parecer `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/065-bloqueados.md`.

## Entregar
- "E1.5 (qa-engineer): QA." (E1.5)
- (E1) (E2) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; rodar com no máximo 2 workers o vitest de packages/contratos, de tools/docs-contratos, do server e do web, o E2E `e2e/tests-api/bloqueio-sem-dado-065.spec.ts` e o `pnpm run docs:check`; regravar `docs/qa/065-bloqueados.md` com `commit: c1e0c06fb01b0cf162f7f9fbedb302782e4b6bba`, o resultado real e veredito; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem merge.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; não muda nesta etapa
- 2026-11-04 13:42: volta 4 do back com o contrato aprovado entregue pelo node-backend em c1e0c06 (push ok): O5 de volta a z.number() e sem notas; aceites de O1 e O3 registrados e removidos do aceitas.json (fica vazio no commit); O2 fotografado; páginas O1 a O3 geradas; openapi regenerado (fora da lista, porque o openapi:verificar acusava defasagem); docs-contratos, contratos, metricas e docs:check verdes. DECISÃO TÉCNICA (Jarvis): review e QA regravam ao mesmo tempo citando c1e0c06; depois o merge do PR 214 com a linha contrato.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Outro parecer é regravado ao mesmo tempo nesta worktree: pull antes do commit; commit só do próprio parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-205' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos e repita.
- O parecer é gravado pela ferramenta Write (inteiro), com `commit: c1e0c06fb01b0cf162f7f9fbedb302782e4b6bba`; achados de até 300 caracteres, severidade só entre parênteses.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- Recursos: uma tarefa pesada por vez, vitest e playwright com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- NÃO tocar: código, testes, o outro parecer, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- "E1.8 (software-architect): decisão de contrato pela política de mudança (aceite na v1 em aceitas.json ou contrato /api/v2) para O1, O3 e O5, que o tech-lead aprova depois." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): aprovar ou recusar a decisão de contrato do arquiteto (política, §5)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/065-bloqueados:docs/qa/065-bloqueados.md` · espera: contém 'commit: c1e0c06fb01b0cf162f7f9fbedb302782e4b6bba'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).