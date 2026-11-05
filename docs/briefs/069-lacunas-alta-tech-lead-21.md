Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9a-sem-zero   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: review   Cobre: E1.4

## Objetivo
Code review do lote L9-a do 069 (S3 e S2 sem zero falso enquanto não há fonte, com o CartaoS3) na ponta 5b03e4aaed32b4e36947c3be3e157bc7346742ab (pedido 069, E1.4, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/069-l9a-sem-zero`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff origin/develop...5b03e4aaed32b4e36947c3be3e157bc7346742ab`; o desenho `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote L9-a") e a proposta assinada `/home/rodrigoisensee/MetricasDSPD-056d/docs/analises/069-l9a-contrato.md` (condições (a) a (e)).

## Entregar
- "E1.4 (tech-lead): code review por lote." (E1.4)
- (E4) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-l9a-sem-zero`; revisar o lote contra o desenho, o tamanho frente ao teto de PR e os testes; parecer em `docs/reviews/069-z7-l9a.md`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/069-l9a-sem-zero`; sem PR.
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
- 2026-11-04 22:04: E1.10 cumprida pelo tech-lead: proposta docs/analises/069-l9a-contrato.md assinada "aceito com ressalvas" (sem commit), com as condições (a) textos das notas em origem.ts e notaCartaoIdSchema de O1 a O3 sem mudança; (b) docs:check com diferença só em S3 e S2; (c) hash da saída da ferramenta, gravar, fotografar e remover no mesmo PR; (d) testes do desenho, S3.md e openapi.json no mesmo PR; (e) teto M14: schema do S3 e CartaoS3.tsx juntos, ou a linha teto: excedido no PR. DECISÃO TÉCNICA (Jarvis): o L9-a vai para a implementação (node-backend com a parte de tela do CartaoS3 no mesmo lote, worktree 056d, livre desde o merge do PR 219), seguindo as cinco condições; a proposta assinada entra no commit do lote. MELHORIA ao Forge: o brief gerar --volta exige o Fora do escopo idêntico ao anterior, mas uma etapa nova no pedido obriga a mudá-lo (volta 2 do L7-a gerada como brief comum).
- 2026-11-04 22:48: L9-a entregue pelo node-backend: feature/069-l9a-sem-zero em 5b03e4aaed32b4e36947c3be3e157bc7346742ab (d5477c6: proposta assinada copiada sem mudar o texto; AJUSTE_PRIORIDADE_COM_FONTE = false, enum só da sustentação, notaCartaoIdSchema de O1 a O3 sem mudança, semParteDeAjusteDePrioridade em parte-sem-dado.ts chamada em servico.ts; S3 ajustesManuais nulo com nota na base real, S2 só com a nota, mock mantém o número; CartaoS3.tsx mostra sem dado; docs:check com diferença só em S3 e S2, aceite gravado, fotografado e removido; S2.md, S3.md, snapshots e openapi.json regerados; vitest com cobertura, typecheck, lint, prettier e docs:check verdes; linha teto: excedido, 178 linhas; linha contrato: incompatível (aceite na v1) já no commit). Divergências: o E2E de API no molde de bloqueio-sem-dado-065.spec.ts não foi escrito; o commit do lote saiu sem as linhas de atribuição. DECISÃO TÉCNICA (Jarvis): o E2E de API é trabalho do qa-engineer e entra no QA do L9-a; a falta das linhas de atribuição fica registrada e o squash do PR as traz; conferência da entrega; review, QA (com o E2E) e revisão de interface do ux-designer (E1.7, o CartaoS3 muda) ao mesmo tempo, pareceres no nome 069-z7-l9a.md.
- 2026-11-04 22:51: Entrega do L9-a conferida como não cumprida por dois pontos: web/src/components/ui/CartaoMetrica.tsx (+6 -5, só tipo, aceita a união dos dois enums de nota) fora do Entregar, e o E2E da condição (d) não escrito; PQ-1 e os outros 15 arquivos conferiram. DECISÃO TÉCNICA (Jarvis): sem volta ao autor; a mudança no CartaoMetrica.tsx fica (sem ela o S2 não mostra a nota que o Entregar pede; é só tipo e texto da nota), e o review a avalia; o E2E de API é do qa-engineer no QA do L9-a, como decidido na entrega.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `branch: feature/069-l9a-sem-zero`, `commit: 5b03e4aaed32b4e36947c3be3e157bc7346742ab`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-l9a-sem-zero` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-056d add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-056d commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/069-l9a-sem-zero:docs/reviews/069-z7-l9a.md` · espera: contém 'commit: 5b03e4aaed32b4e36947c3be3e157bc7346742ab'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).