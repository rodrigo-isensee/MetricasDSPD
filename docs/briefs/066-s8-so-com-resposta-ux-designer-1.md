Agente destino: forge:ux-designer
Pedido: 066-s8-so-com-resposta
Tipo: codigo
Branch: feature/066-s8   Base: develop   Base-sha: a24a27ec978e62906da5fc7778f73cfb6c6b3b15
Etapa: codigo   Cobre: E1.7

## Objetivo
Revisão de interface do cartão do S8 com os textos novos, ponta 69168ac (pedido 066, E1.7, K-217). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `feature/066-s8`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/analises/066-desenho.md` (parte do web); `/home/rodrigoisensee/Metricas/MetricasDSPD-041/web/src/features/complementares/sustentacao.tsx` (CartaoS8) e `/home/rodrigoisensee/Metricas/MetricasDSPD-041/web/src/features/complementares/notas.ts` (nota do S8).

## Entregar
- "E1.7 (ux-designer): revisão de interface do cartão do S8 com os textos novos, sem commit (o tech-lead commita no começo do review)." (E1.7)
- (E2) (E1.7) revisar se o cartão do S8 explica com clareza quando não publica (falta preencher o campo no Acelerato), se a cobertura e a coluna Com resposta se entendem, se a nota está coerente (inclusive o O que é, que ficou igual) e se a leitura é acessível; parecer em `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/ux/066-revisao-s8.md` pela ferramenta Write com `pedido: 066-s8-so-com-resposta`, `branch: feature/066-s8`, `commit: 69168ac3f0484a8fe5ddc772f64a2863e8070ceb`, veredito e achados de até 300 caracteres; sem commit.
- (E1) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "B" (S8 com 95% dos incidentes sem resposta e taxa 0% pela regra D-10): contar só os incidentes com resposta (sim ou não); abaixo de 20, a tela não publica e mostra dados insuficientes até o campo ser preenchido; a mudança de critério é registrada com data (T2.6).
- DECISÃO DO DONO (2026-11-04): "é isso" (recibo do 066): o S8 conta só os incidentes com resposta, abaixo de 20 não publica, mudança de critério registrada com data, e o cartão explica que falta preencher o campo no Acelerato quando não publica; sem mexer no Acelerato nem em outras métricas.
- 2026-11-04 14:45: E1.3 cumprida pelo react-frontend: 69168ac3f0484a8fe5ddc772f64a2863e8070ceb (push ok): quando não publica, o cartão do S8 diz que falta preencher o campo "Este problema já ocorreu nos últimos 90 dias?" no Acelerato; leitura só quando publica; cobertura "Com resposta em n de N incidentes"; coluna Com resposta; nota do S8 (como se calcula e cuidados); teste novo do caso 9 de 195; E2E COMP-12 atualizado e só tipado. DECISÃO TÉCNICA (Jarvis): revisão de interface (E1.7) antes do review, sem commit; depois review e QA; o QA roda o pronto completo que der no sandbox (cobertura do web e docs-contratos), para não repetir o PR 214.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Regras invioláveis do CLAUDE.md: nada estimado; nenhuma métrica por pessoa.
- NÃO tocar: código, testes, o desenho, outros documentos, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto da mudança da D-10 (onde está a conta, versão de critério, efeito no contrato da API e no cartão)." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação na biblioteca e no server, com testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste do cartão, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c 'commit: 69168ac3f0484a8fe5ddc772f64a2863e8070ceb' /home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/ux/066-revisao-s8.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).