Agente destino: forge:ux-designer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9a-sem-zero   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: review   Cobre: E1.7

## Objetivo
Revisão de interface do lote L9-a do 069: o CartaoS3 com `ajustesManuais` nulo mostrando sem dado e a nota, e o cartão do S2 com a nota (pedido 069, E1.7, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/069-l9a-sem-zero`, ponta 2729205.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056d/web/src/features/sustentacao/components/CartaoS3.tsx`, o cartão do S2 em `/home/rodrigoisensee/MetricasDSPD-056d/web/src/features/sustentacao/components/` e `/home/rodrigoisensee/MetricasDSPD-056d/web/src/components/ui/CartaoMetrica.tsx` (só a parte das notas).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/dashboard-metricas/especificacao.md` (anatomia do cartão de métrica, a nota e o estado sem dado) e o padrão do 065 em `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/065-revisao-bloqueados.md`.

## Entregar
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." (E1.7)
- (E4) (E1.7) revisar se o S3 mostra `sem dado` de forma clara quando o ajuste manual não tem fonte, sem parecer zero nem erro, e se a nota do S3 e a do S2 explicam a falta de fonte com leitura acessível, coerente com o padrão do 065; parecer em `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/069-z7-l9a.md` pela ferramenta Write com `pedido: 069-lacunas-alta`, `branch: feature/069-l9a-sem-zero`, `commit: 2729205`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses); sem commit (o tech-lead commita na abertura do PR).
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
- 2026-11-04 22:48: L9-a entregue pelo node-backend: feature/069-l9a-sem-zero em 5b03e4aaed32b4e36947c3be3e157bc7346742ab (d5477c6: proposta assinada copiada sem mudar o texto; AJUSTE_PRIORIDADE_COM_FONTE = false, enum só da sustentação, notaCartaoIdSchema de O1 a O3 sem mudança, semParteDeAjusteDePrioridade em parte-sem-dado.ts chamada em servico.ts; S3 ajustesManuais nulo com nota na base real, S2 só com a nota, mock mantém o número; CartaoS3.tsx mostra sem dado; docs:check com diferença só em S3 e S2, aceite gravado, fotografado e removido; S2.md, S3.md, snapshots e openapi.json regerados; vitest com cobertura, typecheck, lint, prettier e docs:check verdes; linha teto: excedido, 178 linhas; linha contrato: incompatível (aceite na v1) já no commit). Divergências: o E2E de API no molde de bloqueio-sem-dado-065.spec.ts não foi escrito; o commit do lote saiu sem as linhas de atribuição. DECISÃO TÉCNICA (Jarvis): o E2E de API é trabalho do qa-engineer e entra no QA do L9-a; a falta das linhas de atribuição fica registrada e o squash do PR as traz; conferência da entrega; review, QA (com o E2E) e revisão de interface do ux-designer (E1.7, o CartaoS3 muda) ao mesmo tempo, pareceres no nome 069-z7-l9a.md.
- 2026-11-04 23:22: QA do L9-a aprovado: docs/qa/069-z7-l9a.md (commit 53724fd, cita 5b03e4a); server 1683, pacotes e web 1436 com cobertura 100%, eslint rc 0, docs:check ok; E2E de API e2e/tests-api/sem-zero-ajuste-069-l9a.spec.ts (3 testes, caem com a função mutada para zero), commits 9f1ed9d e 2729205 (ajuste do import para o tsc do e2e); A1 a A3 recomendados (pg na CI do PR; E2E por interceptação; linhas teto e contrato no corpo do PR). DECISÃO TÉCNICA (Jarvis): falta a revisão de interface do ux-designer (E1.7) sobre o CartaoS3 e o cartão do S2; o ux-designer não tem Bash, então o parecer sai sem commit e o tech-lead o commita na abertura do PR, junto com a revalidação do review pelo commit novo do E2E, se o forge-check pedir. MELHORIA: o roteiro de QA passa a incluir e2e/ no prettier e no tsc.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Dúvida de regra de negócio vira pergunta no relatório, nunca decisão no parecer.
- NÃO tocar: código, testes, outros pareceres, a especificação, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/MetricasDSPD-056d/docs/ux/069-z7-l9a.md` existe e contém 'commit: 2729205'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).