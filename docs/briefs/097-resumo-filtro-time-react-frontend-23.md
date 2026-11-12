Agente destino: forge:react-frontend
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: feature/097-l8b-recolher-paineis   Base: develop   Base-sha: 84001e7a1f4b47223b7f356440ad3310480310d0
Etapa: codigo   Cobre: E5.3

## Objetivo
L8b do pedido 097 (E5): o mecanismo do L8a passa a valer em todos os painéis, com as ressalvas que a UX e o review do L8a deixaram.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/097-revisao-l8a.md` (M1, M2, B1 a B3).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-plano-e5-e7.md` (a linha do L8b).
- O parecer de review do L8a na branch, por `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/097-l8a-recolher:` seguido do caminho (pasta reviews de docs, arquivo 097-l8a-recolher.md): A1 a A3.

## Entregar
- "E5.3 (react-frontend): L8b, recolher ligado nos painéis com as ressalvas do L8a, branch feature/097-l8b-recolher-paineis a partir do L8a, worktree /home/rodrigoisensee/MetricasDSPD-052d." (E5.3)
- (E5) (E5.3) Na worktree `/home/rodrigoisensee/MetricasDSPD-052d`, `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin feature/097-l8a-recolher` e `git -C /home/rodrigoisensee/MetricasDSPD-052d checkout -b feature/097-l8b-recolher-paineis origin/feature/097-l8a-recolher`; se falhar pelo config.lock, `git checkout` da branch e `git status` vazio; não remova o lock. Provedor e Restaurar em Resumo, Operacional, Tático, Estratégico, Sustentação e Apontamento; `recolhivel={false}` nos KPIs; `resumoRecolhido` onde a especificação pede. Fechar M1, M2, B1 e B2 da UX e A1 a A3 do review do L8a (A3: a chave em `docs/tecnica/arquitetura-front.md`). Testes do web com `VITEST_MAX_WORKERS=2`, `format:check` e a cobertura da web em 100%. Commit com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito) e push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push -u origin HEAD:refs/heads/feature/097-l8b-recolher-paineis` (`github.com` em allowed_domains); commit e push em chamadas separadas. Sem PR.
- (E1) (E2) (E3) (E4) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: web/, e2e/, docs/tecnica/arquitetura-front.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até 1c30f7a5c5df82fbefa44dd76e707c6254e13def77276844c013ba7c14dee9c0 (12 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024, ADR 0013
- aplicáveis a E5.3 (copiadas literalmente):
- - 2026-11-11 13:45: DECISÃO DO DONO (literal): "A". P-097-5 em parte: o botão de recolher vale para todo cartão de gráfico dos painéis (E5). Os 10 maiores com "ver todos" no AP-PROJETO seguem sem resposta.
- - 2026-11-11 14:05: DECISÃO DO DONO (literal): "faca suas recomendacoes". Valem as recomendações em aberto: protótipo docs/ux/prototipos/097-filtros.html aceito por delegação, sem o dono abrir; Q-1 busca também em listas curtas; Q-2 rótulo "Time" em todo o produto; Q-3 nota "Outra área" junto do cartão de capacidade; Q-5 e P-097-C opções de toda a base (não só do período); P-097-A time pelo card da hora, "Sem time" para card sem time; P-097-B Tipo = categoria do contrato, só as que têm card; E5 com os 10 projetos maiores e "ver todos" no AP-PROJETO. Próximo: segunda rodada do UX para E5 (recolher cartão) e o plano de lotes com o tech-lead.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo "Equipe", na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4, equipe opcional nas tendências (feito, PR 333)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push dos documentos da segunda rodada do UX, que o ux-designer não pode commitar, na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.6 (react-frontend): L5, filtro Equipe em cada bloco do Resumo (feito, PR 350)." · etapa de outra delegação; continua no pedido
- "E1.7 (software-architect): plano técnico de E5 (recolher todo cartão de gráfico lembrando a escolha; os 10 maiores com ver todos no AP-PROJETO) e E7 (filtro Setor nos painéis do fluxo, 7 setores), em lotes com dono e dependências, em docs/analises/097-plano-e5-e7.md." · etapa de outra delegação; continua no pedido
- "E1.8 (react-frontend): K-293, ajustes do Resumo depois do L5 (data-testid por bloco, estados vazio e carregando anunciados, nome acessível do Limpar por bloco, laço do CA-6 no e2e que falha sem equipe pequena), branch fix/k293-resumo-equipe-a11y, worktree /home/rodrigoisensee/MetricasDSPD-052f; merge depois da release 101." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): L2, a equipe no apontamento, parte servidor (feito, PR 337)." · etapa de outra delegação; continua no pedido
- "E2.2 (security-engineer): parecer de segurança do L2 (banco: permissão por coluna; recorte de pessoas por equipe)." · etapa de outra delegação; continua no pedido
- "E2.3 (react-frontend): L3, Equipe no lugar de Pessoa no Apontamento (PR 345)." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): L1, busca no FiltroMulti (feito, PR 336)." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.5 (ux-designer): revisão da interface implementada, por lote do 097, em docs/ux/097-revisao-<lote>.md." · etapa de outra delegação; continua no pedido
- "E3.6 (react-frontend): K-278, ressalvas da revisão de UX do L1 e o A5 do review (feito, PR 341)." · etapa de outra delegação; continua no pedido
- "E3.7 (react-frontend): K-284, aviso Marcada fora da região viva no clique e no Esc (feito, PR 346)." · etapa de outra delegação; continua no pedido
- "E4.1 (node-backend): L6, parte servidor, tipos reais em opcoes.tipos (feito, PR 330)." · etapa de outra delegação; continua no pedido
- "E4.2 (node-backend): K-279 (feito, PR 335)." · etapa de outra delegação; continua no pedido
- "E4.3 (node-backend): K-280 (feito, PR 339)." · etapa de outra delegação; continua no pedido
- "E4.4 (node-backend): teste do GRANT (feito, PR 340)." · etapa de outra delegação; continua no pedido
- "E4.5 (node-backend): L7a, equipe da Sustentação por slug (feito, PR 344)." · etapa de outra delegação; continua no pedido
- "E4.6 (node-backend): K-282, provas de GRANT pela lista COLUNAS_PESSOA (feito, PR 349)." · etapa de outra delegação; continua no pedido
- "E4.7 (react-frontend): L7b, codec da web por slug (feito, PR 344)." · etapa de outra delegação; continua no pedido
- "E4.8 (react-frontend): L6 web, Tipo e prioridades do dado real (PR 353)." · etapa de outra delegação; continua no pedido
- "E4.9 (node-backend): K-288, nome de equipe estável por slug (PR 352)." · etapa de outra delegação; continua no pedido
- "E5.1 (react-frontend): L8a do plano E5 e E7, o mecanismo de recolher cartão (CartaoMetrica e Recolhidos.tsx com a chave metricas-dspd:recolhidos:v1, CA-25 a CA-32), branch feature/097-l8a-recolher, worktree /home/rodrigoisensee/MetricasDSPD-052d; merge depois da release 101." · etapa de outra delegação; continua no pedido
- "E5.2 (react-frontend): L9 do plano E5 e E7, os 10 maiores com ver todos no AP-PROJETO (dezMaiores com teste de propriedade, CA-33 a CA-38), branch feature/097-l9-dez-maiores, worktree /home/rodrigoisensee/MetricasDSPD-056; merge depois da release 101." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO (feito)." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.5 (node-backend): K-272, o teste pg do filtro por tipo ajustado ao agrupamento por categoria (feito). - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log -1 --format=%B origin/feature/097-l8b-recolher-paineis` · espera: contém 'Cartão: K-273'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
