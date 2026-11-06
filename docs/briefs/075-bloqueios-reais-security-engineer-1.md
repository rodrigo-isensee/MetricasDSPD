Agente destino: forge:security-engineer
Pedido: 075-bloqueios-reais
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.2

## Objetivo
Modelo de ameaças do pedido 075 (K-204): a coleta do BusinessMap passa a gravar bloqueios reais (fato_bloqueio e evt_bloqueio a partir do block_reason do staging); gatilho de segurança: coleta, banco e possível dado de pessoa ou texto livre no motivo do bloqueio (pedido 075, E1.2). Leitura no checkout da develop em `/home/rodrigoisensee/MetricasDSPD-056d` (HEAD f21220fe, sem branch).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/075-bloqueios-reais.md` (Escopo, Etapas).
- Na 056d: a allow-list do BusinessMap (`server/src/modulos/businessmap/allow-list.ts`), os GRANTs (procure `grants.ts` em `server/src/`), as tabelas `fato_bloqueio` e `evt_bloqueio` e o modelo de ameaças anterior do BusinessMap (procure `modelo-ameacas` em `docs/security/`); só os trechos que a tarefa exige.

## Entregar
- "E1.2 (security-engineer): modelo de ameaças em docs/security/075-modelo-ameacas.md, só leitura, sem commit." (E1.2)
- (E2) (E1.2) Escrever `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/075-modelo-ameacas.md` pela ferramenta Write, sem commit: ativos, fronteiras e casos de abuso da mudança (texto livre ou nome de pessoa no motivo e no comentário do bloqueio, quem bloqueou, GRANT do papel da API, carga incremental, volume), com os controles exigidos de cada um e os testes que os provam; o que for regra de negócio vira pergunta ao dono.
- (E1, E3) Nada a entregar aqui: não nesta delegação.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO` própria; a origem é a decisão "C" do dono no pedido 064.
- Nenhuma métrica serve para avaliação individual; quem bloqueou não pode virar ranking nem chegar à API.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- NÃO tocar: outros arquivos (ADRs, código, testes, `CLAUDE.md`), as worktrees (só leitura na 056d), a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho em docs/analises/075-desenho.md, só leitura, sem commit; regra de negócio vira pergunta ao dono." · etapa de outra delegação; continua no pedido
- "E1.3 (dono): validar o desenho e responder as perguntas." · etapa de outra delegação; continua no pedido
- "E3.1 (software-architect): plano técnico com lotes depois da validação." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/075-modelo-ameacas.md` · o modelo existe com casos de abuso e controles

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
