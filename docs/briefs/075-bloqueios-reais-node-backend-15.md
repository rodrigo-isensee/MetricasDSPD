Agente destino: forge:node-backend
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l6b-publicacao-real   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.4

## Objetivo
Lote 6b do pedido 075 (bloqueios reais): ligar a publicação com dado real de BLOQUEADOS, O1, O2, O5 e O19, depois da prova do dono (Histórico de 2026-11-10 22:10: fato_bloqueio 172, evt_bloqueio_fim 28, primeira coleta 2026-11-01) e com a data da versão de critério 2026-11-01 (Histórico de 2026-11-10 22:39). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/075-l6b-publicacao-real` (já criada sobre a develop 129fc3d5ba918789e17d3dc1b663039795c4a9e6).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 6b" e §5 (T10 e T12 fora).
- Na worktree: `packages/contratos/src/origem.ts`, `packages/metricas/src/core/criterios.ts` (`DATA_BLOQUEIO_COM_DADO_REAL`, hoje '2099-12-31'), `server/src/modulos/metricas/servico.ts`.

## Entregar
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." (E1.4) Nesta delegação, só o lote 6b.
- (E1) (E4) (E1.4) Pela seção "Lote 6b" do plano: `BLOQUEIOS_COM_DADO_REAL = true`; BLOQUEADOS, O5 e O19 no mapa real; BLOQUEADOS e O5 saem do motivo mock; T10 e T12 não mudam; a parte de bloqueio do O1 e do O2 passa a sair do corte do 6a; a nota `bloqueio-sem-dado-real` deixa de ser emitida (o id fica no enum até o 9b); `DATA_BLOQUEIO_COM_DADO_REAL` = '2026-11-01'; `docs/api/metricas.md` e `openapi.json` atualizados; CHANGELOG; a L1 de `docs/analises/064-lacunas-dado-real.md` marcada como corrigida. Testes do plano (origem com o mapa novo e T10 e T12 fora; painel real e api-stub com os casos invertidos; O5 e O19 abaixo de 20 sem percentil; CA-075-11 nas respostas e na exportação), vermelho antes do verde. Sem migração. Commits com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos caminhos); push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/075-l6b-publicacao-real` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Se algum arquivo necessário não estiver na lista abaixo, pare e relate antes de mexer nele.
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: packages/contratos/src/origem.ts, packages/contratos/src/origem.test.ts, packages/metricas/src/core/criterios.ts, server/src/modulos/metricas/servico.ts, server/tests/painel-real-f6.test.ts, server/tests/painel-real-f6.pg.test.ts, server/tests/pg/api-stub-065.ts, docs/api/metricas.md, docs/api/openapi.json, CHANGELOG.md, docs/analises/064-lacunas-dado-real.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até 70f8656faffbbb9ed0d4e9c03458033d436159f8da6dee88c353340426f91775 (19 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
- "E1.8 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): PR por lote, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.10 (ux-designer): revisão de interface dos lotes de tela." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação" · etapa de outra delegação; continua no pedido
- "E3.2 (ux-designer): especificação curta do motivo "não classificado" e da marca de histórico parcial na tela de bloqueados e no O5, em docs/ux/, sem commit." · etapa de outra delegação; continua no pedido
- "E3.3 (tech-lead): revisão do plano docs/analises/075-plano.md (lotes, testes, teto, ordem), parecer curto em docs/analises/075-plano-revisao-tech-lead.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.4 (security-engineer): revisão de segurança do plano contra o modelo de ameaças, parecer curto em docs/analises/075-plano-revisao-seguranca.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.5 (software-architect): desenho da distribuição por motivo do O2 (agregado no contrato num lote novo ou não), em docs/analises/075-o2-distribuicao.md, sem commit." · etapa de outra delegação; continua no pedido
- "E3.6 (ux-designer): ajuste da especificação do O2 em docs/ux/075-bloqueios-reais.md se o agregado não vier, sem commit." · etapa de outra delegação; continua no pedido
- "E5.1 (devops-engineer): agenda diária da coleta do BusinessMap, depois da migração para a VM." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-052d`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d grep -n "DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'" -- packages/metricas/src/core/criterios.ts` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --oneline 129fc3d5ba918789e17d3dc1b663039795c4a9e6..origin/feature/075-l6b-publicacao-real` · espera: linhas>=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
