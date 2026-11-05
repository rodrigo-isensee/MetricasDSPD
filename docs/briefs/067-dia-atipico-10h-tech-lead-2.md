Agente destino: forge:tech-lead
Pedido: 067-dia-atipico-10h
Tipo: codigo
Branch: feature/067-dia-atipico   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: merge-integracao   Cobre: E1.4

## Objetivo
PR do 067 (dia atípico acima de 10 h) para a develop e merge por squash com a CI verde (pedido 067, E1.4, K-218). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/067-dia-atipico`.

## Ler
- Os pareceres na branch: `docs/reviews/067-dia-atipico.md` e `docs/qa/067-dia-atipico.md`.

## Entregar
- "E1.4 (tech-lead): PR para a develop e merge." (E1.4)
- (E1) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/067-dia-atipico`; `forge-check pr 067-dia-atipico-10h --ref origin/feature/067-dia-atipico --base origin/develop` limpo antes de abrir; PR para a develop com título citando o pedido 067, corpo com o resumo, as decisões do dono, os 2 pareceres, a ressalva A1 (comentário de 16 h em packages/contratos/src/apontamento.ts:304) e as ações do dono depois do deploy (criterios-apontamento 2026-11-04 e test:pg); esperar os checks por laço com pausa (sem `--watch`); com todos verdes, `gh pr merge <número> --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se a develop andou, `gh pr update-branch` e esperar de novo; se um check falhar ou a permissão negar o merge, pare e relate; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Atipico acima de 10 horas" (decisão 3, valores fixos da aba do apontamento): o dia da pessoa passa a ser marcado como atípico acima de 10 horas.
- DECISÃO DO DONO (2026-11-04): "o demais pode seguir por enquanto" (recibo do 067): os outros cinco limites dos achados seguem como estão, provisórios.
- 2026-11-04 15:17: E1.3 cumprida pelo qa-engineer: aprovado sem bug em 0d7ce44 (commit: 4181b56); metricas 1258 e server 1615 com cobertura 100%, web 1420, docs:check ok; fronteira provada; mutante (10 trocado por 16) morto; a tela lê o limite da API; A1 recomendado: comentário em packages/contratos/src/apontamento.ts:304 ainda diz 16 h. DECISÃO TÉCNICA (Jarvis): E1.4 com o tech-lead: PR para a develop com o A1 como ressalva e merge por squash com a CI verde; se a permissão do ambiente negar o merge, parar e relatar.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Nada na `main` nem na `homolog`.
- Recusa do `forge-check pr`, de hook, do sandbox ou do classificador: pare e relate a mensagem literal, sem contornar.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (node-backend): troca do limite, versão de critério com data, testes e documentação." · etapa de outra delegação; continua no pedido
- "E1.2 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/067-dia-atipico --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).