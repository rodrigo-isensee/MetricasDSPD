Agente destino: forge:node-backend
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9a-sem-zero   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: codigo   Cobre: E1.2

## Objetivo
Lote L9-a do 069 inteiro (servidor, contratos e a tela do CartaoS3 no mesmo lote): S3 e S2 sem zero falso enquanto não há fonte (pedido 069, E1.2, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d` (livre desde o merge do PR 219), branch nova `feature/069-l9a-sem-zero` a partir da develop.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote L9-a").
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9a-contrato.md` (a proposta de aceite assinada pelo tech-lead, com as condições (a) a (e)).

## Entregar
- "E1.2 (node-backend): implementação por lote." (E1.2)
- (E4) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-056d fetch origin develop` e `git -C /home/rodrigoisensee/MetricasDSPD-056d switch -c feature/069-l9a-sem-zero origin/develop`; copiar sem mudar o texto `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-l9a-contrato.md` para o mesmo caminho relativo na worktree e commitá-lo num commit de docs; implementar a parte do servidor e dos contratos do L9-a como o desenho descreve (constante `AJUSTE_PRIORIDADE_COM_FONTE = false` em `packages/contratos`, função irmã de `semParteDeBloqueio` em `server/src/modulos/metricas/parte-sem-dado.ts` chamada em `servico.ts` ao lado da do 065, S3 `ajustesManuais` como `number | null` com a nota, S2 só com a nota), seguindo as cinco condições (a) a (e) da assinatura ((a) textos das notas em `origem.ts`, ids das notas num enum só da sustentação e `notaCartaoIdSchema` de O1 a O3 sem mudança; (b) `docs:check` com diferença só em S3 e S2; (c) hash do aceite copiado da saída da ferramenta, e gravar, fotografar e remover no mesmo lote; (d) `docs/contratos/metricas/S3.md` e o openapi.json regerado no mesmo lote; (e) o schema do S3 e o `web/src/features/sustentacao/components/CartaoS3.tsx` no mesmo lote, sem dividir, e no relatório a contagem de linhas de código e teste para a linha `teto:` que o tech-lead põe no PR); `CartaoS3.tsx` mostra `sem dado` quando `ajustesManuais` é nulo e o S2 mostra a nota; testes do desenho (servidor: S3 real com a constante falsa sai nulo com nota, modo mock mantém o número, S2 com a nota; web: cartão S3 com nulo); vitest do server, do web e dos pacotes com cobertura, no máximo 2 workers; `pnpm exec prettier --check web packages tools` e `pnpm run docs:check` verdes; commits com `git -C /home/rodrigoisensee/MetricasDSPD-056d add <arquivos>` e `git -C /home/rodrigoisensee/MetricasDSPD-056d commit -m <mensagem> -m 'Cartão: K-220' -- <arquivos>` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-056d push -u origin HEAD:refs/heads/feature/069-l9a-sem-zero`; sem PR.
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
- 2026-11-04 21:51: E1.9 cumprida pelo software-architect: docs/analises/069-l9a-contrato.md, sem commit (S3 ajustesManuais number para number ou null, incompatível, aceite na v1; notas opcional novo no S3 e no S2, compatível; único consumidor CartaoS3.tsx do mesmo commit; S3.md e openapi.json atualizados no PR do lote). PERGUNTA técnica do arquiteto: os ids das duas notas novas entram no enum único NOTA_CARTAO_IDS (muda também O1, O2 e O3, três aceites a mais) ou num enum só da sustentação (muda só S3 e S2)? DECISÃO TÉCNICA (Jarvis): enum só da sustentação, para a mudança incompatível ficar restrita ao S3 (menor superfície, sem aceite novo em O1 a O3); etapa E1.10 aberta para o tech-lead dar o parecer e assinar a proposta antes do código. MELHORIA: a política de contratos ainda não tem a coluna "aceite na v1 permitido quando" (cartão proposto no 065 e não feito).
- 2026-11-04 22:04: E1.10 cumprida pelo tech-lead: proposta docs/analises/069-l9a-contrato.md assinada "aceito com ressalvas" (sem commit), com as condições (a) textos das notas em origem.ts e notaCartaoIdSchema de O1 a O3 sem mudança; (b) docs:check com diferença só em S3 e S2; (c) hash da saída da ferramenta, gravar, fotografar e remover no mesmo PR; (d) testes do desenho, S3.md e openapi.json no mesmo PR; (e) teto M14: schema do S3 e CartaoS3.tsx juntos, ou a linha teto: excedido no PR. DECISÃO TÉCNICA (Jarvis): o L9-a vai para a implementação (node-backend com a parte de tela do CartaoS3 no mesmo lote, worktree 056d, livre desde o merge do PR 219), seguindo as cinco condições; a proposta assinada entra no commit do lote. MELHORIA ao Forge: o brief gerar --volta exige o Fora do escopo idêntico ao anterior, mas uma etapa nova no pedido obriga a mudá-lo (volta 2 do L7-a gerada como brief comum).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Cálculo não muda (só publicação); sem versão de critério.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: o resto de `web/` além do CartaoS3, do cartão do S2 e dos testes deles, o `notaCartaoIdSchema` de O1 a O3, a política de contratos, o desenho, outras worktrees, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

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
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-056d ls-remote origin feature/069-l9a-sem-zero` · espera: contém 'refs/heads/feature/069-l9a-sem-zero'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).