# Pedido 098: Acelerato com todos os times

- **Modo:** discovery (o recorte exato é do dono)
- **Objetivo:** decisão do dono (literal, 2026-11-11 13:35, pedido 097): "2-A", resposta à pergunta "Você quer que o Acelerato passe a coletar todos os times, e não só o SSSC". Hoje a coleta aceita só o tipo "DSPD - SSSC", as organizações do DSPD e as equipes SSSC TOTVS, SSSC SENIOR e SSSC FLUIG (decisão D-8; server/src/modulos/acelerato/coletor.ts:155; docs/architecture/fontes/acelerato-dominio.json).
- **Clareza:** 1 confirmado; 0 técnico; 0 suposição; 1 pergunta
- **Origem:** dono, 2026-11-11.

## Escopo
- E1. Ampliar o recorte de times do Acelerato · `confirmado`
- E2. Consulta só de leitura (o dono roda) que lista tipos de chamado, organizações e times com a contagem de chamados, para o dono escolher o recorte novo · `técnico`
- E3. BusinessMap: descobrir por que o dono vê só o time SSC, se a coleta deve trazer todos os times (código, dicionário de times do bm:ref-sync e consulta só de leitura que o dono roda) · `técnico`
- E4. BusinessMap: os 47 times gravados como "Workflow <id>" na migração 0019 recebem o nome real do workflow, por vigência de correção (T2.6), com a lista revista pelo dono antes · `técnico`

## Etapas

## Fora do escopo
- Misturar Acelerato e BusinessMap em qualquer cálculo · `confirmado`
- Ler campos de pessoa ou texto livre além da allow-list atual · `confirmado`
- Comparar times entre si · `confirmado`

## Suposições

## Perguntas na fila
- PERGUNTA P-098-1: o recorte novo é (a) todos os times, mantendo o tipo "DSPD - SSSC" e as organizações do DSPD; (b) todos os tipos e times das organizações do DSPD; ou (c) todo o Acelerato? Recomendação: decidir depois de ver a contagem da consulta só de leitura (E2).

## Histórico
- 2026-11-11 13:35: pedido aberto pelo Jarvis a partir do 097.
- 2026-11-11 13:35: DECISÃO DO DONO (literal): "tanto bm quanto acelerato sao todos os times". Vale para as duas fontes, cada uma no seu cálculo. No BusinessMap, o dono viu só SSC: E3 (técnico), investigar no código e no dicionário de times do bm:ref-sync por que só um time aparece, sem ler a base real.
- 2026-11-11 13:40: PERGUNTA do dono (literal): "outra coisa porque os filtros da equipes trouxe  workflow com um numero e nao o nome correto?". Causa vista no código: a migração 0019 (carga inicial de times, pedido 057 E3) gravou só 3 times com nome (Equipe de processos, Arquitetura, Auditoria PwC - ITGC) e os 47 demais com o nome provisório "Workflow <id>", para corrigir depois pelo nome do workflow lido do BusinessMap, por `correcao` e nunca com nome de pessoa; essa correção não foi feita. ESCOPO+ (técnico): E4, gravar o nome real dos 47 times a partir de ref_workflow, como nova vigência de correção (T2.6), com a lista de nomes revista pelo dono antes (o nome do workflow pode trazer nome de pessoa).
