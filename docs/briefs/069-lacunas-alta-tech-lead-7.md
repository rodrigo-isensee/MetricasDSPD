Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l9-etapa   Base: develop   Base-sha: 69e72a709e0b6f936887cf36753d1bb4c3236768
Etapa: review   Cobre: E1.4

## Objetivo
Code review do lote L9-b do 069 (campos de etapa do Acelerato até o staging) na ponta fb8ea39e27f54e3e7023e86a5bdcae494143ae32 (pedido 069, E1.4, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/069-l9-etapa`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052c diff origin/develop...fb8ea39e27f54e3e7023e86a5bdcae494143ae32`; o desenho `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote L9-b"); o modelo `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/069-modelo-ameacas.md` (parte do L9-b, CA-069-6 a 11).

## Entregar
- "E1.4 (tech-lead): code review por lote." (E1.4)
- (E4) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/069-l9-etapa`; revisar as consultas Q6 e Q7, a constante de nomes, a allow-list, o staging, o hash e a versão de critério, e os testes, contra o desenho; avaliar os desvios relatados (nomes Q6 e Q7, CHAR_LENGTH(TRIM(valor)) > 0, recusa por tipo contendo "text") e o tamanho do lote (+387 linhas) frente ao teto de PR; parecer em `docs/reviews/069-l9-etapa.md`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/069-l9-etapa`; sem PR.
- (E1, E2, E3, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): citada no Histórico, decide o calendário do L7; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 20:38: Lote L9-b entregue pelo node-backend: feature/069-l9-etapa em fb8ea39e27f54e3e7023e86a5bdcae494143ae32 (consultas Q6_CAMPOS_ETAPA_LISTA e Q7_CAMPOS_ETAPA_PREENCHIDO, porque Q4 já existe; constante CAMPOS_ETAPA_F3 com 7 nomes lista e 2 preenchido; Q7 só projeta o booleano, com CHAR_LENGTH(TRIM(valor)) > 0; recusa pelo tipo quando contém "text"; domínios cpe_* vazios até a P-DS-19; versão de critério 069:L9-b-campos-etapa sem métrica afetada; server 1646 verdes com cobertura 100%, docs:check e prettier ok; grants.ts sem diff; 13 arquivos, +387 -24). DECISÃO TÉCNICA (Jarvis): review do tech-lead, review de segurança do security-engineer (E1.8) e QA do lote L9-b ao mesmo tempo citando fb8ea39; sem revisão de interface (sem tela).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não consulta bases reais.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `commit: fb8ea39e27f54e3e7023e86a5bdcae494143ae32`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052c pull --ff-only origin feature/069-l9-etapa` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052c add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052c commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c show origin/feature/069-l9-etapa:docs/reviews/069-l9-etapa.md` · espera: contém 'commit: fb8ea39e27f54e3e7023e86a5bdcae494143ae32'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).