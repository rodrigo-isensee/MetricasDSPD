Agente destino: forge:qa-engineer
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l3-equipe   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: qa   Cobre: E1.5

## Objetivo
QA do lote L3-a do 069 (filtro de equipe do O2 pela regra do O1) na ponta 4f52c57ad6b2a75d7b0e79232589ca05b1f3db31 (pedido 069, E1.5, K-220). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/069-l3-equipe`.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff origin/develop...4f52c57ad6b2a75d7b0e79232589ca05b1f3db31`; o desenho `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/069-desenho.md` (seção do L3).

## Entregar
- "E1.5 (qa-engineer): QA por lote." (E1.5)
- (E1) (E1.5) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/069-l3-equipe`; rodar com no máximo 2 workers o vitest de packages/metricas e do server com cobertura, o vitest de tools/docs-contratos, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; conferir que o O2 com filtro de equipe acha as colunas na base real e na semeada e que o O1 não mudou; parecer em `docs/qa/069-l3-equipe.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/feature/069-l3-equipe`; sem PR.
- (E2, E3, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- 2026-11-04 18:27: Lote L3-a entregue pelo node-backend: feature/069-l3-equipe em 4f52c57ad6b2a75d7b0e79232589ca05b1f3db31 (helper colunasDaEquipe em packages/metricas/src/businessmap/comum.ts, usado no O1 sem mudar comportamento e no O2; testes em o2.equipe.test.ts; metricas 1262 com cobertura 100%, server 1625, prettier e docs:check verdes; O20 fica como dívida). DECISÃO TÉCNICA (Jarvis): review e QA do lote ao mesmo tempo citando 4f52c57, sem revisão de interface (sem mudança de tela).
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064-lacunas-dado-real) - 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064-lacunas-dado-real) - 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064-lacunas-dado-real) - 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- Outro parecer é gravado ao mesmo tempo nesta worktree: pull antes do commit; commit só do próprio parecer com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-220' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos e repita.
- O parecer é gravado inteiro pela ferramenta Write, com `commit: 4f52c57ad6b2a75d7b0e79232589ca05b1f3db31`, veredito e bloco `## Achados` (até 300 caracteres, severidade só entre parênteses); não crie teste novo (se faltar, relate).
- NÃO tocar: código, testes, o outro parecer, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge por lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/feature/069-l3-equipe:docs/qa/069-l3-equipe.md` · espera: contém 'commit: 4f52c57ad6b2a75d7b0e79232589ca05b1f3db31'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).