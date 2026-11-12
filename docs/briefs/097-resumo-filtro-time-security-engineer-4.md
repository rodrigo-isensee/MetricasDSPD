Agente destino: forge:security-engineer
Pedido: 097-resumo-filtro-time
Tipo: review
Branch: feature/k286-mapa-diario-equipe   Base: develop   Base-sha: f3dd14c38e460c370f53617fcdf81a292e3f626f
Etapa: seguranca   Cobre: E2.2
Revisar-sha: 62a622abf9abecc9813c01e3a6ca015e21d21cb4

## Objetivo
K-286 (branch `feature/k286-mapa-diario-equipe`, head 62a622abf9abecc9813c01e3a6ca015e21d21cb4): o mapa diário do Apontamento passa a ser recortado pela Equipe. Revalidação da volta 1 (só web); anterior em dfba8a37.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff origin/develop...62a622abf9abecc9813c01e3a6ca015e21d21cb4`.

## Entregar
- "E2.2 (security-engineer): parecer de segurança do L2 (banco: permissão por coluna; recorte (resumo)." (E2.2) Nesta delegação, o parecer de segurança do K-286 (mesmo papel, outro lote).
- (E2) (E2.2) Conferir: a resposta da API segue sem nome nem coluna de pessoa (só Pessoa n); nenhum GRANT novo; sem comparação entre equipes; o recorte por equipe pequena e a reidentificação de Pessoa n (o mínimo de pessoas está com o dono): dizer se o delta muda o veredito. Parecer novo pela ferramenta Write em `docs/security/097-k286-mapa-diario-equipe.md` com `branch: feature/k286-mapa-diario-equipe`, `commit: 62a622abf9abecc9813c01e3a6ca015e21d21cb4`, o veredito e `## Achados` só com linhas de achado, ou vazio. Commit só do parecer com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito); antes, `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --rebase --autostash origin feature/k286-mapa-diario-equipe`, sem `--force`; push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/k286-mapa-diario-equipe` (`github.com` em allowed_domains). Sem PR, sem merge.
- (E1) (E3) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/security/097-k286-mapa-diario-equipe.md, packages/metricas/src/businessmap/apontamento/, web/src/features/apontamento/, server/src/, docs/api/ (escopo da entrega revisada, para a conferência; o portão só grava o parecer)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até dbedd42cc58697f4186c0e45113be62710156a118b074a523974a0e35e263aac (13 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024, ADR 0013
- aplicáveis a E2.2 (copiadas literalmente):
- - 2026-11-11 13:35: DECISÃO DO DONO (literal): "capacidade fica igual". P-097-3 respondida: o cartão de capacidade por pessoa (AP-CAPACIDADE-PESSOA) não muda; E2 fica só a troca do filtro Pessoa pelo filtro Time na aba Apontamento. P-097-4 (A: Acelerato com todos os times; B: só SSC visto no BusinessMap) segue aberta.
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de (resumo)." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo (resumo)." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4, equipe opcional nas tendências (feito, PR 333)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push dos documentos da segunda rodada do UX, que o ux-designer não pode commitar, na branch (resumo)." · etapa de outra delegação; continua no pedido
- "E1.6 (react-frontend): L5, filtro Equipe em cada bloco do Resumo (feito, PR 350)." · etapa de outra delegação; continua no pedido
- "E1.7 (software-architect): plano técnico de E5 (recolher todo cartão de gráfico lembrando a escolha; os 10 maiores com ver todos no (resumo)." · etapa de outra delegação; continua no pedido
- "E1.8 (react-frontend): K-293, ajustes do Resumo depois do L5 (data-testid por bloco, estados vazio e carregando anunciados, nome (resumo)." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): L2, a equipe no apontamento, parte servidor (feito, PR 337)." · etapa de outra delegação; continua no pedido
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
- "E4.10 (node-backend): K-283, as demais provas de pessoa à mão nos testes .pg passam ao (resumo)." · etapa de outra delegação; continua no pedido
- "E4.11 (node-backend): K-286, o mapa diário do Apontamento recortado pela Equipe (decisão do (resumo)." · etapa de outra delegação; continua no pedido
- "E4.12 (react-frontend): K-286, parte web: o mapa diário do Apontamento deixa de dizer Não (resumo)." · etapa de outra delegação; continua no pedido
- "E5.1 (react-frontend): L8a do plano E5 e E7, o mecanismo de recolher cartão (CartaoMetrica e Recolhidos.tsx com a chave (resumo)." · etapa de outra delegação; continua no pedido
- "E5.2 (react-frontend): L9 do plano E5 e E7, os 10 maiores com ver todos no AP-PROJETO (dezMaiores com teste de propriedade, CA-33 a (resumo)." · etapa de outra delegação; continua no pedido
- "E5.3 (react-frontend): L8b, recolher ligado nos painéis com as ressalvas do L8a, branch feature/097-l8b-recolher-paineis a partir do L8a (resumo)." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO (feito)." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.5 (node-backend): K-272, o teste pg do filtro por tipo ajustado ao agrupamento por categoria (feito). - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido
- "E7.1 (node-backend): L10a, dicionário de setores e opcoes.setores, branch feature/097-l10a-setor-dicionario, worktree (resumo)." · etapa de outra delegação; continua no pedido
- "E7.2 (security-engineer): parecer de segurança do L10a (fronteira do arquivo de domínio do (resumo)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/k286-mapa-diario-equipe:docs/security/097-k286-mapa-diario-equipe.md` · espera: contém 'commit: 62a622abf9abecc9813c01e3a6ca015e21d21cb4'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
