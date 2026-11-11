Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l6b-publicacao-real   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.9

## Objetivo
PR e integração do lote 6b do pedido 075 na develop: branch `feature/075-l6b-publicacao-real` (worktree `/home/rodrigoisensee/MetricasDSPD-052d`; código bd76128a9fde6822f9e126ceaf4c24462fc7b865 conferido; review fecdb3c4 e segurança aprovados; QA aprovado no mesmo código, parecer na branch). O parecer de segurança `docs/security/075-l6b-publicacao-real.md` está gravado e sem commit na worktree.

## Ler
- Na worktree: `docs/reviews/075-l6b-publicacao-real.md` (novo), `docs/security/075-l6b-publicacao-real.md` (novo) e `docs/qa/075-l6b-publicacao-real.md` (novo).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9) Nesta delegação, só o lote 6b.
- (E1) (E4) (E1.9) Levar o parecer de segurança (gravado pelo security-engineer) à branch: commit só dele com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/075-l6b-publicacao-real` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; `teto: excedido, 455 linhas` com o motivo do A3 do review; os achados recomendados do review, da segurança e do QA como pendências; o lote 9a/9b como próximo passo), esperar a CI verde (`testes` e `e2e`) em laços de até 170 s por chamada; se o PR estiver atrás da develop, `gh pr update-branch` pelo nome da branch e esperar a CI de novo. Não mesclar: pela decisão do dono de 2026-11-07 21:57 ("A": um PR por lote, o dono mescla) e pela DECISÃO TÉCNICA do Histórico de 2026-11-11 (a última), o merge do 6b é do dono.
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum gravado nesta delegação (o parecer de segurança já está gravado e vai à branch sem mudar o conteúdo)

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até ec1d352b034610de51273caaf3a7f56eafacf3ab1e508f868c556b356364447c (20 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis (salvo o que a lista manda levar à branch), outras worktrees, a `homolog` e a `main`; a `develop`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- T10 e T12 da E4 · Retira do escopo original (ESCOPO- do dono, P-075-11 e P-075-12, no Histórico): ficam para depois da WS1
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head feature/075-l6b-publicacao-real --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
