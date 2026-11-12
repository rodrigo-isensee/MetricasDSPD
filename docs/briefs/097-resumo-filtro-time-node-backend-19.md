Agente destino: forge:node-backend
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: feature/097-l7a-sustentacao-equipe   Base: develop   Base-sha: 4b1e31225f838c25db08b6b82b5953d64312b856
Etapa: codigo   Cobre: E4.5

## Objetivo
Volta 1 do L7a do pedido 097 (equipe da Sustentação por slug). O QA reprovou por um defeito alto: `server/tests/api.sistemico-intensivo.test.ts:44` ainda trata `equipe=xpto` como inválido na Sustentação, e agora é slug válido (200), o que quebra 14 testes do server. Além disso, a develop recebeu o K-280 (PR 339), que move o corte de chamados para `server/src/modulos/referencia/cortes.ts`; a branch precisa trazer a develop e reusar essa constante.

## Ler
- O parecer de QA na branch, por `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/097-l7a-sustentacao-equipe:` seguido do caminho (pasta qa de docs, arquivo 097-l7a-sustentacao-equipe.md): o A1.
- `server/tests/api.sistemico-intensivo.test.ts` (linha 44) e, depois do merge da develop, `server/src/modulos/referencia/cortes.ts` e `referencia/repositorio.ts`.

## Entregar
- "E4.5 (node-backend): L7a do plano, a equipe da Sustentação vira texto/slug (contrato, biblioteca e querySustentacaoSchema com idSlug; opções do dim_chamado no mesmo corte de lerChamados), na branch feature/097-l7a-sustentacao-equipe a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052f." (E4.5) Nesta delegação, a volta 1.
- (E4) (E4.5) Na worktree `/home/rodrigoisensee/MetricasDSPD-052f`: `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --rebase --autostash origin feature/097-l7a-sustentacao-equipe`, depois `git -C /home/rodrigoisensee/MetricasDSPD-052f fetch origin develop` e `git -C /home/rodrigoisensee/MetricasDSPD-052f merge origin/develop` (commit de merge; sem rebase da branch publicada, sem `--force`); conflitos: resolva mantendo o L7a e a constante única do K-280. `lerEquipesAC` passa a usar `CORTE_CHAMADOS` de `referencia/cortes.ts` (nenhuma cópia do corte). Corrigir o A1: em `api.sistemico-intensivo.test.ts:44` a equipe inválida da Sustentação vira uma forma que o `idSlug` recusa (por exemplo `Equipe_Outra`), sem afrouxar o teste. Rodar dentro de `server/` (não da raiz) os testes do server com `VITEST_MAX_WORKERS=2` até 0 falhas, e os de `packages/contratos` e `packages/metricas`; o `pnpm run pronto` da raiz da 052f, se a trava de suíte deixar em 15 minutos (senão relate; o CI prova). Commit com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito) e push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/097-l7a-sustentacao-equipe` (`github.com` em allowed_domains); commit e push em chamadas separadas. Sem PR.
- (E1) (E2) (E3) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: server/, packages/, docs/api/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até 1c30f7a5c5df82fbefa44dd76e707c6254e13def77276844c013ba7c14dee9c0 (12 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024, ADR 0013
- aplicáveis a E4.5 (copiadas literalmente):
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

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
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.5 (ux-designer): revisão da interface implementada, por lote do 097, em docs/ux/097-revisao-<lote>.md." · etapa de outra delegação; continua no pedido
- "E3.6 (react-frontend): K-278, ressalvas da revisão de UX do L1 (A1 a A8 de docs/ux/097-revisao-l1.md) e o A5 do review (teste com queryByLabelText exato), na branch fix/k278-ux-busca a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E4.1 (node-backend): L6 do plano, parte servidor (opção T-A: tipos presentes nas stories, mapeados para os ids de TIPO_ID, em opcoes.tipos), na branch feature/097-l6-tipos-reais, worktree /home/rodrigoisensee/MetricasDSPD-056d." · etapa de outra delegação; continua no pedido
- "E4.2 (node-backend): K-279, opções de filtro do L6 com o mesmo corte das listas (prioridades com o recorte de lerChamados, tipos com criado_em não nulo, teste de prioridades vazias), na branch fix/k279-opcoes-corte a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056d." · etapa de outra delegação; continua no pedido
- "E4.3 (node-backend): K-280, condição única do corte de cards e chamados (lerTiposBM e lerPrioridadesAC reusam a condição de lerCards e lerChamados), na branch fix/k280-corte-unico a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056d." · etapa de outra delegação; continua no pedido
- "E4.4 (node-backend): develop vermelha no job banco depois do PR 337: o teste apontamento-rota.pg.test.ts:253 espera 42501 para responsavel_id em dim_card, coluna que não existe ali (42703); corrigir só o teste, na branch fix/097-l2-teste-grant a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E4.6 (node-backend): K-282, as provas de GRANT dos testes .pg geram a lista de colunas proibidas de COLUNAS_PESSOA (lgpd.ts) em vez de lista à mão, na branch fix/k282-grant-colunas-pessoa a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.5 (node-backend): K-272, o teste server/tests/apontamento-rota.pg.test.ts (caso do filtro por tipo ponta a ponta) ainda espera um type_id por opção; ajustar ao agrupamento por categoria, na branch fix/k272-teste-pg a partir da develop, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%B origin/feature/097-l7a-sustentacao-equipe` · espera: contém 'Cartão: K-273'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
