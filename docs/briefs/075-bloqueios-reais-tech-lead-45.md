Agente destino: forge:tech-lead
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l6b-publicacao-real   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.9

## Objetivo
O PR 298 (lote 6b, `feature/075-l6b-publicacao-real`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, ponta 74ec452e) ficou em conflito com a develop depois dos merges da noite (release 090). O único arquivo em conflito é `CHANGELOG.md`: os dois lados acrescentaram notas. Review, segurança e QA do lote já estão aprovados sobre o código bd76128a.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d merge-tree --write-tree --name-only origin/develop origin/feature/075-l6b-publicacao-real` (só CHANGELOG.md em conflito).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9) Nesta delegação, só o lote 6b.
- (E1) (E4) (E1.9) Na worktree limpa: `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin`, `git merge origin/develop` (sem rebase) e resolver o conflito do `CHANGELOG.md` mantendo as notas dos dois lados (as da release 090 e a do 6b), sem mudar o texto de nenhuma; se outro arquivo entrar em conflito, pare e relate. Conferir que o diff da branch contra a develop continua só o do lote 6b. Commit do merge com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad), push em segundo plano (decisão técnica de 2026-11-07 17:01), esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/075-l6b-publicacao-real` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, esperar a CI verde do PR 298 (`testes` e `e2e`) em laços de até 170 s por chamada. Não mesclar nesta delegação (quem mescla o 6b segue a DECISÃO TÉCNICA de 2026-11-11 00:28 do Histórico, a última sobre o merge, que substitui a linha de 00:25).
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: CHANGELOG.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até ec1d352b034610de51273caaf3a7f56eafacf3ab1e508f868c556b356364447c (20 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres, outras worktrees, a `homolog` e a `main`; a `develop` só como origem do merge; nenhum merge do PR.

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
- PQ-1 (cmd): `gh pr view 298 --repo rodrigo-isensee/MetricasDSPD --json mergeStateStatus --jq .mergeStateStatus` · espera: contém 'CLEAN'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
