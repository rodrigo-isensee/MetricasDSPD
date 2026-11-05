Agente destino: forge:qa-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-m1-frescor   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: qa   Cobre: E1.5

## Objetivo
QA do lote M1-a do 069 (frescor.ultimaTentativa no server e aviso de coleta parcial na tela) na ponta 01f29bc9a5e63e3f8a795120f6ee4862d9066cb7 (pedido 069, E1.5, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/069-m1-frescor`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff origin/develop...01f29bc9a5e63e3f8a795120f6ee4862d9066cb7`; o desenho `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção "Lote M1-a").

## Entregar
- "E1.5 (qa-engineer): QA por lote." (E1.5)
- (E2) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-m1-frescor`; rodar com no máximo 2 workers o vitest de packages/contratos, do server e do web com cobertura, o vitest de tools/docs-contratos, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; conferir os casos do desenho (parcial sem ok, ok depois de parcial, sem coleta, aviso presente e ausente); regravar o parecer `docs/qa/069-m1-frescor.md` pela ferramenta Write com `commit: 01f29bc9a5e63e3f8a795120f6ee4862d9066cb7` e o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/069-m1-frescor`; sem PR.
- (E1, E3, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- ADR 0027 (citada no pedido): não se aplica a este lote (é do L7)
- ADR 0025 (citada no pedido): não se aplica a este lote
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 19:05: Lote M1-a, parte do server, entregue pelo node-backend: feature/069-m1-frescor em bfaf8072ccd9d58b385c316c669606b7d9a24386 (frescor.ultimaTentativa opcional e nullable em packages/contratos/src/apontamento.ts, montarApontamento preenche, docs/api/apontamento.md e openapi.json regenerado, testes em apontamento-rota.test.ts; docs:check ok, server, contratos 204 e metricas 1258 verdes, prettier ok). DECISÃO TÉCNICA (Jarvis): a parte de tela do M1-a vai ao react-frontend na mesma worktree e branch, depois o review e o QA do lote inteiro.
- 2026-11-04 19:56: Lote M1-a: voltas entregues: feature/069-m1-frescor em 01f29bc9a5e63e3f8a795120f6ee4862d9066cb7 (node-backend f50f7dd: A1 e A2 do review no teste do server; react-frontend 0fb20aa, b1bf7d9 e 01f29bc: texto final do aviso, teste da fronteira, registro do texto em docs/ux/059-aba-apontamento-textos.md e o parecer de UX). DECISÃO TÉCNICA (Jarvis): review e QA de novo do lote M1-a na ponta 01f29bc, ao mesmo tempo; os pareceres novos substituem os de db7a8e1.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 069-lacunas-alta`, `commit: 01f29bc9a5e63e3f8a795120f6ee4862d9066cb7`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-m1-frescor` antes do commit; commit só do próprio parecer com `git -C /home/rodrigoisensee/MetricasDSPD-056d commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/069-m1-frescor:docs/qa/069-m1-frescor.md` · espera: contém 'commit: 01f29bc9a5e63e3f8a795120f6ee4862d9066cb7'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).