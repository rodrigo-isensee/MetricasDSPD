Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7b-leitura   Base: develop   Base-sha: 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4
Etapa: codigo   Cobre: E1.2

## Objetivo
Lote L7-b do 069: as métricas do fluxo e da sustentação passam a ler a referência de calendário e feriados (ref_calendario e ref_feriado) que o L7-a carregou, numa branch nova feature/069-l7b-leitura a partir da develop 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4 (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (lote 4 L7-b, a tabela de gatilhos e a seção do arquivo inicial: teste de paridade, nenhuma mudança de número nas métricas); a ADR `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0027-calendario-por-dominio.md`; o carregador do L7-a em `/home/rodrigoisensee/MetricasDSPD-052d/server/src/modulos/referencia/calendario.ts` e onde a biblioteca T2.5 calcula dias úteis em `packages/metricas/`.

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E5) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052d switch -c feature/069-l7b-leitura 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4`; fazer as métricas do fluxo e da sustentação lerem os feriados da referência (por domínio, como a ADR 0027 decide), pela biblioteca compartilhada T2.5, sem cálculo próprio de dia útil; teste de paridade que prova que nenhum número muda com o arquivo inicial (feriados nacionais 2025-2026) e testes do caminho com feriado novo; se o cálculo mudar de critério, registrar a versão com data como as outras métricas; documentação técnica afetada atualizada; rodar `npx eslint .` com cwd em `server/` (rc=0), o vitest do server e dos pacotes com cobertura 100 por cento (no máximo 2 workers), `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; commits com `git -C /home/rodrigoisensee/MetricasDSPD-052d add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/069-l7b-leitura`; sem PR.
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
- 2026-11-05 12:06: Lote L7-b começa: o L7-a está na develop (PR 222); o dono perguntou por que o time estava parado com carga baixa. DECISÃO TÉCNICA (Jarvis): L7-b com o node-backend, conforme o desenho (docs/analises/069-desenho.md, lote 4: as métricas do fluxo e da sustentação leem a referência de calendário e feriados), numa branch feature/069-l7b-leitura a partir da develop 0a4f139 na worktree 052d, com teste de paridade (nenhum número muda com o arquivo inicial de feriados nacionais 2025-2026); depois review, QA e o PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `web/`, outros lotes, os pareceres, o texto da ADR 0027, as migrações, o conteúdo do arquivo de feriados, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

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
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin feature/069-l7b-leitura` · espera: contém 'refs/heads/feature/069-l7b-leitura'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4 origin/feature/069-l7b-leitura -- server packages` · espera: linhas>=1
- PQ-3 (cmd): `npx --prefix /home/rodrigoisensee/MetricasDSPD-052d/server eslint /home/rodrigoisensee/MetricasDSPD-052d/server` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).