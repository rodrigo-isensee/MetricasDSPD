---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: feature/099-d3-alvo-prioridade
commit: 70836ab6604b6a2fe51cf67c1f7706578c54f861
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Code review: D3 do 099, migração 0036 e carregador dos alvos de prioridade (E2.12)

Diff lido: `git diff origin/develop...8f0d669b` (31 arquivos, 2 commits: `92a970b2` e `8f0d669b`), comparado com o desenho `docs/analises/099-d3-unidade-prazo.md` (alternativa a, com renomeação) e com o parecer de segurança `docs/security/099-d3-alvo-prioridade.md` (aprovado, A1 trazido aqui).

## Ferramentas (citadas, não refeitas)
- Testes dos arquivos tocados, sem banco: `server` `vitest run` de `alvos-acelerato.test.ts`, `ref-sync-ac-alvos-entrada.test.ts`, `migracoes.estatico.test.ts`, `metricas.mapa.test.ts`, `seed.estatico.test.ts` e `calendario-metricas-codigo.test.ts`: 6 arquivos, 75 testes, todos passaram. `packages/metricas` `vitest run src/acelerato`: 17 testes, passaram.
- Typecheck de `contratos`, `metricas`, `mock`, `server` e `web`: verde.
- Os `.pg` (`alvos-acelerato.pg.test.ts` e os renomeados) não rodaram aqui: são do CI do PR. Lidos.

## Conferência contra o desenho
- **Modelagem (0036):** só `RENAME`, `ADD COLUMN ... CHECK` e `DROP DEFAULT`; nenhum valor reescrito. Down recusa com linha `corrido` antes de qualquer `DROP` (molde da 0035), provado no `.pg` para os dois prazos. Migração nova, checksum registrado, nenhuma migração aplicada editada. Nomes `prazo_pa_horas`/`unidade_pa` dizem o que guardam.
- **Nunca sobrescrever histórico:** o carregador só faz `INSERT` e `UPDATE (vigente_ate)`; troca de unidade é nova vigência; data não posterior à última vigência é recusada. O `.pg` prova a história de P2 com 3 linhas depois de ida e volta.
- **T2.5:** o tempo corrido sai do core (`calendarioCorrido` + `horasUteisEntre`) no `construir` do índice; a pausa da restauração corrida é descontada no mesmo relógio. O S1 só escolhe o campo pela unidade (`MEDIDAS`), sem cálculo próprio; o teste de calendário passou a seguir os campos `*HC`.
- **T2.6:** uma `ref_versao_criterio` por hash do arquivo, domínio `acelerato`, `afeta = ['S1']` como a Q-099-11 manda; idempotente pela referência; versão com data anterior à última recusa.
- **Contrato:** `unidade` aditivo na classe do S1, `openapi.json` regenerado. Rótulo da web fica para o D4, como o desenho diz.
- **Regras invioláveis:** nada de pessoa, nada mistura BusinessMap e Acelerato, sem estatística nova abaixo de 20.
- **A1 da segurança (duas transações no `ac:ref-sync`):** decisão do review: ficam duas transações. Domínio e alvos são tabelas independentes, cada uma com vigência própria; se os alvos recusarem por vigência, as listas gravadas são corretas por si e a reexecução é idempotente. Juntar exigiria mudar a assinatura de `sincronizarDominio` sem ganho de integridade. O que falta é o comentário dizer isso (A1 abaixo).
- **Tamanho (M14):** 697 linhas de código e teste, fora `.md`, `openapi.json`, arquivo de fontes, checksums e snapshot. Um comportamento (unidade por prazo, ponta a ponta); o PR deve trazer `teto: excedido, 697 linhas, migração + carregador + biblioteca indivisíveis sem quebrar o S1`.

## Revalidação (volta 2, `70836ab6`)
- Delta lido: `forge-check parecer delta` sobre `8f0d669b..f91922f6`; no domínio, só `server/src/modulos/referencia/alvos-acelerato.ts` (`METRICAS_ALVOS` passa a `['S1', 'VISAO_GERAL']`, A1 do QA) e os dois testes que conferem a lista (`alvos-acelerato.test.ts` e o `.pg`). `f91922f6` é só o parecer do QA.
- `VISAO_GERAL` cabe em `ref_versao_criterio_metrica.metrica_id` (`varchar(40)`, 0010); a versão de critério segue idempotente pela referência. `vitest run tests/alvos-acelerato.test.ts`: 26 testes, passaram; o `.pg` é do CI. Veredito mantido: aprovado; A1 a A4 seguem recomendados; A5 novo, recomendado.

## Achados
- A1 (recomendado) server/src/entradas/ref-sync-ac.ts:14 · O comentário cala que domínio e alvos gravam em transações separadas (A1 da segurança). Acrescentar: recusa de vigência nos alvos deixa as listas gravadas, e reexecutar é idempotente.
- A2 (recomendado) server/src/modulos/metricas/mapa.ts:176 · Guarda nova `unidadeDe` (throw para unidade fora de corrido/util) sem teste do ramo de falha. O CHECK da coluna a torna improvável, mas a guarda existe: um caso em `metricas.mapa.test.ts` com `unidade_pa: 'dias'` esperando o erro.
- A3 (recomendado) docs/architecture/adr/0027-calendario-por-dominio.md:1 · O desenho pede uma linha de leitura na ADR 0027 quando o D3 entrar (a Q-099-11 decide o plantão em horas corridas para o S1); a linha não veio. Pode entrar no PR ou no D4.
- A4 (recomendado) server/tests/ref-sync-ac-alvos-entrada.test.ts:55 · Falta o caso em que `lerArquivoAlvos` recusa: provar que `sincronizarDominio` não é chamado (a garantia de "arquivos validados antes de qualquer escrita" que o comentário promete).
- A5 (recomendado) server/src/modulos/referencia/alvos-acelerato.ts:21 · `METRICAS_ALVOS` (`string[]`) repete à mão `METRICAS_COM_ALVOS` de `metricas/servico.ts:40`; podem divergir (classe do A1 do QA). Uma fonte só tipada por `MetricaId`, ou teste que as afirme iguais.
