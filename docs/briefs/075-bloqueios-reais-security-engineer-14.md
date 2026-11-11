Agente destino: forge:security-engineer
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l6b-publicacao-real   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.7

## Objetivo
Parecer de segurança do lote 6b do pedido 075 (publicação real de BLOQUEADOS, O1, O2, O5 e O19): branch `feature/075-l6b-publicacao-real`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, commit bd76128a (base develop 129fc3d5ba918789e17d3dc1b663039795c4a9e6), em paralelo ao review no mesmo head.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 bd76128a`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/075-modelo-ameacas.md`.

## Entregar
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." (E1.7) Nesta delegação, só o lote 6b.
- (E1) (E1.7) Conferir contra o modelo de ameaças: a publicação real não expõe dado de pessoa (nome, e-mail, ids de usuário, texto livre do motivo de bloqueio) na resposta da API, na exportação nem no stub; nenhuma métrica vira avaliação individual; o papel `dspd_api` segue sem ler coluna de pessoa; nenhum segredo nos testes e fixtures. Gravar `/home/rodrigoisensee/MetricasDSPD-052d/docs/security/075-l6b-publicacao-real.md` (novo) pela ferramenta Write, com `pedido: 075-bloqueios-reais`, `branch: feature/075-l6b-publicacao-real`, `commit:` com o sha40 de bd76128a e o veredito. Sem commit nem push (o tech-lead leva o parecer à branch).
- (E2, E3, E4, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/security/075-l6b-publicacao-real.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até ec1d352b034610de51273caaf3a7f56eafacf3ab1e508f868c556b356364447c (20 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- T10 e T12 da E4 · ESCOPO- do dono (Histórico, P-075-8): ficam para depois da WS1; não nesta delegação
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação, cobrindo E1, E2 e E4, com as decisões do dono de 11:11." · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/MetricasDSPD-052d/docs/security/075-l6b-publicacao-real.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
