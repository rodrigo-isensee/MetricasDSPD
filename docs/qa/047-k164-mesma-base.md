---
tipo: qa
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: melhoria/MetricasDSPD-k164-mesma-base
commit: a779854509371951e47e27ec3bcc487f57e46034
parecer: aprovado
revisor: forge:qa-engineer
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-29
---
# QA: K-164, hook `parecer` e `forge-check pr` com a mesma base do delta (E3.4)

Proposta ao Forge, worktree `/home/rodrigoisensee/.forge-contrib/MetricasDSPD-wt/k164`, HEAD a779854 sobre 4afeec7. Diff de 6 arquivos lido (`bin/forge-check`, `hooks/parecer.py`, `tests/test_forge.py`, 2 casos de corpus, `changelog.d`). Só leitura e testes; árvore limpa ao fim (`git status --porcelain` = 0 linhas).

## Execução (`PYTHONDONTWRITEBYTECODE=1`, uma suíte por vez)
- `python3 -m unittest tests.test_forge`: `Ran 437 tests in 88.392s`, OK.
- `python3 -m unittest tests.test_hooks`: `Ran 52 tests in 155.005s`, OK.
- Não rodados (fora do brief): suíte inteira do Forge, `validar-plugin.sh`, `forge-testes --vermelho`. O vermelho do caso "merge puro libera" no código antigo está declarado no review (cmd_pr sem base acusaria `src/outro.js`) e não foi refeito aqui. Nada em `tests/mutantes/` no diff; o diff muda condições em `bin/forge-check` e `hooks/parecer.py` sem mutantes declarados (ver A1, recomendado).

## Critério (obrigação) → teste → resultado
| Obrigação (decisão K-164, opção B) | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Mesma base no hook e no `forge-check pr`: merge puro da base depois do parecer não invalida | corpus `pr-merge-puro-da-base-depois-do-parecer-libera.json` (hook, `gh pr create`, código 0) | base andou em arquivo de outro pedido | ok |
| Mudança do autor depois do parecer continua bloqueando, mesmo com o merge da base | corpus `pr-mudanca-do-autor-depois-do-merge-da-base-bloqueia.json` (código 2, "src/app.js mudou depois do parecer") | mudança real do autor vs mudança da base | ok |
| `forge-check pr` mantém o comportamento (função extraída) | testes existentes de `pr` em `tests.test_forge` | head contido na base; base fora do fluxo | ok |
| Achado `arquivo:linha-linha` aceito e copiado inteiro | `test_achado_com_intervalo_de_linhas_e_aceito_e_copiado_inteiro` | intervalo válido | ok |
| Intervalo invertido ou malformado recusado | `test_intervalo_malformado_ou_invertido_e_recusado` (6 subcasos: `9-3`, `3-`, `-3`, `3-5-7`, `3--5`, `a-b`) | invertido, ponta vazia, três pontas, sinal duplo, não numérico | ok |
| Não afrouxar: base fora do fluxo segue estrita | leitura de `base_do_delta` (`(None, None)`); sem corpus próprio (ver A2) | base inexistente | ok por leitura |
| Fora de escopo não entrou (branch mesclada, `.forge/versao`) | leitura do diff | n/a | ok |

## Achados
- A1 (recomendado) hooks/parecer.py:249 · Falta corpus do caminho `git merge` local na develop depois de merge puro da base, e de base fora do fluxo seguindo estrita (mesmo R2 do review); só `gh pr create` está coberto.
- A2 (recomendado) hooks/parecer.py:211 · Sem `--base`, o hook usa a primeira base existente (develop) e entra no merge simulado, enquanto `forge-check pr` sem `--base` segue estrito: a "mesma base" só vale com `--base`; alinhar ou dizer no PR (R1 do review, confirmado na leitura).
- A3 (recomendado) bin/forge-check:58 · Ajuda e modelos ainda documentam só `<arquivo>:<linha>`; acrescentar `[-<linha>]` (R3 do review).
