Agente destino: forge:tech-lead
Pedido: 069-lacunas-alta
Tipo: codigo
Branch: feature/069-m1-frescor   Base: develop   Base-sha: b86dd9f9fc1e7ef1fe6734adec94a3bbb8b62359
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
PR do lote M1-a do 069 (aviso de coleta parcial na aba Apontamento) para a develop e merge por squash com a CI verde (pedido 069, E1.6, K-220). Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/069-m1-frescor`.

## Ler
- Os pareceres na branch: `docs/reviews/069-m1-frescor.md`, `docs/qa/069-m1-frescor.md` e `docs/ux/069-m1-frescor-revisao.md`.

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge por lote." (E1.6)
- (E2) (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/069-m1-frescor`; `forge-check pr 069-lacunas-alta --ref origin/feature/069-m1-frescor --base origin/develop` limpo antes de abrir; PR para a develop com título citando o pedido 069 e o lote M1-a, corpo pelo `--body-file` num arquivo escrito pela ferramenta Write, com o resumo, os 3 pareceres (a revisão de interface é de db7a8e1 e o texto final que ela pediu está em 0fb20aa e 01f29bc) e a dívida A1 (helper fmtHoraCurta); se a develop andou e o PR acusar conflito ou atraso, `gh pr update-branch` e esperar de novo; esperar os checks por laço com pausa (sem `--watch`); com todos verdes, `gh pr merge feature/069-m1-frescor --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se um check falhar, o forge-check pedir parecer novo ou a permissão negar o merge, pare e relate; sem promover para a homolog.
- (E1, E3, E4, E5) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "pode comecar voce tem a diretiva de nunca ficar parado" (resposta à pergunta "Quer que o time comece também as lacunas de prioridade alta?"): começar as lacunas de prioridade alta (K-206 a K-210).
### Do registro citado docs/pedidos/064-lacunas-dado-real.md (todas as linhas DECISÃO DO DONO; contexto, não ampliam o Entregar)
- DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0027 (citada no pedido): citada no Histórico, decide o calendário do L7; nada nesta entrega
- ADR 0025 (citada no pedido): citada no Histórico só como molde da ADR 0027; nada nesta entrega
### Do Histórico deste pedido, docs/pedidos/069-lacunas-alta.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-04 20:14: Lote M1-a: review e QA aprovados na ponta 01f29bc (review da5ff87, A1 recomendado: helper fmtHoraCurta no lugar do slice(11, 16) em CabecalhoApontamento.tsx:45, fica como dívida; QA fd65487, commit: 01f29bc, 0 bugs; contratos 204, server 1627, web 1435, docs-contratos 102, prettier e docs:check ok; A1 recomendado: caso com offsets diferentes, sem risco hoje). DECISÃO TÉCNICA (Jarvis): PR do lote M1-a para a develop e merge por squash com a CI verde; o A1 não volta ao autor.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- Nada na `main` nem na `homolog`.
- NÃO tocar: código, testes, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho das cinco correções (onde muda, contrato, versão de critério quando o cálculo muda, testes), dividido em lotes pequenos." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação por lote." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajustes de tela que o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review por lote." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA por lote." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do lote que muda tela, contra a especificação validada." · etapa de outra delegação; continua no pedido
- "E1.8 (security-engineer): modelo de ameaças dos lotes com gatilho de segurança (L2-a, L2-c, L9-b) antes deles, e review de segurança desses lotes." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/069-m1-frescor --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).