## Objetivo
Viabilidade e dados do pedido 097 (filtros), em paralelo ao UX: filtro de time no Resumo (fluxo e sustentação) e no Apontamento (no lugar de Pessoa), busca nos filtros de lista e todas as opções de filtro vindas do dado real.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/097-resumo-filtro-time.md` (inteiro) e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/098-acelerato-todos-os-times.md` (o que vai no outro pedido).
- Código atual (só leitura, da develop em `/home/rodrigoisensee/Metricas/MetricasDSPD-demo`): `server/src/modulos/referencia/servico.ts` e `repositorio.ts` (opções de filtro), `packages/contratos/src/comum.ts:48` (TIPOS_FILTRO) e `packages/contratos/src/filtros.ts:12` (times fixos da sustentação), e o módulo do apontamento (`server/src/modulos/businessmap/apontamento/`).

## Entregar
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." (E1.2)
- (E1) (E2) (E3) (E4) (E1.2) Análise `docs/analises/097-filtros-plano.md` (novo), pela ferramenta Write, no repositório principal: (a) como o apontamento sabe o time de cada registro (pelo card, pelo workflow ou outra via; o que existe na base e o que falta), sem agregação que vire comparação entre times nem visão por pessoa nova; (b) de onde vêm o Tipo real do BusinessMap e os times reais do Acelerato, e o impacto no contrato (enum fixo virando lista dinâmica: classificação pela `docs/contratos/politica-de-mudanca.md`); (c) se o Resumo já recebe filtro na API; (d) lotes de até 150 linhas, com ordem, dependência do pedido 098 e gatilhos de segurança; (e) perguntas ao dono, se houver, cada uma com recomendação. Sem ler a base real nem `.env`; se precisar de dado, escreva a consulta só de leitura para o dono rodar. Sem commit.
- arquivos: docs/analises/097-filtros-plano.md

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md` · espera: rc=0
