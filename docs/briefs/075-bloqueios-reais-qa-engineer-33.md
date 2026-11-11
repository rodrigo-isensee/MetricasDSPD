Agente destino: forge:qa-engineer
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: feature/075-9b   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E1.8

## Objetivo
QA do lote 9b dos bloqueios reais (K-204): branch `feature/075-9b`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, código em e4eaa56c90f8424d86e7e37151e7ae27745375c2 (o contrato perde a nota `bloqueio-sem-dado-real`; aceite de contrato incompatível gravado, fotografado e removido; testes do 065 reescritos; CA-12 só pelo interruptor), base develop f4c122f15c05fbf5fea86797c9c348656d11ab36.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff f4c122f15c05fbf5fea86797c9c348656d11ab36 e4eaa56c90f8424d86e7e37151e7ae27745375c2`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/075-plano.md`, seção "Lote 9b".

## Entregar
- "E1.8 (qa-engineer): QA por lote." (E1.8) Nesta delegação, o QA do lote 9b.
- (E1) (E1.8) Rodar `packages/contratos/src/origem.test.ts`, `server/tests/painel-real-f6.test.ts` e o `docs:check` com no máximo 2 workers (R-TETO); conferir que a nota sumiu do enum e da API, que o O1, o O2 e o O3 seguem com o dado real, que o `bloqueados` nulo do O1 continua nulo (nunca vira 0), que CA-12 passa só pelo interruptor e que `aceitas.json` voltou igual à develop. Uma mutação (religar a nota em `semParteDeBloqueio`) que o teste pega, restaurada antes do commit. Grave `docs/qa/075-l9b-contrato.md` (novo) só pela ferramenta Write, com `pedido: 075-bloqueios-reais`, `branch: feature/075-9b`, `commit: e4eaa56c90f8424d86e7e37151e7ae27745375c2`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado. Commit só do parecer com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/feature/075-9b` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/075-l9b-contrato.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 075-bloqueios-reais até c166a8738a8bd344c2b9d3c3d78fffc1ddf47073e303a80503f9145ee45b4171 (21 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/075-bloqueios-reais.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0020, ADR 0022, ADR 0029, ADR 0004
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): implementação por lote do plano (1a, 1b, 2a, 2b, 3, 4a, 4b, 4c, 6a, 6b, 9a), cada um numa branch feature/075-<lote> a partir da develop." · etapa de outra delegação; continua no pedido
- "E1.5 (react-frontend): implementação dos lotes de tela (5a, 5b e a parte web do 9b)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): review por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." · etapa de outra delegação; continua no pedido
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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/feature/075-9b:docs/qa/075-l9b-contrato.md` · espera: contém 'commit: e4eaa56c90f8424d86e7e37151e7ae27745375c2'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
