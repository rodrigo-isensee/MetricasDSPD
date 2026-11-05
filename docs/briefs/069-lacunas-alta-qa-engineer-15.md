Agente destino: forge:qa-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9a-sem-zero   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: qa   Cobre: E1.5

## Objetivo
QA do lote L9-a do 069 na ponta com o E2E de API (só o delta 5b03e4a até a ponta, o arquivo e2e/tests-api/sem-zero-ajuste-069-l9a.spec.ts) na ponta 2729205fe498ef6f5756910aaee6300f0c1cd417 (pedido 069, E1.5, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/069-l9a-sem-zero`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff 5b03e4aaed32b4e36947c3be3e157bc7346742ab..2729205fe498ef6f5756910aaee6300f0c1cd417 -- e2e` (o delta; o resto do lote já foi revisto nos pareceres z7).

## Entregar
- "E1.5 (qa-engineer): QA por lote." (E1.5)
- (E4) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-l9a-sem-zero`; rodar com no máximo 2 workers o vitest do server e dos pacotes com cobertura, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; rodar `npx playwright test` só do arquivo `e2e/tests-api/sem-zero-ajuste-069-l9a.spec.ts` como o projeto manda para os testes de API, `pnpm exec prettier --check e2e` e o tsc do `e2e`; conferir que o delta é só esse arquivo; registrar no parecer que os testes pg não rodam no sandbox e ficam para a CI do PR; parecer em `docs/qa/069-z8-l9a.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/069-l9a-sem-zero`; sem PR.
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
- DECISÃO DO DONO (2026-11-04): "A" (arquivo inicial de feriados do L7): o arquivo de calendário começa com os feriados nacionais 2025-2026 que já estão no código, sem data nova; as pessoas acrescentam 2027 em diante, estaduais e municipais. [Nota do Jarvis: responde à PERGUNTA de 19:33 do Histórico; o item "Preencher dados de configuração (feriados...)" do Fora do escopo segue valendo para tudo além desses feriados do código.]
- DECISÃO DO DONO (2026-11-04): "Pode esperar. Já prepare a próxima versão para entrar quando a máquina permitir" (resposta à pergunta se a release esperava o L9-b): a release espera o L9-b; a próxima versão começa a ser preparada em paralelo, dentro do teto da máquina.
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): citada no Histórico, decide o calendário do L7; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
- ADR 0026 (citada no pedido): o L9-a segue o princípio dela (sem dado real, não publica número)
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 23:22: QA do L9-a aprovado: docs/qa/069-z7-l9a.md (commit 53724fd, cita 5b03e4a); server 1683, pacotes e web 1436 com cobertura 100%, eslint rc 0, docs:check ok; E2E de API e2e/tests-api/sem-zero-ajuste-069-l9a.spec.ts (3 testes, caem com a função mutada para zero), commits 9f1ed9d e 2729205 (ajuste do import para o tsc do e2e); A1 a A3 recomendados (pg na CI do PR; E2E por interceptação; linhas teto e contrato no corpo do PR). DECISÃO TÉCNICA (Jarvis): falta a revisão de interface do ux-designer (E1.7) sobre o CartaoS3 e o cartão do S2; o ux-designer não tem Bash, então o parecer sai sem commit e o tech-lead o commita na abertura do PR, junto com a revalidação do review pelo commit novo do E2E, se o forge-check pedir. MELHORIA: o roteiro de QA passa a incluir e2e/ no prettier e no tsc.
- 2026-11-04 23:29: Brief do PR do L9-a reprovado: o NÃO tocar proibia os pareceres e o Entregar mandava commitar o de UX; e o review (447d66d) e o QA (53724fd) citam 5b03e4a, mas o E2E do QA entrou depois (9f1ed9d, 2729205), então o forge-check os dá por desatualizados. DECISÃO TÉCNICA (Jarvis): review e QA de novo só do delta 5b03e4a..2729205 (o E2E de API), pareceres no nome 069-z8-l9a.md citando 2729205; o tech-lead commita junto o parecer de UX (docs/ux/069-z7-l9a.md, que já cita 2729205); depois o PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `branch: feature/069-l9a-sem-zero`, `commit: 2729205fe498ef6f5756910aaee6300f0c1cd417`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-l9a-sem-zero` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-056d add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-056d commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/069-l9a-sem-zero:docs/qa/069-z8-l9a.md` · espera: contém 'commit: 2729205fe498ef6f5756910aaee6300f0c1cd417'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).