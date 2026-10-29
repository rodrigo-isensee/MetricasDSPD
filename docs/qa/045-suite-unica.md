---
tipo: qa
contrato: 1
pedido: 045-suite-unica-com-trava
branch: feature/045-suite-unica
commit: b03159ce0f7795da5686c29ce6f72403c8fb17fd
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-28
---

# Parecer de QA - trava de suíte única (pedido 045, E1.4)

Código testado: b03159c (a branch está em 8cdb5ab, só com os pareceres de review e segurança por cima). Diff lido: `package.json`, `scripts/suite-unica.sh`, `scripts/suite-unica.test.sh`, `docs/engineering/praticas.md`. Máquina ociosa antes de começar (`pgrep -af 'vitest|playwright'` sem suíte).

## Veredito
Aprovado. Nenhum defeito. Os achados abaixo são recomendações que não devolvem a entrega.

## Critério -> teste -> resultado
| Obrigação (E1) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Duas suítes juntas em worktrees diferentes rodam em série, a segunda avisa e espera | Aceitação: `pnpm run test` simultâneo em `-045` e cópia temporária; mais `suite-unica.test.sh` (inicio fim inicio fim) | trava ocupada (espera sem falhar) | passou |
| Trava não aninha | `suite-unica.test.sh`, caso aninhado (timeout 10 s) | chamada dentro de quem já segura | passou (o `pronto` roda o `test:trava` e `pnpm -r test` dentro da própria trava e terminou) |
| rc do comando preservado | `suite-unica.test.sh`, `exit 7` | rc diferente de 0 | passou |
| `pronto` sozinho continua verde | `pnpm run pronto` na `-045` | n/a | rc=0 |
| Trava solta no fim | `fuser` após `test:e2e` | processo órfão | vazio (rc=1) |

Mutação e vermelho-antes-do-verde: o pedido não toca `bin/`, `hooks/`, `.githooks/` nem `tests/catraca.py`, então não há `forge-mutante`. O teste `suite-unica.test.sh` nasce com o script (a base não tem o arquivo); a prova de que ele mede o que diz é a aceitação abaixo, em que sem a trava as duas suítes teriam começado juntas.

## Aceitação: duas suítes ao mesmo tempo (comando `pnpm run test`, horários da saída)
A em `/home/rodrigoisensee/MetricasDSPD-045`, B em worktree temporária `--detach` em b03159c (`pnpm install --frozen-lockfile --offline` nela; removida no fim com `git worktree remove`, `git worktree list` confirma que sumiu).

```
11:48:10 A larga
11:48:12 B larga
B 11:48:12  > bash scripts/suite-unica.sh pnpm -r --if-present test
B 11:48:12  suite-unica: outra suíte está rodando; esperando a trava /tmp/metricas-dspd-suite.lock (quem segura: fuser /tmp/metricas-dspd-suite.lock)
A 11:48:10  Scope: 10 of 11 workspace projects      (A roda; última linha 11:50:51)
A 11:50:51  A fim rc=0
B 11:50:51  Scope: 10 of 11 workspace projects      (B só começa quando A termina)
B 11:50:51  packages/contratos test$ TZ=UTC vitest run --passWithNoTests
B 11:53:28  B fim rc=0
```
Leitura: B ficou 2 min 39 s parada na trava, com o aviso; começou no mesmo segundo em que A terminou (11:50:51); as duas terminaram com rc=0 e 102 testes no último pacote de cada. Nenhuma sobreposição.

## `pronto` sozinho na `-045`
`pnpm run pronto` (11:53:49 a 11:59:49): **rc=0**. Inclui `suite-unica.test.sh` (5 "ok", "tudo certo"), lint, format:check e o `pronto` de cada pacote. Contagens: contratos 161, metricas 1082, mock 244, server 591 (84 skipped por serem de PG, preexistentes), web 1227, homolog 73, spec-check 14, pesquisa 33, docs-contratos 102; `docs:check: ok`.

Observação sobre o brief: o `pronto` não chama `test:e2e` (o `pronto` do pacote `e2e` é só `typecheck`). Para cumprir a intenção (A1 do review), rodei `pnpm run test:e2e` à parte.

## Órfãos depois do `test:e2e` (A1 do review)
- Rodada 1 (`timeout 500`): matei o `pnpm` do topo por SIGTERM no meio da suíte (rc=124). `fuser /tmp/metricas-dspd-suite.lock` mostrou **um processo ainda segurando a trava** (o `MainThread` do Playwright, com `vite preview` nas portas 4173/4174 vivos). Eles morreram sozinhos em menos de 20 s e a trava foi liberada (`fuser` rc=1). Isso é o cenário de A1, só com morte abrupta.
- Rodada 2 (completa, 11:59:58 a 12:32:58 no relógio da máquina): `746 passed (24.3m)`, rc=0. Logo depois: `fuser -v /tmp/metricas-dspd-suite.lock` sem saída, **rc=1** (ninguém segura). Término normal não deixa órfão.

## Achados
- A1 (recomendado) scripts/suite-unica.sh:29 · confirmo o risco do review: em término normal a trava solta (fuser vazio), em morte abrupta do topo ela ficou presa por menos de 20 s até os servidores caírem. Sem ação agora; se um órfão passar de minutos, cartão para `exec 9>&-` no lançamento dos servidores. Destino: node-backend, só se reaparecer. Não devolve.
- A2 (recomendado) praticas.md (seção da trava) · a espera não tem teto: a rodada completa do `pronto` (6 min) mais `test:e2e` (24 min) significa que uma suíte atrás de outra espera até 30 min sem nada além do aviso inicial. Aceitável pela regra do dono. Destino: agile-coach, anotar na retro. Não devolve.
- A3 (recomendado) package.json:`pronto` · o `pronto` não roda o `test:e2e`; a doutrina "pronto completo" do pedido 025 vale só para os pacotes. Fora do escopo do 045; só registro. Destino: tech-lead, se quiser decidir. Não devolve.

Os achados A1 a A3 de segurança (nome fixo em `/tmp`, retorno de `flock 9` sem verificação, variável de bypass exportável) ficam como estão no parecer de segurança; nada no QA os contradiz.

Nenhum bloqueante.
