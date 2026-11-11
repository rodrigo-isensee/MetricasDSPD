Agente destino: forge:software-architect
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.2

## Objetivo
Viabilidade e dados do pedido 097 (filtros), em paralelo ao UX: filtro de time no Resumo (fluxo e sustentação) e no Apontamento (no lugar de Pessoa), busca nos filtros de lista e todas as opções de filtro vindas do dado real.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/097-resumo-filtro-time.md` (inteiro) e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/098-acelerato-todos-os-times.md` (o que vai no outro pedido).
- Código atual (só leitura, da develop em `/home/rodrigoisensee/Metricas/MetricasDSPD-demo`): `server/src/modulos/referencia/servico.ts` e `repositorio.ts` (opções de filtro), `packages/contratos/src/comum.ts:48` (TIPOS_FILTRO) e `packages/contratos/src/filtros.ts:12` (times fixos da sustentação), e o módulo do apontamento (`server/src/modulos/businessmap/apontamento/`).

## Entregar
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." (E1.2)
- (E1) (E2) (E3) (E4) (E1.2) Análise `docs/analises/097-filtros-plano.md` (novo), pela ferramenta Write, no repositório principal: (a) como o apontamento sabe o time de cada registro (pelo card, pelo workflow ou outra via; o que existe na base e o que falta), sem agregação que vire comparação entre times nem visão por pessoa nova; (b) de onde vêm o Tipo real do BusinessMap e os times reais do Acelerato, e o impacto no contrato (enum fixo virando lista dinâmica: classificação pela `docs/contratos/politica-de-mudanca.md`); (c) se o Resumo já recebe filtro na API; (d) lotes de até 150 linhas, com ordem, dependência do pedido 098 e gatilhos de segurança; (e) perguntas ao dono, se houver, cada uma com recomendação. Sem ler a base real nem `.env`; se precisar de dado, escreva a consulta só de leitura para o dono rodar. Sem commit.
- arquivos: docs/analises/097-filtros-plano.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até e28647fab9d18483def9b665b17265dcb54f834330ed89c36080a03aed3a72a1 (4 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.2 (copiadas literalmente):
- - 2026-11-11 13:42: DECISÃO DO DONO (literal): "sim" e "tudo real". Recibo do 097 confirmado (E1 filtro de time no Resumo, nos dois blocos; E2 Time no lugar de Pessoa no Apontamento, capacidade igual; E3 busca digitando nos filtros de lista) e ESCOPO+: E4, todas as opções de filtro vêm do dado real (o Tipo do Operacional deixa a lista fixa TIPOS_FILTRO; os times da Sustentação deixam a lista fixa das 3 SSSC, junto com o pedido 098). Próximo: discovery com ux-designer e software-architect.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
