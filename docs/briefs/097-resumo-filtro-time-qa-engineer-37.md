Agente destino: forge:qa-engineer
Pedido: 097-resumo-filtro-time
Tipo: qa
Branch: fix/k288-equipe-slug-estavel   Base: develop   Base-sha: 2c1e1fac7aaec75e1ac067043cb8743bc83bb0fb
Etapa: qa   Cobre: E3.3
Revisar-sha: 62d00ef3bddf211bcc1a189e203187f0b5eaa650

## Objetivo
K-288 do 097: opções de equipe da Sustentação com dois nomes de mesmo slug ficam com o primeiro de forma estável (`ORDER BY equipe COLLATE "C"` e helper `equipesPorSlug`). Branch `fix/k288-equipe-slug-estavel`, head 62d00ef3bddf211bcc1a189e203187f0b5eaa650. Classe N: QA e review, em série. Um teste existente mudou a expectativa (do último nome para o primeiro).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff origin/develop...62d00ef3bddf211bcc1a189e203187f0b5eaa650`.

## Entregar
- "E3.3 (qa-engineer): QA por lote do 097." (E3.3) Nesta delegação, o QA do K-288.
- (E4) (E3.3) Conferir que a escolha é estável nas duas ordens do banco, que o contrato e o corte não mudaram e que uma mutação (voltar a manter o último nome) derruba um teste (restaurada). Parecer novo pela ferramenta Write com `commit: 62d00ef3bddf211bcc1a189e203187f0b5eaa650`, o veredito, a contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado, ou vazio. Nada contra a base real nem `.env*`; testes dentro de `server/` com `VITEST_MAX_WORKERS=2`; o `.pg` roda no CI. Commit só do parecer com `Cartão: K-288` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito); antes de gravar o parecer, `git -C /home/rodrigoisensee/MetricasDSPD-056 fetch origin fix/k288-equipe-slug-estavel` e `git -C /home/rodrigoisensee/MetricasDSPD-056 pull --rebase --autostash origin fix/k288-equipe-slug-estavel`, sem `--force`; push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/fix/k288-equipe-slug-estavel` (`github.com` em allowed_domains); commit e push em chamadas separadas; use sempre `origin fix/k288-equipe-slug-estavel` explícito. Sem PR, sem merge.
- (E1) (E2) (E3) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-k288-equipe-slug-estavel.md, server/ (a pasta é o escopo da entrega revisada, para a conferência; o portão só grava o parecer)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até 1c30f7a5c5df82fbefa44dd76e707c6254e13def77276844c013ba7c14dee9c0 (12 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024, ADR 0013
- aplicáveis a E3.3 (copiadas literalmente):
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo "Equipe", na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4, equipe opcional nas tendências (feito, PR 333)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push dos documentos da segunda rodada do UX, que o ux-designer não pode commitar, na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.6 (react-frontend): L5 do plano, filtro Equipe dentro de cada bloco do Resumo (CA-1 a CA-6), branch feature/097-l5-resumo-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052f." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): L2, a equipe no apontamento, parte servidor (feito, PR 337)." · etapa de outra delegação; continua no pedido
- "E2.2 (security-engineer): parecer de segurança do L2 (banco: permissão por coluna; recorte de pessoas por equipe)." · etapa de outra delegação; continua no pedido
- "E2.3 (react-frontend): L3 do plano, Equipe no lugar de Pessoa no Apontamento (CA-7 a CA-9, Q-3), branch feature/097-l3-apontamento-equipe-web, worktree /home/rodrigoisensee/MetricasDSPD-052h." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): L1, busca no FiltroMulti (feito, PR 336)." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.5 (ux-designer): revisão da interface implementada, por lote do 097, em docs/ux/097-revisao-<lote>.md." · etapa de outra delegação; continua no pedido
- "E3.6 (react-frontend): K-278, ressalvas da revisão de UX do L1 e o A5 do review (feito, PR 341)." · etapa de outra delegação; continua no pedido
- "E3.7 (react-frontend): K-284, aviso Marcada fora da região viva no clique e no Esc (feito, PR 346)." · etapa de outra delegação; continua no pedido
- "E4.1 (node-backend): L6, parte servidor, tipos reais em opcoes.tipos (feito, PR 330)." · etapa de outra delegação; continua no pedido
- "E4.2 (node-backend): K-279, opções de filtro com o mesmo corte das listas (feito, PR 335)." · etapa de outra delegação; continua no pedido
- "E4.3 (node-backend): K-280, condição única do corte de cards e chamados (feito, PR 339)." · etapa de outra delegação; continua no pedido
- "E4.4 (node-backend): correção do teste do GRANT que deixou a develop vermelha depois do PR 337 (feito, PR 340)." · etapa de outra delegação; continua no pedido
- "E4.5 (node-backend): L7a, equipe da Sustentação por slug (feito, PR 344)." · etapa de outra delegação; continua no pedido
- "E4.6 (node-backend): K-282, provas de GRANT pela lista COLUNAS_PESSOA (feito, PR 349)." · etapa de outra delegação; continua no pedido
- "E4.7 (react-frontend): L7b, codec da web por slug (feito, PR 344)." · etapa de outra delegação; continua no pedido
- "E4.8 (react-frontend): L6 do plano, parte web: BarraFiltros, codec e táticas usam opcoes.tipos e as prioridades presentes, sem a lista fixa TIPOS_FILTRO, branch feature/097-l6-tipos-reais-web, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E4.9 (node-backend): K-288, opções de equipe da Sustentação com dois nomes de mesmo slug ficam com o primeiro de forma estável, sem depender da collation (A5 do review do L7a), branch fix/k288-equipe-slug-estavel, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO (feito)." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.5 (node-backend): K-272, o teste pg do filtro por tipo ajustado ao agrupamento por categoria (feito). - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/fix/k288-equipe-slug-estavel:docs/qa/097-k288-equipe-slug-estavel.md` · espera: contém 'commit: 62d00ef3bddf211bcc1a189e203187f0b5eaa650'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
