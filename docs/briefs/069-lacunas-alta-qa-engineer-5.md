Agente destino: forge:qa-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l2-campos   Base: develop   Base-sha: 69e72a709e0b6f936887cf36753d1bb4c3236768
Etapa: qa   Cobre: E1.5

## Objetivo
QA do lote L2-a do 069 (mapa de campos do BusinessMap por arquivo versionado) na ponta 1f62f203e7a0ced3947ec2b9c70eab644b98bc20 (pedido 069, E1.5, K-220). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/069-l2-campos`.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff origin/develop...1f62f203e7a0ced3947ec2b9c70eab644b98bc20`; o desenho `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote L2-a"); o modelo `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/security/069-modelo-ameacas.md` (parte do L2-a, CA-069-1 a 4).

## Entregar
- "E1.5 (qa-engineer): QA por lote." (E1.5)
- (E3) (E1.5) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/069-l2-campos`; rodar com no máximo 2 workers o vitest do server e dos pacotes com cobertura, o vitest de tools/docs-contratos, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; conferir nos testes os casos de abuso CA-069-1 a 4 do modelo; registrar no parecer que os testes pg não rodam sem PostgreSQL local e ficam para a CI do PR; parecer em `docs/qa/069-l2-campos.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/feature/069-l2-campos`; sem PR.
- (E1, E2, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): citada no Histórico, decide o calendário do L7; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 20:42: Lote L2-a entregue pelo node-backend: feature/069-l2-campos em 1f62f203e7a0ced3947ec2b9c70eab644b98bc20 (f0a0347 só o modelo de ameaças, igual ao original; bm:ref-sync, dominio-businessmap.ts, lista positiva TIPOS_SELECAO_UNICA vazia, recusa de 36 e 42 nos dois lados, businessmap-dominio.json com campos vazio, docs em docs/architecture/server.md; server 1677 verdes com cobertura 100%; testes pg escritos e não rodados por falta de PostgreSQL local; grants.ts sem diff). Entrega conferida como não cumprida por dois desvios: textoSeguro exportado e tipo de planejarDominio afrouxado em server/src/modulos/referencia/dominio-acelerato.ts (com o reexport em referencia/index.ts), e CAMPOS_CUSTOMIZADOS_FORA movida para allow-list.ts (reexportada por coleta.ts). DECISÃO TÉCNICA (Jarvis): os dois desvios ficam, sem volta ao autor: o desenho manda usar o textoSeguro existente (módulo de referência compartilhado, sem mudar comportamento, o que exige exportá-lo) e a constante continua com o mesmo valor e o mesmo nome em coleta.ts; review do tech-lead, review de segurança (E1.8) e QA do L2-a avaliam, citando 1f62f20; o QA registra que os testes pg rodam na CI do PR.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não consulta bases reais.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `commit: 1f62f203e7a0ced3947ec2b9c70eab644b98bc20`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/069-l2-campos` antes do commit; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 add <parecer>` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/feature/069-l2-campos:docs/qa/069-l2-campos.md` · espera: contém 'commit: 1f62f203e7a0ced3947ec2b9c70eab644b98bc20'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).