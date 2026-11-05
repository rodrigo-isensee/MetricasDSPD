Agente destino: forge:tech-lead
Pedido: 066-s8-so-com-resposta
Tipo: codigo
Branch: feature/066-s8   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: merge-integracao   Cobre: E1.6

## Objetivo
PR do 066 (S8 só com incidentes que têm resposta) para a develop e merge por squash com a CI verde (pedido 066, E1.6, K-217). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/066-s8`.

## Ler
- Os pareceres na branch: `docs/reviews/066-s8.md` e `docs/qa/066-s8.md`.

## Entregar
- "E1.6 (tech-lead): PR para a develop e merge." (E1.6)
- (E1) (E2) (E1.6) `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 pull --ff-only origin feature/066-s8`; `forge-check pr 066-s8-so-com-resposta --ref origin/feature/066-s8 --base origin/develop` limpo antes de abrir; PR para a develop com título citando o pedido 066, corpo com o resumo, as decisões do dono, os 3 pareceres (review, QA e interface), as ressalvas recomendadas e a ação do dono depois do deploy (criterios-ac com a data do deploy); esperar os checks por laço com pausa (sem `--watch`); com todos verdes, `gh pr merge <número> --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <head do PR>`, sem `--admin`; se a develop andou, `gh pr update-branch` e esperar de novo; se um check falhar ou a permissão negar o merge, pare e relate; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "B" (S8 com 95% dos incidentes sem resposta e taxa 0% pela regra D-10): contar só os incidentes com resposta (sim ou não); abaixo de 20, a tela não publica e mostra dados insuficientes até o campo ser preenchido; a mudança de critério é registrada com data (T2.6).
- DECISÃO DO DONO (2026-11-04): "é isso" (recibo do 066): o S8 conta só os incidentes com resposta, abaixo de 20 não publica, mudança de critério registrada com data, e o cartão explica que falta preencher o campo no Acelerato quando não publica; sem mexer no Acelerato nem em outras métricas.
- 2026-11-04 15:29: E1.5 cumprida pelo qa-engineer: aprovado sem bug em 2b394b5 (commit: 7073c1c); server 1616 e web com cobertura 100%, docs-contratos 102, docs:check ok, E2E COMP-12 2/2; recomendados: A1 sem teste ligando o S8 real à marca 066 no cartão, A2 e A3 os do review (reabertura e posição do aviso). DECISÃO TÉCNICA (Jarvis): E1.6 com o tech-lead: PR para a develop com os recomendados como ressalva e merge por squash com a CI verde; se a permissão do ambiente negar o merge, parar e relatar.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Nada na `main` nem na `homolog`.
- Recusa do `forge-check pr`, de hook, do sandbox ou do classificador: pare e relate a mensagem literal, sem contornar.
- O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto da mudança da D-10 (onde está a conta, versão de critério, efeito no contrato da API e no cartão)." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação na biblioteca e no server, com testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste do cartão, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface do cartão do S8 com os textos novos, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/066-s8 --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).