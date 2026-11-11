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

## Pronto quando
- PQ-1 (arquivo): `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/098-discovery.md` · espera: existe e traz as consultas só de leitura
