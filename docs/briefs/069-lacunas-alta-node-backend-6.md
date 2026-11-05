Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7-calendario   Base: develop   Base-sha: 69e72a709e0b6f936887cf36753d1bb4c3236768
Etapa: codigo   Cobre: E1.2

## Objetivo
Lote L7-a do 069: arquivo versionado do calendário e o carregador `ref:sync-calendario`, que grava as tabelas de calendário e feriado com versão de critério por domínio (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch nova `feature/069-l7-calendario`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seções "E5 · L7: calendário e feriados" e "Lote L7-a").
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0027-calendario-por-dominio.md` (a ADR deste lote, escrita pelo arquiteto, ainda sem commit).

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E5) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052d status --short` só com a ADR 0027 nova; `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052d switch -c feature/069-l7-calendario origin/develop --no-track` (a ADR, não rastreada, acompanha); `pnpm install --offline --frozen-lockfile` se faltar pacote (se falhar, pare e relate); primeiro commit só da ADR como está (`git -C /home/rodrigoisensee/MetricasDSPD-052d add docs/architecture/adr/0027-calendario-por-dominio.md`); implementar o lote L7-a conforme o desenho: `docs/architecture/fontes/calendario.json` com os feriados nacionais 2025-2026 que já estão em `packages/metricas/src/core/calendario.ts` (nenhuma data nova), a entrada `ref:sync-calendario [AAAA-MM-DD]` em `server/src/entradas/` e o módulo em `server/src/modulos/referencia/`, nos moldes citados no desenho; testes pg do desenho (idempotência, feriado novo só insere, arquivo inválido recusa tudo sem gravar, feriado gravado nunca muda, rota do apontamento com o calendário carregado); docs do comando onde o projeto documenta as entradas; `pnpm run docs:check` verde; vitest do server e dos pacotes com cobertura, no máximo 2 workers; `pnpm exec prettier --check web packages tools` verde; testes pg só se houver PostgreSQL local acessível (sem ele, relate que não rodaram); commits com `git -C /home/rodrigoisensee/MetricasDSPD-052d add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/069-l7-calendario`; sem PR.
- (E1, E2, E3, E4) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): é a decisão que este lote implementa; o texto dela não muda
- ADR 0025 (citada no pedido): só molde de forma da ADR 0027; não muda
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 19:31: ADR 0027 escrita pelo software-architect em /home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0027-calendario-por-dominio.md (proposta, sem commit; decisões só do desenho E5; molde da ADR 0025). DECISÃO TÉCNICA (Jarvis): lote L7-a com o node-backend na worktree 052d, branch nova feature/069-l7-calendario a partir da origin/develop, levando a ADR 0027 no primeiro commit; sem gatilho de segurança neste lote (o desenho lista gatilhos só em L2-a, L2-c e L9-b; o carregador usa o papel dspd_ref que já existe, sem GRANT novo).
- 2026-11-04 20:52: DECISÃO TÉCNICA (Jarvis): com a decisão "A", o lote L7-a segue com o node-backend na worktree MetricasDSPD-052d, branch nova feature/069-l7-calendario, levando a ADR 0027 no primeiro commit.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas; não roda o comando contra a base real (é do dono).
- Só o lote L7-a: as métricas não passam a ler a referência (é o L7-b); turnos e etapas sintéticas do Acelerato fora.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, outros lotes, o texto da ADR 0027, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

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
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin feature/069-l7-calendario` · espera: linhas=1
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-tree --name-only origin/feature/069-l7-calendario docs/architecture/adr/0027-calendario-por-dominio.md docs/architecture/fontes/calendario.json` · espera: linhas=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).