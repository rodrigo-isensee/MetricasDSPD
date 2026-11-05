Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7-calendario   Base: develop   Base-sha: 69e72a709e0b6f936887cf36753d1bb4c3236768
Etapa: codigo   Cobre: E1.2

## Objetivo
Volta do lote L7-a do 069: a falha do teste pg do calendário que o test:pg do dono achou, e o teste da entrada que o QA pediu (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/069-l7-calendario`.

## Ler
- `/home/rodrigoisensee/logs-metricas/069-testpg-20261104-2116.log` (só a falha de tests/calendario-referencia.pg.test.ts, linhas 805 a 823).
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/069-lote-l7a.md` (achado A1) e `/home/rodrigoisensee/MetricasDSPD-052d/server/src/modulos/referencia/calendario.ts`.

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E5) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7-calendario`; achar a causa de `feriadosDivergentes` sair 2 onde o teste espera 1 em `server/tests/calendario-referencia.pg.test.ts:123` e corrigir no código ou no teste, com o motivo no relatório (o feriado gravado nunca muda e a contagem tem de dizer quantos feriados do arquivo divergem do gravado); acrescentar teste automatizado da entrada `server/src/entradas/ref-sync-calendario.ts` (data inválida, uso e caminho feliz com dublê), mantendo a cobertura em 100%; vitest do server com cobertura, no máximo 2 workers; `pnpm exec prettier --check web packages tools` e `pnpm run docs:check` verdes; os testes pg não rodam no sandbox (relate isso; o assistente do dono roda de novo); commits com `git -C /home/rodrigoisensee/MetricasDSPD-052d add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/069-l7-calendario`; sem PR.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): é a decisão que este lote implementa; feriado gravado nunca muda
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 21:25: test:pg rodado pelo assistente do app do dono (log /home/rodrigoisensee/logs-metricas/069-testpg-20261104-2116.log): feature/069-l2-campos em 19e5e86 com 33 arquivos verdes e 1 falho (tests/apontamento-rota.pg.test.ts, 7 testes, por "password authentication failed for user dspd_api_apontamento", 28P01, ambiente local e não código do lote); feature/069-l7-calendario em 025ec57 com o mesmo apontamento-rota e mais uma falha do lote: tests/calendario-referencia.pg.test.ts:123, "feriado gravado nunca muda: outra descrição", expected feriadosDivergentes 1 e recebeu 2. DECISÃO TÉCNICA (Jarvis): a falha do apontamento-rota é a senha local do papel dspd_api_apontamento (ação do dono já pendente) e não segura o L2-a, cuja CI do PR roda o test:pg com o próprio banco; a do calendário volta ao node-backend junto com o que o QA do L7-a achar, num brief único.
- 2026-11-04 21:26: Lote L7-a: review e QA aprovados na ponta 025ec57 (review 8f6fe7d, teto excedido de 730 linhas aceito com a linha no PR, A2 recomendado: calendario.ts:232 repete o SELECT do id; QA 272f848, A1 recomendado: a entrada ref-sync-calendario.ts não tem teste), mas o test:pg do dono acusou falha do lote em tests/calendario-referencia.pg.test.ts:123 (feriadosDivergentes 2 em vez de 1). DECISÃO TÉCNICA (Jarvis): volta ao node-backend num brief único: corrigir a falha (no código ou no teste, com o motivo no relatório; a regra do desenho é que feriado gravado nunca muda) e acrescentar o teste da entrada (A1 do QA); o A2 do review fica como dívida; depois review e QA de novo na ponta nova, com os pareceres no nome 069-z3-l7a.md; o test:pg roda de novo pelo assistente do dono.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda o comando contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, outros lotes, os pareceres, o texto da ADR 0027, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only 272f848 origin/feature/069-l7-calendario -- server/tests` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).