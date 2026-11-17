---
tipo: qa
contrato: 1
pedido: 105-t2-prazos-aprovados
branch: feat/105-t2-prazos-aprovados
commit: 52339d114004b03d0dbe6da3a204843046079de5
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: T2 com os prazos aprovados (pedido 105-melhorias-15-11, E7.501 e E7.509)

Diff lido: f15e4e4b..0dde8f64 (arquivo `businessmap-sle.json` com 4 prazos, passo `bm:ref-sync-sle` no `vm:preparar`, dois testes); revalidação: 0dde8f64..52339d11 (só o CT-1 do `qa-sle-pg.pg.test.ts`).

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Os 4 prazos (Crítica 12,5, Alta 5,8, Média 11,2, Baixa 2,1; aprovado_em 2026-11-17) carregam | CT-1 de `qa-sle-pg.pg.test.ts` (4 inseridas, versão registrada, contagens +4/+1/+2) | base vazia → 4 linhas, equipe `*`, P85, vigente_ate nulo | passou |
| Rodada repetida não duplica | CT-1, 2ª chamada: inseridas 0, fechadas 0, sem nova versão, contagens iguais | idempotência | passou |
| `bm:ref-sync-sle` logo após `bm:ref-sync` | `vm-preparar.test.ts` (indexOf + 1) | ordem dos passos | passou (diff) |
| Suíte pg continua verde | `test:pg` inteiro | arquivo real não vazio | passou (head 52339d11) |

## Cenários e resultado real
- Ambiente: `pnpm run test:pg` na worktree, PostgreSQL descartável do Compose (projeto e volume próprios); nem o `.env` nem a base local de dados reais foram tocados. Rodado fora do sandbox porque o vitest grava em `node_modules/.vite-temp` e o Docker precisa de socket.
- Resultado do `test:pg` no head 52339d11: Test Files 53 passed (53); Tests 357 passed (357); duração 302 s.
- A1 da 1ª rodada (CT-1 desatualizado) fechado, sem achado aberto. Delta (`forge-check parecer delta`): só `server/tests/qa-sle-pg.pg.test.ts`, CT-1 reescrito de "arquivo vazio, nada gravado" para "grava os 4 prazos; 2ª rodada sem duplicar".
- Vermelho antes do verde: a versão antiga do CT-1 caía contra o arquivo real (recebido prazos 4), registrado no parecer da 1ª rodada; o unitário alterado já falhava sem o JSON novo. `forge-testes --vermelho` não se aplica a este pedido de dados.
- A suíte inteira roda no CI do PR; não há PR, então não afirmo CI verde. PQ do autor: pronto rc=0 (citado do brief).
- Mutação: sem ferramenta aplicável a arquivo de dados.

## Bugs
Nenhum arquivo em `docs/qa/bugs/`: A1 era teste desatualizado, não defeito de produção, e está fechado.
