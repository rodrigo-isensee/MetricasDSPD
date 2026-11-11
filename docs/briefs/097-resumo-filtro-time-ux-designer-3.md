Agente destino: forge:ux-designer
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: docs/097-ux-recolher-setor   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E1.3

## Objetivo
Segunda rodada do UX no pedido 097, com as decisões do dono depois do primeiro protótipo: rótulo "Equipe" em todo o produto ("troque time por equipe", 14:08), botão de recolher em todo cartão de gráfico e os 10 maiores com "ver todos" no AP-PROJETO (E5, "A" de 13:45 e recomendações de 14:05), e o filtro Setor (E7, "A" de 14:09, nomes sem o sobrenome).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/097-resumo-filtro-time.md` (inteiro, com as decisões literais).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/097-filtros-time-busca.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/prototipos/097-filtros.html` (a primeira rodada).

## Entregar
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo \"Equipe\", na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." (E1.3)
- (E5) (E7) (E1) (E2) (E1.3) Escrever na worktree `/home/rodrigoisensee/MetricasDSPD-052d`, pela ferramenta Write: `docs/ux/097-filtros-time-busca.md` (a especificação da primeira rodada, copiada do repositório principal, com "Time" trocado por "Equipe" e as seções novas de E5 e E7, com critérios de aceite numerados a partir do CA-24) e `docs/ux/prototipos/097-filtros.html` (o protótipo com as abas novas: recolher cartão, 10 maiores com "ver todos" e filtro Setor nos painéis do fluxo, sem comparação entre setores). Sem commit (o UX não tem shell; o Jarvis leva ao tech-lead).
- (E3) (E4) (E6) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/ux/097-filtros-time-busca.md, docs/ux/prototipos/097-filtros.html

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até b7f2fcada9845b5ac84cedf4736a2da181634dbdb635cbc49fef3ca98c67fc23 (11 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024
- aplicáveis a E1.3 (copiadas literalmente):
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4 do plano, equipe opcional nas duas tendências (parte servidor do E1), na branch feature/097-l4-tendencia-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/097-filtros-time-busca.md` · espera: existe e tem as seções de E5 e E7
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
