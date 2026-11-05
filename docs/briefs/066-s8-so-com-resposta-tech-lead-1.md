Agente destino: forge:tech-lead
Pedido: 066-s8-so-com-resposta
Tipo: codigo
Branch: feature/066-s8   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: review   Cobre: E1.4

## Objetivo
Code review do 066 (S8 só com incidentes que têm resposta), depois de commitar o parecer de interface (pedido 066, E1.4, K-217). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/066-s8`, ponta 69168ac.

## Ler
- `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 diff origin/develop...origin/feature/066-s8`; o desenho `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/analises/066-desenho.md`; o parecer de interface `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/ux/066-revisao-s8.md` (sem commit).

## Entregar
- "E1.4 (tech-lead): code review." (E1.4)
- (E1) (E2) (E1.4) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/066-s8`; `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 add docs/ux/066-revisao-s8.md` e `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 commit -m <mensagem> -m 'Cartão: K-217' -- docs/ux/066-revisao-s8.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/feature/066-s8`; anote a ponta; review nessa ponta: adaptador extrasAC, conta pela biblioteca, abaixo de 20 não publica, versão de critério com data, contrato e docs, textos do cartão, testes; avaliar os médios do UX; rodar `pnpm run docs:check` e o vitest do server e do web com cobertura, no máximo 2 workers; parecer em `docs/reviews/066-s8.md` pela ferramenta Write com `commit:` = a ponta anotada, veredito e achados de até 300 caracteres (severidade só entre parênteses); commit só do parecer; push; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "B" (S8 com 95% dos incidentes sem resposta e taxa 0% pela regra D-10): contar só os incidentes com resposta (sim ou não); abaixo de 20, a tela não publica e mostra dados insuficientes até o campo ser preenchido; a mudança de critério é registrada com data (T2.6).
- DECISÃO DO DONO (2026-11-04): "é isso" (recibo do 066): o S8 conta só os incidentes com resposta, abaixo de 20 não publica, mudança de critério registrada com data, e o cartão explica que falta preencher o campo no Acelerato quando não publica; sem mexer no Acelerato nem em outras métricas.
- 2026-11-04 14:48: E1.7 cumprida pelo ux-designer: aprovado com ressalvas, sem crítico nem alto (docs/ux/066-revisao-s8.md sem commit na worktree 041, commit: 69168ac): médio 1 reabertura no comoLer contra reincidência no resto do cartão; médio 2 o aviso de falta de preenchimento fica no fim do cartão; baixos: contraste de text-atencao e o caso de zero respostas. DECISÃO TÉCNICA (Jarvis): E1.4 com o tech-lead: commit do parecer de interface e review na ponta seguinte; os médios ficam para o review avaliar; depois o QA.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, outros documentos, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto da mudança da D-10 (onde está a conta, versão de critério, efeito no contrato da API e no cartão)." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação na biblioteca e no server, com testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste do cartão, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do cartão do S8 com os textos novos, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log --format=%H -1 origin/feature/066-s8 -- docs/reviews/066-s8.md` · espera: linhas=1
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log --format=%H -1 origin/feature/066-s8 -- docs/ux/066-revisao-s8.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).