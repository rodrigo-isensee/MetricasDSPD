Agente destino: forge:security-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l7-calendario   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: review   Cobre: E1.8

## Objetivo
Review de segurança do lote L7-a do 069 depois do merge da develop (L2-a e M1-a) com o conflito resolvido em docs/architecture/server.md na ponta 5648e0ef42e081497657aaf8dca968859c5f69a1 (pedido 069, E1.8, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/069-l7-calendario`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d show 5648e0ef42e081497657aaf8dca968859c5f69a1 --stat` e `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/develop...5648e0ef42e081497657aaf8dca968859c5f69a1` (o lote contra a develop atual; só a resolução é nova, o resto foi revisto nos pareceres z6).
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/security/069-modelo-ameacas.md` (controles e casos de abuso do L2-a).

## Entregar
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." (E1.8)
- (E5) (E1.8) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7-calendario`; o lote contra a develop atual em `git -C /home/rodrigoisensee/MetricasDSPD-052d diff origin/develop...5648e0ef42e081497657aaf8dca968859c5f69a1`: a resolução do conflito e os arquivos que entraram dos dois lados (server/package.json com os dois scripts, dominio-acelerato.ts e referencia/index.ts), sem dependência nem GRANT novos; parecer em `docs/security/069-z8-l7a.md`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/069-l7-calendario`; sem PR.
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
- 2026-11-04 23:18: PR 222 do L7-a em conflito com a develop (L2-a e M1-a entraram): conflito só em docs/architecture/server.md (seções do bm:ref-sync e do ref:sync-calendario no mesmo ponto), resolvido pelo tech-lead mantendo as duas, no merge commit local 5648e0ef42e081497657aaf8dca968859c5f69a1 da worktree 052d (não enviado); server/package.json, dominio-acelerato.ts e referencia/index.ts entraram sem conflito; o forge-check pr cobra os três pareceres de novo sobre a ponta nova. DECISÃO TÉCNICA (Jarvis): o tech-lead envia 5648e0e; review, QA e segurança conferem só a resolução (diff ea6222d..5648e0e restrito ao lote, com o que veio da develop já revisto nos PRs 219 e 220), pareceres no nome 069-z8-l7a.md; depois o merge. MELHORIA ao Forge: resolução de conflito só em documentação invalida os três pareceres.
- 2026-11-04 23:41: Resolução de conflito do L7-a enviada pelo dono (mensagem do assistente do app: "o push do L7-a foi feito por mim (git push origin HEAD:refs/heads/feature/069-l7-calendario, rc=0). O remoto agora esta em 5648e0e (a resolucao de conflito com a develop). Pode seguir com o L7-a."). DECISÃO TÉCNICA (Jarvis): review, QA e segurança do L7-a sobre 5648e0ef42e081497657aaf8dca968859c5f69a1, conferindo só a resolução (o lote contra origin/develop, com o que veio da develop já revisto nos PRs 219 e 220), pareceres no nome 069-z8-l7a.md; depois o merge do PR 222. MELHORIA ao Forge: o forge-check brief recusa o brief que manda enviar um commit que só existe na worktree, e a ação teve de ir ao dono.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `branch: feature/069-l7-calendario`, `commit: 5648e0ef42e081497657aaf8dca968859c5f69a1`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/069-l7-calendario` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052d add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.9 (software-architect): proposta de aceite na v1 da mudança de tipo do contrato do lote L9-a (S3 ajustesManuais anulável), em docs/analises/069-l9a-contrato.md, para o tech-lead assinar antes do código." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): parecer e assinatura da proposta de aceite do contrato do L9-a em docs/analises/069-l9a-contrato.md, antes do código do lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/069-l7-calendario:docs/security/069-z8-l7a.md` · espera: contém 'commit: 5648e0ef42e081497657aaf8dca968859c5f69a1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).