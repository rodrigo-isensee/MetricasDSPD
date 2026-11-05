Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9-etapa   Base: develop   Base-sha: 69e72a709e0b6f936887cf36753d1bb4c3236768
Etapa: codigo   Cobre: E1.2

## Objetivo
Lote L9-b do 069: a consulta Q4 dos campos de etapa do Acelerato (fatia F3 da ADR 0023) até o staging, com os nomes numa constante do código e o tratamento decidido pelo nome no SELECT, pelas condições do modelo de ameaças (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch nova `feature/069-l9-etapa`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seções "Gatilhos de segurança" e "Lote L9-b").
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/069-modelo-ameacas.md` (parte do L9-b e os casos de abuso CA-069-6 a 11).

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E4) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052c status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052c fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052c switch -c feature/069-l9-etapa origin/develop --no-track`; `pnpm install --offline --frozen-lockfile` se faltar pacote (se falhar, pare e relate); implementar o lote L9-b conforme o desenho: Q4 em `server/src/modulos/acelerato/sql.ts` e em `docs/architecture/fontes/acelerato-mysql.sql`, constante de nomes com o tratamento `lista` ou `preenchido` (sem "Categoria de solução" e sem "Número do ticket anterior"), schema zod strict, staging com valor só no domínio, hash do SQL e versão de critério como manda a ADR 0023, e os testes do desenho (A1, A2, zod, fronteira e estrutura da consulta); `pnpm run docs:check` verde; vitest do server e dos pacotes com cobertura; `pnpm exec prettier --check web packages tools` verde; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052c add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/069-l9-etapa`; sem PR.
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): citada no Histórico, decide o calendário do L7; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 20:20: Desenho atualizado pelo software-architect com A1 a A4 do modelo de ameaças (docs/analises/069-desenho.md, sem commit; A6 também; A5, A7 e A8 não). DECISÃO TÉCNICA (Jarvis): a lista positiva de tipos do L2-a começa vazia até o P-L2-1 e o PR que preencher o arquivo preenche a constante, como o desenho diz; "Categoria de solução" fica fora da constante do L9-b (o desenho a condiciona à preferência do dono, não registrada); lotes L2-a (worktree MetricasDSPD-041, branch feature/069-l2-campos) e L9-b (worktree MetricasDSPD-052c, branch feature/069-l9-etapa) começam ao mesmo tempo com duas instâncias do node-backend, cada lote levando os arquivos sem commit do desenho e do modelo de ameaças só se for o primeiro a commitá-los (o L2-a commita o modelo de ameaças; o desenho segue sem commit até o fim do pedido).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não consulta o MySQL nem o PostgreSQL reais.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes (outra instância do node-backend roda ao mesmo tempo em outra worktree).
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- Nenhum GRANT novo: `server/src/` não muda `grants.ts` (o modelo de ameaças trata qualquer mudança ali como bloqueante).
- Não preencher domínios de lista (é das pessoas e do dono, P-DS-19); a projeção das colunas é o L9-c, fora daqui.
- NÃO tocar: `web/`, o BusinessMap, outros lotes, o desenho, o modelo de ameaças, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

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
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052c ls-remote origin feature/069-l9-etapa` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c diff --name-only origin/develop...origin/feature/069-l9-etapa -- server/src/modulos/acelerato/sql.ts docs/architecture/fontes/acelerato-mysql.sql` · espera: linhas=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).