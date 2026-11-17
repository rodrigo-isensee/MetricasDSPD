---
tipo: qa
contrato: 1
pedido: 105-t2-prazos-aprovados
branch: feat/105-t2-prazos-aprovados
commit: 0dde8f64e571e57e477b74d418ba1e040d3ccf03
parecer: reprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-17
---
# QA: T2 com os prazos aprovados (pedido 105-melhorias-15-11, E7.501)

Diff lido: f15e4e4b..0dde8f64 (arquivo `businessmap-sle.json` com 4 prazos, passo `bm:ref-sync-sle` no `vm:preparar`, dois testes).

## Achados
- A1 (bloqueante) server/tests/qa-sle-pg.pg.test.ts:35 · CT-1 do test:pg afirma que o arquivo real é vazio (prazos 0, nada gravado); com os 4 prazos aprovados ele cai (recebido prazos 4, inseridas 4). O autor mudou só o teste unitário; a suíte pg vai vermelha no CI.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Os 4 prazos (Crítica 12,5, Alta 5,8, Média 11,2, Baixa 2,1; aprovado_em 2026-11-17) carregam | prova pg descartável (abaixo) | base vazia → 4 linhas, equipe `*`, P85, vigente_ate nulo | passou |
| Rodada repetida não duplica | mesma prova, 2ª chamada: inseridas 0, fechadas 0, sem nova versão; count(ref_sle)=4 | idempotência | passou |
| `bm:ref-sync-sle` logo após `bm:ref-sync` | `vm-preparar.test.ts` (indexOf + 1) | ordem dos passos | passou (diff) |
| Suíte pg continua verde | `test:pg` inteiro | arquivo real não vazio | falhou (A1) |

## Cenários e resultado real
- Ambiente: `pnpm run test:pg` na worktree, que sobe o PostgreSQL descartável do Compose (projeto e volume próprios, derrubado no fim); nem o `.env` nem a base local de dados reais foram tocados. Papel `dspd_ref`, transação com ROLLBACK.
- Prova dos prazos: teste temporário (não commitado, removido depois) leu o arquivo real com `lerSleBm()` e rodou `sincronizarSleBm` duas vezes. Passou: 4 inseridas, versão registrada; 2ª rodada 0 inseridas, 0 fechadas; 4 linhas em `ref_sle`.
- Resultado do `test:pg`: 53 arquivos passaram, 1 falhou; 357 testes passaram, 1 falhou (CT-1 de `qa-sle-pg.pg.test.ts`, A1). O CT-1 era do QA do K-214 e assume o arquivo vazio; precisa virar "arquivo real grava 4 e não duplica" (os CT-2 a CT-4 já usam arquivos próprios e passaram).
- Vermelho antes do verde: o teste unitário alterado já falha sem o JSON novo (esperava `prazos: []` na base). Não rodei `forge-testes --vermelho` (não se aplica a este pedido de dados).
- A suíte inteira roda no CI do PR; não há PR, então não afirmo CI verde. PQ do autor: pronto rc=0 (citado do brief).
- Mutação: sem ferramenta de mutação aplicável a arquivo de dados.
- Branch andou após o head revisado (0dde8f64): só `docs/reviews/105-t2-prazos-aprovados.md`, sem efeito sobre o código.

## Bugs
Nenhum arquivo em `docs/qa/bugs/`: A1 é teste desatualizado, não defeito de produção.

Devolver a quem mantém o teste (qa-engineer, em commit de teste) ou ao autor; revalidar com `forge-check parecer delta docs/qa/105-t2-prazos-aprovados.md`.
