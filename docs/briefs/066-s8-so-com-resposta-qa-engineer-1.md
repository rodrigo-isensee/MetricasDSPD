Agente destino: forge:qa-engineer
Pedido: 066-s8-so-com-resposta
Tipo: codigo
Branch: feature/066-s8   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: qa   Cobre: E1.5

## Objetivo
QA do 066 (S8 só com incidentes que têm resposta) na ponta 7073c1ce637d2ecd42c5a34a396e15c530b76f67 (pedido 066, E1.5, K-217). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/066-s8`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/analises/066-desenho.md`; o review `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/066-s8.md`; o parecer de interface `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/ux/066-revisao-s8.md`.

## Entregar
- "E1.5 (qa-engineer): QA." (E1.5)
- (E1) (E2) (E1.5) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/066-s8`; testar contra o desenho e as decisões: S8 com 9 de 195 não publica e mostra o texto de falta de preenchimento no Acelerato, fronteiras de 19 e 20, versão de critério marcada no gráfico, nunca 0% com sem resposta; rodar com no máximo 2 workers o vitest do server e do web com cobertura, o vitest de tools/docs-contratos, o `pnpm run docs:check` e o E2E COMP-12 (playwright, 2 workers); não criar teste novo depois do review (se faltar, relate); parecer `docs/qa/066-s8.md` pela ferramenta Write com veredito, `commit: 7073c1ce637d2ecd42c5a34a396e15c530b76f67`, o resultado real e bloco `## Achados` (severidade só entre parênteses); commit só do parecer com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-217' -- docs/qa/066-s8.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/feature/066-s8`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "B" (S8 com 95% dos incidentes sem resposta e taxa 0% pela regra D-10): contar só os incidentes com resposta (sim ou não); abaixo de 20, a tela não publica e mostra dados insuficientes até o campo ser preenchido; a mudança de critério é registrada com data (T2.6).
- DECISÃO DO DONO (2026-11-04): "é isso" (recibo do 066): o S8 conta só os incidentes com resposta, abaixo de 20 não publica, mudança de critério registrada com data, e o cartão explica que falta preencher o campo no Acelerato quando não publica; sem mexer no Acelerato nem em outras métricas.
- 2026-11-04 15:04: E1.4 cumprida pelo tech-lead: parecer de interface commitado em 7073c1ce637d2ecd42c5a34a396e15c530b76f67; review aprovado em 80f7e8d (commit: 7073c1c), sem bloqueante; docs:check ok; server 1616 e web 1421 com cobertura 100%; recomendados: A1 reabertura contra reincidência no comoLer (notas.ts:153), A2 aviso depois do gráfico (sustentacao.tsx:128), A3 comentário longo em s8.ts. DECISÃO TÉCNICA (Jarvis): E1.5 com o QA citando 7073c1c, rodando também docs:check e a cobertura do web, para não repetir o PR 214; os recomendados ficam como ressalva no PR.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest e playwright com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto da mudança da D-10 (onde está a conta, versão de critério, efeito no contrato da API e no cartão)." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação na biblioteca e no server, com testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste do cartão, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do cartão do S8 com os textos novos, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/feature/066-s8:docs/qa/066-s8.md` · espera: contém 'commit: 7073c1ce637d2ecd42c5a34a396e15c530b76f67'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).