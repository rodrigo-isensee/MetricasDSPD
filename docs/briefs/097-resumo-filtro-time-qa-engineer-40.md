Agente destino: forge:qa-engineer
Pedido: 097-resumo-filtro-time
Tipo: qa
Branch: feature/097-l8a-recolher   Base: develop   Base-sha: d01524d44c34959f23f3b129b1dc58ac58adef53
Etapa: qa   Cobre: E3.3
Revisar-sha: 78c80ecee71ea6361578bf97e9d53015bfe132b3

## Objetivo
L8a do 097 (E5): mecanismo de recolher cartão (`Recolhidos.tsx` com a chave `metricas-dspd:recolhidos:v1` validada por zod, teto de 100 códigos; botão Recolher e Expandir no `CartaoMetrica`). Branch `feature/097-l8a-recolher`, head 78c80ecee71ea6361578bf97e9d53015bfe132b3. Classe N com interface: QA, review e UX, em série; o merge espera a release 101.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/develop...78c80ecee71ea6361578bf97e9d53015bfe132b3`.

## Entregar
- "E3.3 (qa-engineer): QA por lote do 097." (E3.3) Nesta delegação, o QA do L8a.
- (E5) (E3.3) Conferir CA-25 a CA-32, a memória corrompida, o teto e o armazenamento bloqueado com teste que prova; uma mutação na validação da chave cai num teste (restaurada); nada de dado de pessoa no armazenamento local. Parecer novo pela ferramenta Write com `commit: 78c80ecee71ea6361578bf97e9d53015bfe132b3`, o veredito, a contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado, ou vazio. Testes do web com `VITEST_MAX_WORKERS=2`; nada contra a base real nem `.env*`. Commit só do parecer com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad com nome próprio, `git add` explícito); antes, `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin feature/097-l8a-recolher` e `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --rebase --autostash origin feature/097-l8a-recolher`, sem `--force`; push em segundo plano com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/097-l8a-recolher` (`github.com` em allowed_domains); commit e push em chamadas separadas. Sem PR, sem merge.
- (E1) (E2) (E3) (E4) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-l8a-recolher.md, web/ (a pasta é o escopo da entrega revisada, para a conferência; o portão só grava o parecer)

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
- "E1.6 (react-frontend): L5, filtro Equipe em cada bloco do Resumo (feito, PR 350)." · etapa de outra delegação; continua no pedido
- "E1.7 (software-architect): plano técnico de E5 (recolher todo cartão de gráfico lembrando a escolha; os 10 maiores com ver todos no AP-PROJETO) e E7 (filtro Setor nos painéis do fluxo, 7 setores), em lotes com dono e dependências, em docs/analises/097-plano-e5-e7.md." · etapa de outra delegação; continua no pedido
- "E1.8 (react-frontend): K-293, ajustes do Resumo depois do L5 (data-testid por bloco, estados vazio e carregando anunciados, nome acessível do Limpar por bloco, laço do CA-6 no e2e que falha sem equipe pequena), branch fix/k293-resumo-equipe-a11y, worktree /home/rodrigoisensee/MetricasDSPD-052f; merge depois da release 101." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): L2, a equipe no apontamento, parte servidor (feito, PR 337)." · etapa de outra delegação; continua no pedido
- "E2.2 (security-engineer): parecer de segurança do L2 (banco: permissão por coluna; recorte de pessoas por equipe)." · etapa de outra delegação; continua no pedido
- "E2.3 (react-frontend): L3, Equipe no lugar de Pessoa no Apontamento (PR 345)." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): L1, busca no FiltroMulti (feito, PR 336)." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por lote do 097." · etapa de outra delegação; continua no pedido
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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/097-l8a-recolher:docs/qa/097-l8a-recolher.md` · espera: contém 'commit: 78c80ecee71ea6361578bf97e9d53015bfe132b3'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
