---
tipo: review
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l3a-historico-bm
commit: 4f8a5479c4d46a000c088c9910077c449d2f36b1
parecer: aprovado
revisor: tech-lead
data: 2026-11-07
---
# Code review: 077 lote 3a, o servidor lê o início do histórico do BusinessMap (K-211, E2.2)

Diff lido: `718d46be...4f8a5479` (4 arquivos, 148 adições e 4 remoções), contra `## 3. Regras técnicas fixadas` e `## Lote 3a` de `docs/analises/077-desenho.md` e contra o A13 e o A14 de `docs/analises/077-desenho-revisao-tech-lead.md`.

## Parecer
**Aprovado.** Faz o que o lote pede, nem mais nem menos.

- **Consulta (§3, A2):** `lerHistoricoDesdeBM` (`repositorio.ts:177-186`) filtra `ctl_coleta` por `tarefa = 'coleta_incremental'`, `parametros ->> 'tipo' = 'carga_inicial'` e `status = 'sucesso'`; o apontamento (tarefa `apontamento`) nunca entra. Uma consulta por recarga, dentro de `carregarBM`, em cache com a marca d'água (A3); `Carga.inicio` intacto.
- **A13:** cada linha passa por `InicioDaCarga`, a mesma regra de `ParametrosCarga` (`businessmap/coleta.ts:115-116`, `YYYY-MM-DD`), e o `min` se toma em TS sobre as válidas (ordenação de texto `YYYY-MM-DD` = ordem de data). Conforme.
- **A14:** nenhum ramo `sem-dado-real` no serviço. Os dois ramos novos (repasse condicional de `historicoDesde` em `servico.ts:162` e `:307`, aviso em `:159`) são alcançáveis e cobertos pelo teste de dublê, que roda na cobertura da CI (os `.pg` ficam pulados nela). Conforme.
- **Log sem nível:** basta. O `deps.log` do serviço é ligado em produção a `app.log.warn` (`app.ts:91`), então a linha inválida sai como `warn`, como o §3 pede; o contexto leva só `cargasIgnoradas` e os dois testes afirmam que o conteúdo inválido não aparece.
- **Fonte nunca misturada:** `historicoDesde` entra só no `bm` do `ContextosMetricas`; o `ac` segue de `criarContextoAC` sem ele. Provado nos dois testes: a TENDENCIA_SUST não marca janela incompleta com um início no futuro.
- **GRANT:** `ctl_coleta` vai inteira ao `dspd_api` pelo `paraApi` de `grants.ts` (prefixo `ctl_`); a tabela não tem coluna de pessoa e `parametros` guarda só dados da carga (tipo, datas, páginas). O `.pg` lê pelo pool `dspd_api`, o que prova o GRANT.
- **Fora do diff, como pedido:** `packages/`, `web/` e `server/migrations` sem diff.

## Ferramentas
- CI do push no head `4f8a5479`: run 42358244710, `CI`, `push`, `completed`, `success` (`gh run list --commit`); job `banco` rodou `metricas.historico-bm.pg.test.ts` com 4 verdes; job `testes` (cobertura) rodou o de dublê com 2 verdes e os 4 `.pg` pulados.
- Teste do arquivo tocado, 2 workers: `server/tests/metricas.historico-bm.test.ts`, 2 verdes. O `.pg` não rodou aqui (sem base de teste local); vale o job `banco`.
- Lint, tipos, cobertura 100% e `docs:check`: cobertos pela mesma CI verde; não refeitos.

## Teto M14
152 linhas de código e teste (`git diff --numstat --no-renames origin/develop...HEAD`: `repositorio.ts` 19+0, `servico.ts` 15+4, `metricas.historico-bm.pg.test.ts` 75+0, `metricas.historico-bm.test.ts` 39+0), não 148 como entregue (a conta deixou de fora as 4 remoções). Exceção aceita neste review: 2 linhas acima, pelo teste de dublê que a cobertura da CI exigiu; um comportamento só. O corpo do PR (E2.4) leva `teto: excedido, 152 linhas, teste de dublê exigido pela cobertura da CI com os .pg pulados` (A1).

## Achados
- A1 (recomendado) server/tests/metricas.historico-bm.test.ts:1 · o diff soma 152 linhas (148 adições e 4 remoções), acima do teto de 150; exceção aceita aqui pelo teste de dublê da cobertura, e o corpo do PR do E2.4 leva a linha `teto: excedido, 152 linhas, <motivo>` (M14).
- A2 (recomendado) server/tests/metricas.historico-bm.pg.test.ts:38 · o teste chama o `carregarBM` privado por `as unknown as`; a prova pela rota pública (`calcular`, como o teste de dublê faz) evitaria o escape de tipo e a dependência do nome interno.
