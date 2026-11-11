Agente destino: forge:software-architect
Pedido: 098-acelerato-todos-os-times
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Discovery do pedido 098: o dono decidiu "tanto bm quanto acelerato sao todos os times". No Acelerato a coleta só aceita o tipo "DSPD - SSSC", as organizações do DSPD e as equipes SSSC TOTVS, SENIOR e FLUIG; no BusinessMap o filtro "Equipe" mostra 47 times com o nome provisório "Workflow <id>" (migração 0019), e o dono viu só SSC com nome.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/098-acelerato-todos-os-times.md` (inteiro) e `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md` (o risco do 098 E4 com `dim_card.equipe`).
- Na develop (`/home/rodrigoisensee/Metricas/MetricasDSPD-demo`): `docs/architecture/fontes/acelerato-listas.md`, `docs/architecture/fontes/acelerato-dominio.json`, `server/src/modulos/acelerato/coletor.ts`, `server/migrations/0019_bm_carga_inicial_times.ts` e `server/src/modulos/businessmap/referencia.ts`.

## Entregar
- "E2. Consulta só de leitura (o dono roda) que lista tipos de chamado, organizações e times com a contagem de chamados, para o dono escolher o recorte novo" (E2), "E3. BusinessMap: descobrir por que o dono vê só o time SSC, se a coleta deve trazer todos os times (código, dicionário de times do bm:ref-sync e consulta só de leitura que o dono roda)" (E3) e "E4. BusinessMap: os 47 times gravados como \"Workflow <id>\" na migração 0019 recebem o nome real do workflow, por vigência de correção (T2.6), com a lista revista pelo dono antes" (E4).
- "E1.1 (software-architect): discovery de E2 a E4, com as consultas só de leitura para o dono." (E1.1)
- (E1) (E2) (E3) (E4) (E1.1) Escrever `docs/analises/098-discovery.md` (novo), pela ferramenta Write, no repositório principal: (a) as consultas só de leitura para o dono (MySQL do Acelerato: tipos, organizações e equipes com contagem; PostgreSQL: os 47 times com o nome do workflow em `ref_workflow`), só nomes e contagens, nada de pessoa; (b) o que muda na coleta do Acelerato para aceitar o recorte novo (allow-list de campos igual; lista de tipos, organizações e equipes), com a releitura do histórico, a versão de critério (T2.6), o efeito nos percentis e na regra de 20 itens, e o gatilho de segurança; (c) a causa provável do "só SSC" no BusinessMap e como confirmar; (d) o plano do E4 (nome real por correção, com reprojeção do `dim_card.equipe` para o filtro não ficar vazio), sem nome de pessoa; (e) lotes de até 150 linhas e perguntas ao dono com recomendação. Sem ler a base real nem `.env`. Sem commit.
- arquivos: docs/analises/098-discovery.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 098-acelerato-todos-os-times até 8b3da7be9d2c0a8fbeaa6787dffb5dcdc493b1b6fd2a6120608c7bf64b43e1d2 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/098-acelerato-todos-os-times.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- (o pedido não tem outra etapa)

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/098-discovery.md` · espera: existe e traz as consultas só de leitura
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
