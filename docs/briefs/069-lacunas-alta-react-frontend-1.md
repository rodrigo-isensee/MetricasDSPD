Agente destino: forge:react-frontend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-m1-frescor   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: codigo   Cobre: E1.3

## Objetivo
Lote M1-a do 069 na tela: o cabeçalho da aba Apontamento avisa quando a última coleta foi parcial, lendo o campo frescor.ultimaTentativa que o server já entrega (pedido 069, E1.3, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/069-m1-frescor`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote M1-a").
- `git -C /home/rodrigoisensee/MetricasDSPD-056d show bfaf807 --stat` e o contrato em `/home/rodrigoisensee/MetricasDSPD-056d/packages/contratos/src/apontamento.ts` (campo ultimaTentativa).

## Entregar
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." (E1.3)
- (E2) (E1.3) `git -C /home/rodrigoisensee/MetricasDSPD-056d status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-056d switch feature/069-m1-frescor`; `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-m1-frescor`; em `web/src/features/apontamento/components/CabecalhoApontamento.tsx`, quando `ultimaTentativa.resultado` for `parcial` e ela for mais nova que `ultimaColetaOk` (ou não houver ok), mostrar ao lado do selo o aviso "Última coleta parcial em dd/mm hh:mm: o período pode estar incompleto" (texto final fica para a revisão de interface); sem aviso nos outros casos; teste do cabeçalho com o aviso presente e ausente; cobertura do web em 100%; `pnpm exec prettier --check web packages tools` verde; typecheck do web verde; commits com `git -C /home/rodrigoisensee/MetricasDSPD-056d commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/069-m1-frescor`; sem PR.
- (E1, E3, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- ADR 0027 (citada no pedido): não se aplica a este lote (é do L7)
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 19:05: Lote M1-a, parte do server, entregue pelo node-backend: feature/069-m1-frescor em bfaf8072ccd9d58b385c316c669606b7d9a24386 (frescor.ultimaTentativa opcional e nullable em packages/contratos/src/apontamento.ts, montarApontamento preenche, docs/api/apontamento.md e openapi.json regenerado, testes em apontamento-rota.test.ts; docs:check ok, server, contratos 204 e metricas 1258 verdes, prettier ok). DECISÃO TÉCNICA (Jarvis): a parte de tela do M1-a vai ao react-frontend na mesma worktree e branch, depois o review e o QA do lote inteiro.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- Só a tela do lote M1-a; o selo e o cálculo não mudam; sem dado inventado (ADR 0026).
- NÃO tocar: `server/`, `packages/`, outros lotes, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d diff --stat bfaf807 origin/feature/069-m1-frescor -- web/src/features/apontamento` · espera: linhas>=2
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-056d && pnpm exec prettier --check web packages tools` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).