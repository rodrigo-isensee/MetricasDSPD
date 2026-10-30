---
tipo: review
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: melhoria/MetricasDSPD-k164-mesma-base
commit: a779854509371951e47e27ec3bcc487f57e46034
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-29
---
# Review: K-164, hook `parecer` e `forge-check pr` com a mesma base do delta (E3.3)

Proposta ao Forge no clone de contribuição, branch `melhoria/MetricasDSPD-k164-mesma-base`, commit a779854 sobre 4afeec7 (develop do Forge). Diff de 6 arquivos: `bin/forge-check` (+25 -9), `hooks/parecer.py` (+3 -4), `tests/test_forge.py` (+15), dois casos novos de corpus em `tests/hooks/parecer/` e o fragmento `changelog.d/MetricasDSPD-k164-mesma-base.md`. Revisão só de leitura na worktree `k164`; nada escrito nela.

## Contra a DECISÃO DO DONO do K-164 (opção B)
- A mesma base nos dois: a regra que estava inline no `pr_da_cli` virou `base_do_delta` (`bin/forge-check:604`), e o `pr_da_cli` a chama sem mudar o comportamento (`bin/forge-check:635`): base só do fluxo (`develop`, `homolog`, `main`), lida de `refs/remotes/origin/<base>`, a local só sem remoto, e head já contido na base volta a `None` com aviso. O hook usa a mesma função (`hooks/parecer.py:176`) e passa a base ao `cmd_pr` (linha 185). Cumpre.
- Achado `arquivo:linha-linha`: `ACHADO` passa a aceitar `\d+(?:-\d+)?` (`bin/forge-check:1179`); intervalo invertido vira erro próprio (linha 1212); os malformados (`3-`, `-3`, `3-5-7`, `3--5`, `a-b`) não casam com a expressão e continuam como "linha fora do formato". Quem lê `linha` usa o valor como texto (linhas 1298, 1412 e 1423, montagem do Entregar). Nenhum `int()` quebra. Cumpre.
- A parte que ficou fora não entrou: nada de dispensar parecer de branch mesclada, nada sobre `.forge/versao`. Cumpre.

## Nenhum controle afrouxado
- Base fora do fluxo ou inexistente devolve `(None, None)`, o `cmd_pr` fica em modo estrito como antes. O merge simulado (`commit_vale` com base) só aceita o que se explica pela base; mudança real do autor continua invalidando, e o corpus `pr-mudanca-do-autor-depois-do-merge-da-base-bloqueia.json` prova isso (código 2, "src/app.js mudou depois do parecer").
- `merge()`: a base deixou de ser `"HEAD"` e passou a ser o nome da integração atual (`hooks/parecer.py:249`). É preciso: `"HEAD"` não está nas bases do fluxo e cairia no estrito. A branch atual já está garantida em `INTEGRACAO` pelo `return` anterior.
- Isenção de QA no hook: antes, o hook calculava com o sha da base, mas o `cmd_pr` já rodava com `base=None`. Agora os dois usam a base resolvida. Não sobra caminho que conceda isenção que o `forge-check pr --base` não conceda.
- O afrouxamento da regra de desatualização é o que o dono decidiu (opção B): o merge puro da base não invalida no hook, e o `forge-check pr` já se comportava assim. O critério de reversão está no corpo do PR (`docs/analises/047-k164-corpo-do-pr.md`, "Como medir"): se aparecer parecer aceito com mudança real do autor, o hook volta ao estrito por uma linha em `verificar`.

## Testes (rodados por mim, `PYTHONDONTWRITEBYTECODE=1`, um por vez, worktree limpa ao fim)
- `python3 -m unittest tests.test_hooks`: 52 testes, OK (181 s). O corpus inclui os 2 casos novos.
- `python3 -m unittest tests.test_forge`: 437 testes, OK (150 s). Inclui `test_achado_com_intervalo_de_linhas_e_aceito_e_copiado_inteiro` e `test_intervalo_malformado_ou_invertido_e_recusado` (6 subcasos).
- O caso `pr-merge-puro-da-base-depois-do-parecer-libera.json` falha no código antigo, como diz o PR: o `cmd_pr` sem base acusaria `src/outro.js`.
- A suíte inteira do Forge, `claude plugin validate` e `scripts/verificar-contribuicao.sh` não foram rodados (fora do brief). Ficam no checklist do PR e na CI (E3.5).

## Neutralidade, teto e forma
- R-NEUTRO: "MetricasDSPD" só aparece no nome do fragmento e da branch. Código, testes e corpus não citam este projeto. O corpo do PR fala em "um projeto". `tests/config.json` não foi tocado. Cumpre.
- Teto M14: 56 linhas de código e teste (`bin/` 34, `hooks/` 7, `tests/test_forge.py` 15). O corpus fica fora. Em `hooks/` há uma só classe de comportamento (a base do delta no hook), com corpus próprio. Não toca `PROTEGIDOS`.
- Mecanismo novo: não há. É extração de função existente, e o "por que o existente não basta" está no corpo do PR.
- Commit em Conventional Commits, em português, com corpo explicando o porquê.
- Segurança (E3.2) e QA (E3.4) seguem em etapas próprias e não foram refeitos aqui.

## Achados
- R1 (recomendado) hooks/parecer.py:211 · Sem `--base`, o hook usa a 1ª base que existir (develop) e entra no merge simulado, enquanto `forge-check pr` sem `--base` segue estrito. Alinhar (estrito sem `--base`) ou dizer no PR que a "mesma base" vale com `--base`.
- R2 (recomendado) hooks/parecer.py:249 · Falta corpus do caminho `git merge` local na develop depois de um merge puro da base (só `gh pr create` foi coberto) e de base fora do fluxo seguindo estrita. Acrescente os dois casos, que provam o "nada afrouxa" fora do PR.
- R3 (recomendado) bin/forge-check:58 · A ajuda de `brief gerar` e os modelos e agentes (`agents/tech-lead.md`, `qa-engineer.md`, `security-engineer.md`, `conferente.md`, `templates/projeto/docs/*/_modelo.md`) ainda documentam só `<arquivo>:<linha>`. Acrescente `[-<linha>]` para o formato novo ser usado.
