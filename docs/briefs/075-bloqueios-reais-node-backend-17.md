Agente destino: forge:node-backend
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-l6b-publicacao-real   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.4

## Objetivo
Brief de registro (não delegado): igual ao node-backend-16, com os dois testes do web que a suíte apontou (origem.test.tsx e simulado.test.tsx, previstos no Entregar do 16) na lista de arquivos, para conferir a entrega bd76128a. Continuação do lote 6b do pedido 075 (bloqueios reais) na worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/075-l6b-publicacao-real`. A entrega anterior (brief node-backend-15) parou sem commit porque testes fora da lista afirmam o estado antigo (BLOQUEADOS, O5 e O19 como mock, data pendente). As edições dela já estão na worktree, sem commit (`git status`): origem.ts, origem.test.ts, criterios.ts ('2026-11-01'), servico.ts, painel-real-f6.test.ts, painel-real-f6.pg.test.ts, api-stub-065.ts, docs/api/metricas.md e CHANGELOG.md. Mantenha-as e complete o lote.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 6b" e §5 (T10 e T12 fora).
- Na worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052d diff` (as edições já feitas) e `docs/qa/075-l6a-versao-criterio.md`, achado A2.

## Entregar
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." (E1.4) Nesta delegação, só o lote 6b.
- (E1) (E4) (E1.4) Inverter os testes que afirmam o estado antigo, na mesma branch, sem afrouxar asserção: `server/tests/corte-serie-o1-075.test.ts` (o caso da data pendente vira o caso com a data 2026-11-01 e soma a marcação da versão de critério no O1 e no O5, achado A2 do QA do 6a); `server/tests/qa-f6-painel.test.ts` (lista de reais com BLOQUEADOS, O5 e O19); os testes do web que afirmam BLOQUEADOS, O5 ou O19 como mock (`web/src/features/operacional/bloqueio-sem-dado.test.tsx` e os outros que a suíte do web apontar; só arquivos de teste, sem mudar componente do web, que é do lote 9a); `e2e/tests-api/bloqueio-sem-dado-065.spec.ts` (Q65-01 a Q65-05 invertidos) e `e2e/fixtures/referencia-completa.ts` se depender do mapa antigo. A L1 de `docs/analises/064-lacunas-dado-real.md` fica fora (o arquivo não existe na develop). Depois, `pnpm run pronto` da raiz da worktree; commits com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelos caminhos); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/075-l6b-publicacao-real` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. No relatório, a lista exata dos arquivos de teste do web alterados.
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: packages/contratos/src/origem.ts, packages/contratos/src/origem.test.ts, packages/metricas/src/core/criterios.ts, server/src/modulos/metricas/servico.ts, server/tests/painel-real-f6.test.ts, server/tests/painel-real-f6.pg.test.ts, server/tests/pg/api-stub-065.ts, server/tests/corte-serie-o1-075.test.ts, server/tests/qa-f6-painel.test.ts, web/src/features/operacional/bloqueio-sem-dado.test.tsx, web/src/features/coleta/origem.test.tsx, web/src/features/coleta/simulado.test.tsx, e2e/tests-api/bloqueio-sem-dado-065.spec.ts, e2e/fixtures/referencia-completa.ts, docs/api/metricas.md, docs/api/openapi.json, CHANGELOG.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até ec1d352b034610de51273caaf3a7f56eafacf3ab1e508f868c556b356364447c (20 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), o `.env` real, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- T10 e T12 da E4 · Retira do escopo original (ESCOPO- do dono, P-075-11 e P-075-12, no Histórico): ficam para depois da WS1
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
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
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-052d`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d grep -n "DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'" -- packages/metricas/src/core/criterios.ts` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --oneline 129fc3d5ba918789e17d3dc1b663039795c4a9e6..origin/feature/075-l6b-publicacao-real` · espera: linhas>=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
