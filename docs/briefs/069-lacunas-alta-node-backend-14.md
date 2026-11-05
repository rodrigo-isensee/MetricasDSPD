Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7-calendario   Base: develop   Base-sha: f61570400a45a86917e5f0ee30eaaf4b0a2e7ebc
Etapa: codigo   Cobre: E1.2

## Objetivo
Volta 4 do lote L7-a do 069: o teste pg `server/tests/calendario-referencia.pg.test.ts:125` falha na CI do PR 222 com erro 42702 (coluna ambígua), sobre a ponta c6b36b68b13dbfc75acaf1d30fa390f8d0d8a31f (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/069-l7-calendario`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/server/tests/calendario-referencia.pg.test.ts` (perto da linha 125), as migrações de `ref_feriado` e `ref_calendario` em `/home/rodrigoisensee/MetricasDSPD-052d/server/migrations/` e o log do job banco: `gh run view 41983301414 --repo rodrigo-isensee/MetricasDSPD --log-failed`.

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E5) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7-calendario`; achar a coluna ambígua (provavelmente `descricao` em `ref_feriado` e `ref_calendario`, na consulta com JOIN ... USING (calendario_id)) e qualificá-la com o alias da tabela certa no teste; se a mesma ambiguidade estiver no código de `server/src/modulos/referencia/`, corrigir lá também, com o motivo no relatório; rodar `npx eslint .` com cwd em `server/` (rc=0), o vitest do server com cobertura (no máximo 2 workers), `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; commit com `git -C /home/rodrigoisensee/MetricasDSPD-052d add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/069-l7-calendario`; depois do push, esperar o job `banco` do PR 222 por laço com pausa (`gh pr checks feature/069-l7-calendario --repo rodrigo-isensee/MetricasDSPD`, cada chamada abaixo de 2 minutos, até 40 minutos) e relatar o resultado; se ele falhar de novo, ler o log, corrigir e repetir uma vez; sem PR novo e sem merge.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): é a decisão que este lote implementa
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 03:57: Volta 4 do L7-a: teste pg falha na CI: QA zz1 aprovado (c6b36b6, commit: 95dab5d); no merge, o job banco (test:pg) do PR 222 reprovou nas duas execuções (runs 41983293726 e 41983301414) só em server/tests/calendario-referencia.pg.test.ts:125 ("feriado gravado nunca muda"), erro 42702 ambiguous_column na consulta SELECT descricao FROM ref_feriado f JOIN ref_calendario k USING (calendario_id); escape registrado (controle que faltou: qa, porque o test:pg não roda no sandbox). DECISÃO TÉCNICA (Jarvis): volta 4 ao node-backend para qualificar a coluna no teste (ou corrigir o código, se a ambiguidade estiver nele), conferindo o job banco verde na CI do PR 222 antes de relatar; depois review, QA e segurança do delta, nomes zz2, e o merge; o 070 entra na develop antes, porque a develop está livre.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, outros lotes, os pareceres, o texto da ADR 0027, as migrações, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only c6b36b68b13dbfc75acaf1d30fa390f8d0d8a31f origin/feature/069-l7-calendario -- server` · espera: linhas>=1
- PQ-2 (run): o job banco do PR 222 verde na ponta nova, com o link do run
- PQ-3 (cmd): `npx --prefix /home/rodrigoisensee/MetricasDSPD-052d/server eslint /home/rodrigoisensee/MetricasDSPD-052d/server` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).