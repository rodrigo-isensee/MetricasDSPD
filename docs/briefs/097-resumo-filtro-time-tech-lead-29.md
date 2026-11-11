Agente destino: forge:tech-lead
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: feature/097-l6-tipos-reais   Base: develop   Base-sha: 1d697d6a0d8268df66f94d9041f949ca32e2862d
Etapa: codigo   Cobre: E3.4

## Objetivo
Merge do PR 330 (L6 servidor do 097, opções de Tipo e Prioridade do dado real) na develop: branch `feature/097-l6-tipos-reais`, worktree `/home/rodrigoisensee/MetricasDSPD-056d`, código 4bae9c60c8ca32a512a215f1a525d8f254f0be4a, QA (97c46f2f) e review (a6984b8d) aprovados, 19 checks verdes. A promoção da develop para a homolog terminou (PR 328), então a develop está liberada. Outros PRs (329 e o do L2a do 099) também estão entrando na develop agora, então o PR 330 pode ficar BEHIND. O dono autorizou às 17:51 o merge do time até a homolog; a main é só dele. O pedido de permissão do merge pode aparecer para aprovação humana: se for negado, pare e relate.

## Ler
- O PR 330 pelo gh (estado, `mergeStateStatus`, checks e head).

## Entregar
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." (E3.4) Nesta delegação, o merge do PR 330 na develop, pela autorização do dono de 17:51 (merge até a homolog é do time).
- (E4) (E3.4) Conferir `mergeStateStatus`: se vier BEHIND, rodar `gh pr update-branch feature/097-l6-tipos-reais`, conferir que o que entrou da develop não toca os arquivos de `server/` e `docs/api/` do diff do L6 (se tocar, pare e relate) e esperar os checks do head novo em laços de até 170 s (laço num script do scratchpad), relatando cada um. Com todos verdes e CLEAN, rodar da worktree `forge-check pr 097-resumo-filtro-time --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref feature/097-l6-tipos-reais --base develop` e confirmar `veredito: aprovado`; mesclar pelo nome da branch, num comando sozinho, sem `$`, `;` nem `echo`: `gh pr merge feature/097-l6-tipos-reais --squash --match-head-commit` seguido do sha completo do head, nunca `--admin`. Depois, confirmar o sha do merge na develop e esperar o CI da develop desse sha, dizendo no fim se ficou verde.
- (E1) (E2) (E3) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até 1c30f7a5c5df82fbefa44dd76e707c6254e13def77276844c013ba7c14dee9c0 (12 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024
- aplicáveis a E3.4 (copiadas literalmente):
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo "Equipe", na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4 do plano, equipe opcional nas duas tendências (parte servidor do E1), na branch feature/097-l4-tendencia-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push dos documentos da segunda rodada do UX, que o ux-designer não pode commitar, na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): L2 do plano, a equipe no apontamento (parte servidor do E2: GRANT de dim_card.equipe, filtro equipe e opcoes.equipes), na branch feature/097-l2-apontamento-equipe, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E2.2 (security-engineer): parecer de segurança do L2 (banco: permissão por coluna; recorte de pessoas por equipe)." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.5 (ux-designer): revisão da interface implementada, por lote do 097, em docs/ux/097-revisao-<lote>.md." · etapa de outra delegação; continua no pedido
- "E4.1 (node-backend): L6 do plano, parte servidor (opção T-A: tipos presentes nas stories, mapeados para os ids de TIPO_ID, em opcoes.tipos), na branch feature/097-l6-tipos-reais, worktree /home/rodrigoisensee/MetricasDSPD-056d." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.5 (node-backend): K-272, o teste server/tests/apontamento-rota.pg.test.ts (caso do filtro por tipo ponta a ponta) ainda espera um type_id por opção; ajustar ao agrupamento por categoria, na branch fix/k272-teste-pg a partir da develop, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr view feature/097-l6-tipos-reais --json state` · espera: contém 'MERGED'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
