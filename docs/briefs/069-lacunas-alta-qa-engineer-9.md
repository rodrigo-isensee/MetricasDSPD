Agente destino: forge:qa-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7-calendario   Base: develop   Base-sha: 69e72a709e0b6f936887cf36753d1bb4c3236768
Etapa: qa   Cobre: E1.5

## Objetivo
QA de novo do lote L7-a, depois da volta, do 069 (arquivo versionado do calendário e a entrada ref:sync-calendario) na ponta 62fc83bb7c53b7959de170670f54ae5ac4763e5d (pedido 069, E1.5, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/069-l7-calendario`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/develop...62fc83bb7c53b7959de170670f54ae5ac4763e5d`; o desenho `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote L7-a"); a ADR `/home/rodrigoisensee/MetricasDSPD-052d/docs/architecture/adr/0027-calendario-por-dominio.md`.

## Entregar
- "E1.5 (qa-engineer): QA por lote." (E1.5)
- (E5) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7-calendario`; rodar com no máximo 2 workers o vitest do server e dos pacotes com cobertura, o vitest de tools/docs-contratos, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; conferir que as datas de `docs/architecture/fontes/calendario.json` são as de `packages/metricas/src/core/calendario.ts` (nenhuma nova), que os nomes dos feriados correspondem às datas e que a lista METRICAS_CALENDARIO bate com as métricas que usam horas ou dias úteis; conferir o teste novo da entrada e a correção do teste pg; registrar no parecer que os testes pg não rodam no sandbox e ficam para a CI do PR; parecer em `docs/qa/069-z3-l7a.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/069-l7-calendario`; sem PR.
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
- 2026-11-04 21:48: Volta do L7-a conferida como cumprida: feature/069-l7-calendario em 62fc83bb7c53b7959de170670f54ae5ac4763e5d (a falha do teste pg era do teste: o helper gravava o feriado nos dois calendários e a contagem de 2 é um por calendário; o teste passa [] ao Acelerato, código intocado; teste novo da entrada ref-sync-calendario com data inválida, uso e caminho feliz). DECISÃO TÉCNICA (Jarvis): review e QA de novo ao mesmo tempo citando 62fc83b, pareceres no nome 069-z3-l7a.md (o forge-check pr escolhe o parecer pelo nome do arquivo quando a data é igual); o test:pg na ponta nova fica com o assistente do dono e com a CI do PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda o comando contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `commit: 62fc83bb7c53b7959de170670f54ae5ac4763e5d`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outro parecer é gravado ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7-calendario` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052d add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, o outro parecer, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/069-l7-calendario:docs/qa/069-z3-l7a.md` · espera: contém 'commit: 62fc83bb7c53b7959de170670f54ae5ac4763e5d'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).