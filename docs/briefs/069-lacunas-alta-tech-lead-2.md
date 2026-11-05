Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-l3-equipe   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
PR do lote L3-a do 069 para a develop e merge por squash com a CI verde (pedido 069, E1.6, K-220). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/069-l3-equipe`.

## Ler
- Os pareceres na branch: `docs/reviews/069-l3-equipe.md` e `docs/qa/069-l3-equipe.md`.

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge por lote." (E1.6)
- (E1) (E1.6) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/069-l3-equipe`; `forge-check pr 069-lacunas-alta --ref origin/feature/069-l3-equipe --base origin/develop` limpo antes de abrir; PR para a develop com título citando o pedido 069 e o lote L3-a, corpo com o resumo, os 2 pareceres e a ressalva A1 (O20 com o mesmo padrão, dívida); esperar os checks por laço com pausa (sem `--watch`); com todos verdes, `gh pr merge feature/069-l3-equipe --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se a develop andou, `gh pr update-branch` e esperar de novo; se um check falhar, o forge-check pedir parecer novo ou a permissão negar o merge, pare e relate; sem promover para a homolog.
- (E2, E3, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- 2026-11-04 18:41: Lote L3-a: review aprovado em 80b0ac3 e QA aprovado em 40a6b96, os dois com commit: 4f52c57 (metricas 1262 e server 1625 com cobertura 100%, docs-contratos 102, prettier e docs:check ok); A1 recomendado: o O20 repete o padrão quadro-<slug> (dívida). DECISÃO TÉCNICA (Jarvis): PR do lote para a develop e merge por squash com a CI verde.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- (064-lacunas-dado-real) - 2026-11-04 08:04: DECISÃO DO DONO "C" (bloqueados no mapa real): A agora (tirar a tela de bloqueados do mapa real, Sem dado real até a coleta gravar bloqueios) e B depois (coleta grava bloqueios) como cartão. DECISÃO TÉCNICA (Jarvis): A vira o pedido 065 (modo implementar; este pedido segue em analisar); B vira o cartão K-204.
- (064-lacunas-dado-real) - 2026-11-04 14:11: DECISÃO DO DONO "B" (S8): contar só os incidentes com resposta; abaixo de 20 não publica. DECISÃO TÉCNICA (Jarvis): vira o pedido 066 (implementar).
- (064-lacunas-dado-real) - 2026-11-04 14:13: DECISÃO DO DONO "Atipico acima de 10 horas" (L6): o dia atípico passa a acima de 10 h. DECISÃO TÉCNICA (Jarvis): vira o pedido 067 (implementar); os outros limites seguem provisórios até o dono dizer o contrário (suposição no recibo).
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- Nada na `main` nem na `homolog`.
- NÃO tocar: código, testes, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/069-l3-equipe --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).