Agente destino: forge:software-architect
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.8

## Objetivo
Decidir, pela política de mudança de contrato, se as mudanças do 065 no O1, O3 e O5 entram como aceite na v1 ou como contrato /api/v2 (pedido 065, E1.8, K-205).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/contratos/politica-de-mudanca.md` (§2, §5 e Como o gate funciona); `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-desenho.md`; no web, quem consome as notas do O3 e os campos bloqueados do O1 e horasBloqueio do O5 (`/home/rodrigoisensee/MetricasDSPD-052d/web/src/`), para ver se há switch exaustivo ou leitura que quebre; quem mais consome a API além do web (busque em `/home/rodrigoisensee/MetricasDSPD-052d/docs/api/` e no `CLAUDE.md`).

## Entregar
- "E1.8 (software-architect): decisão de contrato pela política de mudança (aceite na v1 em aceitas.json ou contrato /api/v2) para O1, O3 e O5, que o tech-lead aprova depois." (E1.8)
- (E1) (E2) (E1.8) gravar `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-decisao-contrato.md` pela ferramenta Write, sem commit: a recomendação (aceite na v1 ou /api/v2) com o motivo citando a política, os consumidores encontrados e o risco de cada um, o texto do aceite (motivo e data) se for aceite, e a contradição da política entre o §2 e a saída 2 do gate; deixar uma seção vazia `Aprovação do tech-lead` para a etapa seguinte.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; não muda nesta etapa
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Sem código e sem mudar a política: só a decisão escrita.
- NÃO tocar: código, testes, a política, os pareceres, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): aprovar ou recusar a decisão de contrato do arquiteto (política, §5)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido; a aprovação, que é do tech-lead.

## Pronto quando
- PQ-1 (cmd): `grep -c 'Aprovação do tech-lead' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-decisao-contrato.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).