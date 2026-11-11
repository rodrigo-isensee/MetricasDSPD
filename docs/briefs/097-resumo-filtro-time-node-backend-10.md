Agente destino: forge:node-backend
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: feature/097-l2-apontamento-equipe   Base: develop   Base-sha: 1d697d6a0d8268df66f94d9041f949ca32e2862d
Etapa: codigo   Cobre: E2.1

## Objetivo
L2 do pedido 097 (parte servidor do E2): a aba Apontamento passa a filtrar por equipe em vez de pessoa; o cartão de capacidade por pessoa fica igual (decisão do dono). Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch `feature/097-l2-apontamento-equipe` (criada da develop 1d697d6a0d8268df66f94d9041f949ca32e2862d, sem tracking).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md`, seções 0, 1 ("O que falta (back-end)", itens 1 a 5), 6 (linha L2) e 10.
- `/home/rodrigoisensee/MetricasDSPD-056/server/src/modulos/apontamento/servico.ts` e `server/src/modulos/metricas/schemas.ts` (linha 10, o formato do `equipe` do fluxo).

## Entregar
- "E2.1 (node-backend): L2 do plano, a equipe no apontamento (parte servidor do E2: GRANT de dim_card.equipe, filtro equipe e opcoes.equipes), na branch feature/097-l2-apontamento-equipe, worktree /home/rodrigoisensee/MetricasDSPD-056." (E2.1)
- (E2) (E2.1) Os itens 1 a 5 da seção 1 do plano: GRANT de `dim_card.equipe` ao papel da aba (por coluna, nada de coluna de pessoa a mais); `equipe` em `lerLinhas` e `lerCardsIncompletos` (`COALESCE(c.equipe, p.equipe)`, id `slug(nome)` ou `sem-time`); parâmetro opcional `equipe` na consulta, no mesmo formato e validação do fluxo; `opcoes.equipes` opcional na resposta e no contrato; nenhum bloco agregado por equipe (estender `server/tests/times-sem-comparacao.test.ts`). O parâmetro `pessoa` continua aceito nesta delegação (o front sai dele no L3). Testes da biblioteca, da rota e do .pg; `pnpm run pronto` da raiz da worktree com no máximo 2 workers, em segundo plano, esperando o fim. Commit com `Cartão: K-273` e a linha `teto:` se passar de 150 linhas (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/097-l2-apontamento-equipe` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: server/, docs/contratos/, docs/api/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até 1c30f7a5c5df82fbefa44dd76e707c6254e13def77276844c013ba7c14dee9c0 (12 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024
- aplicáveis a E2.1 (copiadas literalmente):
- - 2026-11-11 13:35: DECISÃO DO DONO (literal): "capacidade fica igual". P-097-3 respondida: o cartão de capacidade por pessoa (AP-CAPACIDADE-PESSOA) não muda; E2 fica só a troca do filtro Pessoa pelo filtro Time na aba Apontamento. P-097-4 (A: Acelerato com todos os times; B: só SSC visto no BusinessMap) segue aberta.
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo "Equipe", na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4 do plano, equipe opcional nas duas tendências (parte servidor do E1), na branch feature/097-l4-tendencia-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E2.2 (security-engineer): parecer de segurança do L2 (banco: permissão por coluna; recorte de pessoas por equipe)." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.5 (node-backend): K-272, o teste server/tests/apontamento-rota.pg.test.ts (caso do filtro por tipo ponta a ponta) ainda espera um type_id por opção; ajustar ao agrupamento por categoria, na branch fix/k272-teste-pg a partir da develop, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 log -1 --format=%B origin/feature/097-l2-apontamento-equipe` · espera: contém 'Cartão: K-273'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
