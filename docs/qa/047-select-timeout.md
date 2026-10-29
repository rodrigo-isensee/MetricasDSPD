---
tipo: qa
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: feature/047-select-timeout
commit: 8aa768450381b2a6c64d7661ebfe79c499948619
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-28
---

# QA: correção do teste "reprova: SELECT *" (K-150)

Links: pedido 047 (E1), review `docs/reviews/047-select-timeout.md` (aprovado em 9a97369), diff b42b2610 (um arquivo: `server/tests/plataforma2.test.ts`).

## Veredito
**Aprovado**, sobre o HEAD 9a973696. Nenhum bug aberto. A correção move o custo fixo do primeiro lint para a coleta do arquivo (top-level await, sem timeout de teste), sem aumentar timeout e sem retry.

## Resultado da execução
Comando: `pnpm exec vitest run tests/plataforma2.test.ts --reporter=verbose` em `server/`, uma vez, sozinho (nenhuma outra suíte rodando).
- 34 de 34 testes passaram, 1 arquivo.
- "reprova: SELECT *": 7 ms (limite do critério: 1 s; o timeout de 30 s que estourava não é mais alcançado).
- Demais testes de lint: 1 a 7 ms cada; OpenAPI 642 ms.
- Arquivo inteiro: 3,66 s, dos quais import (coleta, com o aquecimento) 72%.
- Limite: a execução foi sem carga concorrente; o cenário original (outra suíte pesada junto) não foi reproduzido, por causa da regra de uma suíte por vez. A prova é estrutural: o custo frio saiu do `it`.

## Aquecimento que falha derruba o arquivo (por leitura, sem alterar o teste)
O `await eslint.lintText(...)` fica no nível do módulo (linhas 250-254), fora de qualquer `it`. No Vitest, rejeição de top-level await falha a coleta do arquivo: o arquivo inteiro aparece como falho e nenhum teste dele roda como verde. A falha é visível, não silenciosa. O resultado do aquecimento é descartado, então só um erro (exceção) o derruba, o que é o desejado: o aquecimento serve apenas para pagar o custo.

## Critério → teste → resultado
| Obrigação | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| K-150: "reprova: SELECT *" não estoura 30 s com carga | `plataforma2.test.ts` "reprova: SELECT *" | passa, 7 ms | tempo do `it` abaixo de 1 s |
| Sem timeout maior e sem retry | leitura do diff | nenhum `timeout`/`retry` adicionado | n/a |
| Aquecimento falho é visível | leitura do código (top-level await) | falha de coleta derruba o arquivo | falha do aquecimento |
| Regra de lint segue sendo medida | 12 `reprova:` e `aprova o permitido` | passam | n/a |

Vermelho antes do verde e mutação: não se aplicam (correção de tempo de teste, sem regra nova nem código de produção; diff só em teste, fora de `bin/`, `hooks/`, `.githooks/`).

## Revalidação
Revalidado em 2026-10-28 sobre o head 5ac2e4f (docs/047-portao-e2e, depois do merge da develop). Desde 9a97369 mudaram `.github/workflows/homolog.yml` (divisão da E2E do portão, E2.2), os pareceres do E2 (devops, QA, segurança, review) e o review do E1 revalidado. Nenhum arquivo de `server/` mudou (`git diff --stat 9a97369 5ac2e4f -- server` vazio): `server/tests/plataforma2.test.ts`, o único objeto deste parecer, é o mesmo. O workflow não toca o teste "reprova: SELECT *" nem o aquecimento. Veredito inalterado: aprovado.

Revalidado de novo em 2026-10-28 sobre o head 8aa7684 (merge da develop com o #157, E2.13). Desde 5ac2e4f mudaram 1 linha do `CLAUDE.md` (passo 4 do fluxo: "enviada" quer dizer o PR para a `develop`; push da feature branch liberado antes do parecer), os pareceres do 026 (QA e review), os do E2 (devops, segurança) e os reviews revalidados. `git diff --stat 5ac2e4f 8aa7684 -- server web e2e .github` vazio: o teste "reprova: SELECT *" e o aquecimento são os mesmos, e a linha do `CLAUDE.md` é regra de processo, sem relação com o objeto testado. Veredito inalterado: aprovado.

## Achados
- A1 (recomendado) server/tests/plataforma2.test.ts:253 · `aquecer.ts` é nome fictício e não é asserido; aceitável como está, sem devolução (mesma conclusão do review). Destino: nenhum.
