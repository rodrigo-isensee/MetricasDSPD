Agente destino: forge:software-architect
Pedido: 066-s8-so-com-resposta
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 2b316e5771f1c03de39e0808c165e18132689687
Etapa: codigo   Cobre: E1.1

## Objetivo
Desenho curto da mudança do S8: denominador só com incidentes que têm resposta, abaixo de 20 não publica, versão de critério e cartão (pedido 066, E1.1, K-217).

## Ler
- Na worktree de leitura `/home/rodrigoisensee/MetricasDSPD-056d`: onde o S8 é calculado (`packages/metricas/` e `server/src/modulos/` da sustentação), a regra D-10 em `docs/architecture/data-model.md` e `docs/architecture/regras-metricas.md`, as versões de critério do Acelerato, o cartão do S8 em `web/src/` e o contrato do S8 em `packages/contratos/`; o achado M5 em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md`.

## Entregar
- "E1.1 (software-architect): desenho curto da mudança da D-10 (onde está a conta, versão de critério, efeito no contrato da API e no cartão)." (E1.1)
- (E1) (E2) (E1.1) gravar `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/066-desenho.md` pela ferramenta Write, sem commit: o que muda na conta (biblioteca compartilhada), a nova versão de critério com data e onde ela marca o gráfico, se o contrato da API muda (e se é compatível pela política de contratos), o texto do cartão quando não publica, os testes que provam, e se o web precisa mudar.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "B" (S8 com 95% dos incidentes sem resposta e taxa 0% pela regra D-10): contar só os incidentes com resposta (sim ou não); abaixo de 20, a tela não publica e mostra dados insuficientes até o campo ser preenchido; a mudança de critério é registrada com data (T2.6).
- DECISÃO DO DONO (2026-11-04): "é isso" (recibo do 066): o S8 conta só os incidentes com resposta, abaixo de 20 não publica, mudança de critério registrada com data, e o cartão explica que falta preencher o campo no Acelerato quando não publica; sem mexer no Acelerato nem em outras métricas.
- 2026-11-04 14:12: recibo confirmado pelo dono: "e isso". Sem gatilho de segurança (sem dado de pessoa, segredo, dependência nem banco novo). DECISÃO TÉCNICA (Jarvis): discovery só com o arquiteto (E1.1), porque o estado de dados insuficientes já tem padrão de tela.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Regras invioláveis do CLAUDE.md: todo cálculo pela biblioteca compartilhada; abaixo de 20 itens não publica; mudança de critério registrada com data e marcada nos gráficos; BusinessMap e Acelerato nunca se misturam.
- Sem código: só o desenho.
- NÃO tocar: código, testes, a worktree (só leitura), outros documentos, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (node-backend): implementação na biblioteca e no server, com testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste do cartão, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c 'S8' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/066-desenho.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).