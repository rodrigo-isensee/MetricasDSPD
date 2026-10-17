## Objetivo
Alinhar a especificação do pedido 011 às decisões do usuário que ela ainda contradiz, para o QA não reprovar a rastreabilidade: o E8 ainda manda listar os sistemas com 1 pessoa (contra a R-1 = B), e trechos ainda citam o custo do E7 (contra a D2 = A). Achado A-1 e riscos da sua revisão `revisao-011-front-estrategicas.md`. Etapa E3.2 do pedido 011. Grave na worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas` (branch `feature/011-front-estrategicas`), onde já está a sua correção da §4 e da §5 do E7.

## Ler
- `docs/pedidos/011-metricas-tambem-disponiveis.md`: as decisões R-1 = B (2026-10-16), T14-M1 = B, D2 = A e Q-T14-10 = B (2026-10-17).
- Na worktree: `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` e `docs/ux/revisao-011-front-estrategicas.md` (A-1 e riscos).

## Entregar
- (E3) Na especificação: revogar no E8 a listagem de sistemas (CA-18, CA-25 e onde mais aparecer), deixando só a contagem; tirar o custo do E7 da §3 (itens 2 e 13), da §7 e da §8 e as notas de §3.2 que dependem dele, trocando-o pela participação percentual de cada sistema pelas entregas do período (D2 = A); na T14, registrar a T14-M1 = B (com "outros times" oculto, só a fatia do meu time, sem o total exato) e alinhar a linha da §5 da T14 e o CA-42 à R-1 = B, que refina a Q-T14-6 = A ("outros times" publicado com um único outro time só quando ele soma 2 pessoas ou mais); no O20, o CA do destaque = A (o destaque considera só as filas a partir do compromisso; o Backlog continua desenhado, mas nunca é o destaque); e conferir se as demais decisões de 2026-10-16 já estão na especificação (O19-pct = B, O25(b) = B, T10-janela = A, B11-001 = sim), acrescentando as que faltarem. Cada mudança com a data e a decisão que a origina. Gravado com Write.
- (E3) Atualizar o seu parecer de revisão com uma nota de que o A-1 foi resolvido na especificação.
- Fora do escopo, outras etapas do pedido 011 (citadas de "### Etapas"; E1.1, E2.1, E3.1, E1.2/E2.2 e E1.3/E2.3 já feitas): "E1.1 (forge:node-backend): implementar E1 na worktree `-011-fase2`, branch `feature/011-fase2-back`."; "E2.1 (forge:node-backend): implementar E2 depois de E3.1."; "E3.1 (forge:software-architect): ADR 0020 e plano."; "E1.2/E2.2 (forge:tech-lead): code review do back da fase 2 e separação em 3 branches por nível (estratégicas, táticas, operacionais), uma por PR."; "E1.3/E2.3 (forge:security-engineer): review de segurança (gatilho: dados pessoais no O22, O26, E8 e T14)."; "E1.4/E2.4 (forge:qa-engineer): QA do back da fase 2."; "E9.2 (dono): merge na main."
- (E3) No protótipo HTML (`/home/rodrigoisensee/MetricasDSPD-local/prototipos/metricas-tambem-disponiveis/03-prototipo/`, fora do repositório), retirar a lista de sistemas do E8 e o custo do E7, como na especificação.
- Fora do escopo: código; o commit (o react-frontend commita os seus arquivos na branch).

## Decisões e restrições
- Decisões do usuário (pedido 011): R-1 = B (2026-10-16, reidentificação no E8 e na T14; não confundir com a R-1 = A do O24, de 2026-10-14), O20-destaque = A, O19-pct = B, O25(b) = B, T10-janela = A, B11-001 = sim (2026-10-16), T14-M1 = B, D2 = A, Q-T14-10 = B (2026-10-17); nenhuma reaberta. Se um trecho depender de regra que os documentos não decidem, registre como pergunta ao usuário.
- Valem também as demais decisões do usuário do pedido 011 ("Decisões do usuário" e as duas seções de 2026-10-17), sem reabrir nenhuma: D-8, D-5', Q-a = 1 passagem, Q-b = conta (O26), Dados antigos = A, D-6', D-10, D-14', R-4, R-2', R-1 = A (O24), R-2 = B, T14 nova = A, Q-T14-1 = B, Q-T14-5 = D, Q-T14-6 = A (refinada pela R-1 = B), Q-T14-9 = A, P-1 = A, motivos de descarte, prioridade = A, ordem por nível e "4-seguir"; D-1' e Q-E7-1 foram revistas pela D2 = A. ADR 0020 (`docs/architecture/adr/0020-protecao-de-pessoa-no-coletor.md`) para o E8 e a T14.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal e as outras worktrees.

## Pronto quando
- PQ-1 (cmd): `grep -n -i -F -e 'custo por demanda' -e 'R$' /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: linhas=0
- PQ-2 (cmd): `grep -n -F "T14-M1" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/ux/metricas-tambem-disponiveis/02-especificacao.md` · espera: linhas>=1

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
