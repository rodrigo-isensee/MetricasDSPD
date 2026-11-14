---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k318-lint-raiz-metricas
commit: 762bc4acdf8e215d890bf1bda34e6f490f32bc8c
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-13
---
# QA: K-318, lint barra a raiz de @metricas-dspd/metricas fora de modulos/metricas (E3.170)

Links: ADR 0013 §9, pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`, review `docs/reviews/099-k318-lint-raiz-metricas.md`.

## Veredito
Aprovado sobre o código 762bc4ac (head 261c1e02, base e5092e05). A regra recusa a raiz em arquivos reais fora do módulo, libera os subcaminhos e o módulo de métricas, e o lint da raiz fica verde. Nenhum bug.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Raiz recusada fora do módulo (import type) | import plantado em 7 arquivos reais: app.ts, operacao/servico, businessmap/projetor, apontamento/servico, referencia/servico, db/extensoes-mock, db/seed; eslint | bloco de módulo, `src/**`, MONTAM_A_API e bloco de seed/mock | os 7 caem com `no-restricted-imports` na linha plantada |
| `/core`, `/businessmap`, `/acelerato` passam fora do módulo | os três plantados em operacao/servico.ts | subcaminhos | 0 erros |
| modulos/metricas importa a raiz | plantado em metricas/servico.ts | exceção do módulo | sem erro |
| `pnpm run lint` da raiz verde no head | `pnpm run lint` | n/a | sem erros ou avisos |
| Teste da fronteira | `server/tests/fronteira-eslint.test.ts --maxWorkers=2` | 5 arquivos, /core e metricas | 12 de 12 passam |

## Vermelho antes do verde e mutação
- Com `server/eslint.config.js` da base e5092e05 e o teste do head: 5 falham, 7 passam (os 5 casos de recusa novos).
- Mutação: tirei `paths: [PATH_RAIZ]` do bloco MONTAM_A_API: cai o teste de `src/app.ts` (1 falha, 11 passam). Config restaurada.
- Arquivos plantados restaurados pelo `git show HEAD:<arquivo>`; `git status` limpo ao fim.

## CI
Check-runs de 762bc4ac: banco, build, filtro, imagem, openapi, rapida e seguranca com sucesso; e2e e perf skipped; `testes` cancelled (não rerrodado). O 261c1e02 (só parecer de review) tinha só os skipped e checks sem conclusão na consulta. Não há check `bateria` listado. O `testes` cancelado precisa fechar verde no CI do PR; não é defeito do código, fica registrado.
