Agente destino: forge:tech-lead
Pedido: 097-resumo-filtro-time
Tipo: merge
Branch: feature/097-l5-resumo-equipe   Base: develop   Base-sha: 696ca87cd2eb1f9ded68e661ccd17f6b24d3d9cb
Etapa: pr   Cobre: E3.4

## Objetivo
PR e merge do L5 do pedido 097 na develop (filtro Equipe em cada bloco do Resumo). Branch `feature/097-l5-resumo-equipe`, worktree `/home/rodrigoisensee/MetricasDSPD-052f`, código 914f082c; QA (80689ee1), review (d6e4100b) e revisão de UX (docs/ux/097-revisao-l5.md, aprovada) aprovados. Merge até a homolog pela autorização do dono de 17:51.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f log --oneline origin/develop..origin/feature/097-l5-resumo-equipe` (os commits).

## Entregar
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." (E3.4) Nesta delegação, o PR e o merge do L5, pela autorização do dono de 17:51 (merge até a homolog é do time).
- (E1) (E3.4) Rodar da worktree `forge-check pr 097-resumo-filtro-time --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref origin/feature/097-l5-resumo-equipe --base develop` (aprovado; se não, pare e relate). Abrir o PR para a `develop` (squash), corpo por Write no scratchpad e `--body-file` (QA, review e UX; a memória de sessão da equipe entre o Resumo e os outros painéis fica como está até a resposta do dono; os achados baixos no cartão K-293; a linha `teto: excedido, 633 linhas, dois filtros por bloco na mesma URL e os testes de CA-1 a CA-6`; `Cartão: K-273`). Checks em laços de até 170 s (`timeout --foreground` e `< /dev/null` em cada gh). Um PR de cada vez na develop; imediatamente antes do merge, `gh pr view feature/097-l5-resumo-equipe --json mergeStateStatus,headRefOid`: só com CLEAN; se BEHIND, `gh pr update-branch feature/097-l5-resumo-equipe` e esperar os checks do head novo. Merge num comando sozinho: `gh pr merge feature/097-l5-resumo-equipe --squash --match-head-commit` seguido do sha completo, nunca `--admin`. Se um check falhar ou a permissão for negada, pare e relate. Depois, CI verde na develop com o merge.
- (E2) (E3) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: web/, e2e/ (escopo da entrega revisada; esta delegação não edita arquivo)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até 1c30f7a5c5df82fbefa44dd76e707c6254e13def77276844c013ba7c14dee9c0 (12 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024, ADR 0013
- aplicáveis a E3.4 (copiadas literalmente):
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, pareceres, outras worktrees, a `homolog` e a `main`; o único merge é o do PR desta delegação, na `develop`, com os checks verdes.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo "Equipe", na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4 do plano, equipe opcional nas duas tendências (parte servidor do E1), na branch feature/097-l4-tendencia-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push dos documentos da segunda rodada do UX, que o ux-designer não pode commitar, na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.6 (react-frontend): L5 do plano, filtro Equipe dentro de cada bloco do Resumo (CA-1 a CA-6), branch feature/097-l5-resumo-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052f." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): L2 do plano, a equipe no apontamento (parte servidor do E2: GRANT de dim_card.equipe, filtro equipe e opcoes.equipes), na branch feature/097-l2-apontamento-equipe, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E2.2 (security-engineer): parecer de segurança do L2 (banco: permissão por coluna; recorte de pessoas por equipe)." · etapa de outra delegação; continua no pedido
- "E2.3 (react-frontend): L3 do plano, Equipe no lugar de Pessoa no Apontamento (CA-7 a CA-9, Q-3), branch feature/097-l3-apontamento-equipe-web, worktree /home/rodrigoisensee/MetricasDSPD-052h." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.5 (ux-designer): revisão da interface implementada, por lote do 097, em docs/ux/097-revisao-<lote>.md." · etapa de outra delegação; continua no pedido
- "E3.6 (react-frontend): K-278, ressalvas da revisão de UX do L1 e o A5 do review (feito, PR 341)." · etapa de outra delegação; continua no pedido
- "E3.7 (react-frontend): K-284, o aviso "Marcada: X." sai da região viva também no clique e no Esc (N1 da UX do K-278), branch fix/k284-aviso-marcada, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E4.1 (node-backend): L6 do plano, parte servidor (opção T-A: tipos presentes nas stories, mapeados para os ids de TIPO_ID, em opcoes.tipos), na branch feature/097-l6-tipos-reais, worktree /home/rodrigoisensee/MetricasDSPD-056d." · etapa de outra delegação; continua no pedido
- "E4.2 (node-backend): K-279, opções de filtro com o mesmo corte das listas (feito, PR 335)." · etapa de outra delegação; continua no pedido
- "E4.3 (node-backend): K-280, condição única do corte de cards e chamados (feito, PR 339)." · etapa de outra delegação; continua no pedido
- "E4.4 (node-backend): correção do teste do GRANT que deixou a develop vermelha depois do PR 337 (feito, PR 340)." · etapa de outra delegação; continua no pedido
- "E4.5 (node-backend): L7a do plano, a equipe da Sustentação vira texto/slug (contrato, biblioteca e querySustentacaoSchema com idSlug; opções do dim_chamado no mesmo corte de lerChamados), na branch feature/097-l7a-sustentacao-equipe a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052f." · etapa de outra delegação; continua no pedido
- "E4.6 (node-backend): K-282, as provas de GRANT dos testes .pg geram a lista de colunas proibidas de COLUNAS_PESSOA (lgpd.ts) em vez de lista à mão, na branch fix/k282-grant-colunas-pessoa a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E4.7 (react-frontend): L7b do plano, na branch do L7a (feature/097-l7a-sustentacao-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052f): codec da web com a equipe da Sustentação por slug e ids antigos como apelido (A1 e A2 do review do L7a)." · etapa de outra delegação; continua no pedido
- "E4.8 (react-frontend): L6 do plano, parte web: BarraFiltros, codec e táticas usam opcoes.tipos e as prioridades presentes, sem a lista fixa TIPOS_FILTRO, branch feature/097-l6-tipos-reais-web, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.5 (node-backend): K-272, o teste pg do filtro por tipo ajustado ao agrupamento por categoria (feito). - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr view feature/097-l5-resumo-equipe --json state` · espera: contém 'MERGED'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
