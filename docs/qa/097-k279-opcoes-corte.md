---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k279-opcoes-corte
commit: c9bfd5f33a6c24a4bb29a552164f9c4b4d7635f0
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: K-279, opções de filtro do L6 com o corte das listas (servidor, E3.3)

Base develop 995caa40. Diff `995caa40..c9bfd5f3`: `server/src/modulos/referencia/repositorio.ts` (`CORTE_CARDS`, `CORTE_CHAMADOS`) e `server/tests/app.test.ts` (2 testes). Fecha A1 de `docs/qa/097-l6-tipos-reais.md`.

## Veredito
Aprovado. As condições copiadas são idênticas às das listas, a opção fora do corte não aparece, a base vazia do Acelerato dá lista vazia e o contrato não mudou.

## Critério → teste → resultado
| Critério | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Tipo só fora do corte não aparece | `app.test.ts` "K-279: opção que só existe fora do corte..." (tipos) | passa; cai sem `CORTE_CARDS` | corte de `lerCards` |
| Prioridade só fora do corte não aparece | mesmo teste (prioridades) | passa; cai sem `CORTE_CHAMADOS` | corte de `lerChamados` |
| Base vazia do Acelerato: `prioridades` = `[]` | "acelerato com base vazia: prioridades = lista vazia" | passa | vazio |
| Mesmo corte das listas | conferência por leitura (abaixo) | igual | n/a |
| Contrato sem mudança | diff sem `docs/api/` nem `servico.ts`; forma `{id,nome}` mantida nas asserções | sem mudança | n/a |

## Conferência do corte
- `lerCards` (`metricas/repositorio.ts:59`): `criado_em IS NOT NULL AND granularidade IS NOT NULL AND tipo IS NOT NULL`; `CORTE_CARDS` é o mesmo texto, e `lerTiposBM` soma `granularidade = 'story'`.
- `lerChamados` (`metricas/repositorio.ts:113`): `aberto_em IS NOT NULL AND equipe IS NOT NULL AND fora_do_recorte = false`; `CORTE_CHAMADOS` é o mesmo texto.
- Risco aceito: a constante é cópia (divergência futura não é pega por teste de semântica); o comentário de origem mitiga. O teste .pg roda no CI (job banco); nada foi rodado contra base real.

## Execução
`VITEST_MAX_WORKERS=2 vitest run tests/app.test.ts`: 17 passam.

## Mutação (restaurada antes do commit; árvore limpa)
- Tirar `CORTE_CHAMADOS` de `lerPrioridadesAC`: 1 falha, `expected [ {p1}, …(1) ] to deeply equal [ {p1} ]`.
- Tirar `CORTE_CARDS` de `lerTiposBM`: 1 falha, o mesmo teste K-279.
Os dois mutantes morreram.

## Achados
