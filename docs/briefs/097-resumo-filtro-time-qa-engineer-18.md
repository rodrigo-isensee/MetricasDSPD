Agente destino: forge:qa-engineer
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: feature/097-l2-apontamento-equipe   Base: develop   Base-sha: 1d697d6a0d8268df66f94d9041f949ca32e2862d
Etapa: codigo   Cobre: E3.3

## Objetivo
L2 do pedido 097, parte servidor do E2 (Equipe no Apontamento): branch `feature/097-l2-apontamento-equipe`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, código em bca89b999ec509ffbdc118e97899bbd65878ed09, base develop 1d697d6a0d8268df66f94d9041f949ca32e2862d. GRANT por coluna de `dim_card.equipe` para o papel da API, filtro `equipe` (id por slug do nome ou `sem-time`, de volta ao nome por SELECT DISTINCT) e `opcoes.equipes` na resposta, contrato aditivo. A conferência da entrega acusou 4 arquivos fora do escopo declarado no brief do autor (o brief declarou `docs/contratos/` em vez de `packages/`, erro do Jarvis): `packages/contratos/src/apontamento.ts` (+3), `packages/metricas/src/businessmap/apontamento/filtros.ts` (+1), `tipos.ts` (4) e o teste da biblioteca (+18). O autor não parou para relatar antes de tocá-los. Os portões cobrem o diff inteiro, esses arquivos incluídos. Classe N pela ferramenta, mais segurança pelo gatilho de banco (GRANT por coluna) e de dado de pessoa (recorte de pessoas por equipe); em série pelo R-TETO: segurança, QA, review.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff 1d697d6a0d8268df66f94d9041f949ca32e2862d bca89b999ec509ffbdc118e97899bbd65878ed09`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md`, a seção da Equipe no Apontamento e a linha L2 da seção 6.

## Entregar
- "E3.3 (qa-engineer): QA por lote do 097." (E3.3) Nesta delegação, o QA do L2 servidor.
- (E2) (E3.3) Conferir pela rota: o filtro `equipe` recorta linhas e cards incompletos (card e pai), `sem-time` pega card sem equipe, repetido ou inválido dá 400, sem `equipe` a resposta é a mesma de antes, `pessoa` continua aceito, `opcoes.equipes` vem da base inteira, a resposta não traz bloco agregado por equipe, `docs/api/openapi.json` bate com a rota. Uma mutação (ignorar o filtro equipe no SQL) que os testes pegam, restaurada antes do commit. O autor relatou o pronto com o código de saída de um `tail`: rode os testes tocados (servidor e `packages/metricas`) e diga quantos passaram. Testes do servidor tocados com no máximo 2 workers (`VITEST_MAX_WORKERS=2`); o teste .pg roda no CI (job banco); nada contra a base real nem `.env*`. Parecer novo pela ferramenta Write, com `pedido: 097-resumo-filtro-time`, `branch: feature/097-l2-apontamento-equipe`, `commit: bca89b999ec509ffbdc118e97899bbd65878ed09`, o veredito, a contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado, ou vazio. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-056 pull --rebase origin feature/097-l2-apontamento-equipe` (outro portão pode ter commitado o parecer dele), sem `--force`; push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/097-l2-apontamento-equipe` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-l2-apontamento-equipe.md, server/, packages/, docs/api/ (as pastas são o escopo da entrega revisada, para a conferência; o portão só grava o parecer)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até 1c30f7a5c5df82fbefa44dd76e707c6254e13def77276844c013ba7c14dee9c0 (12 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024
- aplicáveis a E3.3 (copiadas literalmente):
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
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.5 (ux-designer): revisão da interface implementada, por lote do 097, em docs/ux/097-revisao-<lote>.md." · etapa de outra delegação; continua no pedido
- "E4.1 (node-backend): L6 do plano, parte servidor (opção T-A: tipos presentes nas stories, mapeados para os ids de TIPO_ID, em opcoes.tipos), na branch feature/097-l6-tipos-reais, worktree /home/rodrigoisensee/MetricasDSPD-056d." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.5 (node-backend): K-272, o teste server/tests/apontamento-rota.pg.test.ts (caso do filtro por tipo ponta a ponta) ainda espera um type_id por opção; ajustar ao agrupamento por categoria, na branch fix/k272-teste-pg a partir da develop, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/feature/097-l2-apontamento-equipe:docs/qa/097-l2-apontamento-equipe.md` · espera: contém 'commit: bca89b999ec509ffbdc118e97899bbd65878ed09'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
