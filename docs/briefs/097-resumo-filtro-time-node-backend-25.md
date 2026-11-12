Agente destino: forge:node-backend
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: test/k283-provas-pessoa-helper   Base: develop   Base-sha: 022724427a2faeed276ff4028f49efb4794f8c43
Etapa: codigo   Cobre: E4.10

## Objetivo
O K-282 (PR 349) passou as provas de GRANT por coluna de pessoa a um helper sobre a lista COLUNAS_PESSOA. O review dele (A1) achou outras provas de pessoa escritas à mão nos testes .pg; elas passam ao mesmo helper, para que uma coluna nova de pessoa entre em todas as provas de uma vez.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/develop --stat` e o parecer de review do K-282 na develop: `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/develop:docs/reviews/097-k282-grant-colunas-pessoa.md` (achado A1).

## Entregar
- "E4.10 (node-backend): K-283, as demais provas de pessoa à mão nos testes .pg passam ao helper de COLUNAS_PESSOA (A1 do review do K-282), branch test/k283-provas-pessoa-helper, worktree /home/rodrigoisensee/MetricasDSPD-056d." (E4.10)
- (E4) (E4.10) Nos testes `server/tests/papeis.pg` (linha 28), `apontamento.pg` (91 e 92), `projetor-businessmap-qa.pg` (163) e `apontamento-rota.pg` (181 e 317), ou onde estiverem os .pg com esses nomes em `server/`, trocar a lista de colunas de pessoa escrita à mão pelo helper de COLUNAS_PESSOA do K-282, sem mudar o que cada prova afirma. Uma mutação (tirar uma coluna da lista) faz cair as provas trocadas; restaure. Rodar da raiz da worktree `pnpm run pronto`. Antes de editar: `git -C /home/rodrigoisensee/MetricasDSPD-056d fetch origin develop` e `git -C /home/rodrigoisensee/MetricasDSPD-056d checkout -b test/k283-provas-pessoa-helper origin/develop`; o config.lock antigo pode deixar a branch criada e staged que é só a develop: se `git -C /home/rodrigoisensee/MetricasDSPD-056d diff --cached --quiet test/k283-provas-pessoa-helper` sai 0, rode `git -C /home/rodrigoisensee/MetricasDSPD-056d checkout test/k283-provas-pessoa-helper` (status fica vazio); senão pare e relate. Sem remover o lock, stash ou reset. Commit com `Cartão: K-283` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito por arquivo) e push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056d push -u origin HEAD:refs/heads/test/k283-provas-pessoa-helper` (`github.com` em allowed_domains). Sem PR, sem merge (o merge espera a release 101).
- (E1) (E2) (E3) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até 1c30f7a5c5df82fbefa44dd76e707c6254e13def77276844c013ba7c14dee9c0 (12 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024, ADR 0013
- aplicáveis a E4.10 (copiadas literalmente):
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo (resumo)." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4, equipe opcional nas tendências (feito, PR 333)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): commit e push dos documentos da segunda rodada do UX, que o ux-designer não pode commitar, na branch (resumo)." · etapa de outra delegação; continua no pedido
- "E1.6 (react-frontend): L5, filtro Equipe em cada bloco do Resumo (feito, PR 350)." · etapa de outra delegação; continua no pedido
- "E1.7 (software-architect): plano técnico de E5 (recolher todo cartão de gráfico lembrando a escolha; os 10 maiores com ver todos no (resumo)." · etapa de outra delegação; continua no pedido
- "E1.8 (react-frontend): K-293, ajustes do Resumo depois do L5 (data-testid por bloco, estados vazio e carregando anunciados, nome (resumo)." · etapa de outra delegação; continua no pedido
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
- "E5.1 (react-frontend): L8a do plano E5 e E7, o mecanismo de recolher cartão (CartaoMetrica e Recolhidos.tsx com a chave (resumo)." · etapa de outra delegação; continua no pedido
- "E5.2 (react-frontend): L9 do plano E5 e E7, os 10 maiores com ver todos no AP-PROJETO (dezMaiores com teste de propriedade, CA-33 a (resumo)." · etapa de outra delegação; continua no pedido
- "E5.3 (react-frontend): L8b, recolher ligado nos painéis com as ressalvas do L8a, branch feature/097-l8b-recolher-paineis a partir do L8a (resumo)." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO (feito)." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.5 (node-backend): K-272, o teste pg do filtro por tipo ajustado ao agrupamento por categoria (feito). - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch, como nos pedidos 092 a 096; o PR continua do tech-lead." · etapa de outra delegação; continua no pedido
- "E7.1 (node-backend): L10a, dicionário de setores e opcoes.setores, branch feature/097-l10a-setor-dicionario, worktree (resumo)." · etapa de outra delegação; continua no pedido
- "E7.2 (security-engineer): parecer de segurança do L10a (fronteira do arquivo de domínio do pedido 069, guarda de sobrenome)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d log --oneline -1 origin/test/k283-provas-pessoa-helper` · espera: contém 'K-283'
- PQ-2 (cmd): `pnpm run pronto` · espera: contém 'pronto'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
