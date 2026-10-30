---
tipo: revisao-seguranca
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: melhoria/MetricasDSPD-k164-mesma-base
commit: a779854509371951e47e27ec3bcc487f57e46034
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-29
---
# Parecer de segurança: K-164, mesma base do delta no hook `parecer` e no `forge-check pr` (E3.2)

Escopo: diff 4afeec7..a779854 no clone de contribuição do Forge (worktree `k164`). São 6 arquivos: `bin/forge-check`, `hooks/parecer.py`, `tests/test_forge.py`, dois casos de corpus em `tests/hooks/parecer/` e `changelog.d/MetricasDSPD-k164-mesma-base.md`. Gatilho: controles do Forge (hook e `forge-check`). A análise foi estática, com leitura de arquivos e `git` de leitura. Nada foi executado nem escrito na worktree. Os testes ficam com o E3.3 (já rodados) e o E3.4. Ferramentas de varredura (gitleaks, semgrep) não se aplicam: o diff não traz segredo nem dependência nova.

## Conferência pedida no brief
- **Nada afrouxa além da opção B.** `base_do_delta` (`bin/forge-check:604`) é a extração literal do trecho que antes estava inline no `pr_da_cli`. O `forge-check pr` não muda de comportamento (`bin/forge-check:635`). O único afrouxamento é no hook: o merge puro da base depois do parecer deixa de invalidá-lo (`hooks/parecer.py:176` e `:185`). Foi isso que o dono decidiu. Mudança do autor depois do parecer continua invalidando, como prova o corpus `pr-mudanca-do-autor-depois-do-merge-da-base-bloqueia.json`. Não entrou dispensa de parecer de branch mesclada nem revalidação por `.forge/versao`.
- **O autor não escolhe a base para escapar.** Por qualquer caminho (`--base` do `gh pr create`, `branch.<b>.gh-merge-base` do `git config` em `base_do_pr`, ou a branch atual no `git merge`), o nome só vale se, depois de tirado um `origin/`, for `develop`, `homolog` ou `main`. Nesse caso a ref lida é `refs/remotes/origin/<nome>`, e a local só quando não há remota. Nome fora do fluxo, `master`, `HEAD`, sha, `origin/origin/develop` ou ref inexistente devolvem `(None, None)`, e o `cmd_pr` fica estrito. Com o head já contido na base, o retorno também é `None` (estrito). As bases do fluxo são protegidas no GitHub, e o que está nelas já passou pelo portão. Escolher `main` em vez de `develop` deixa a conferência mais estrita, não mais frouxa: os commits da develop que não estão na main aparecem como divergentes. Ressalva em A1, para a ref remota movida à mão.
- **O merge simulado não escreve na integração nem deixa estado.** `arquivos_divergentes` usa `git merge-base`, `git merge-tree --write-tree` e `git diff`. O `merge-tree` grava só objetos soltos (árvore e blobs) no banco de objetos. Não mexe em ref, índice, árvore de trabalho nem `MERGE_HEAD`, e o `gc` limpa esses objetos. O hook roda em PreToolUse, antes do `git merge` real. Falha do git, ou git sem `--write-tree`, devolve `None`, e o parecer é acusado pelo diff literal (falha fechada). Erro interno do hook diante de ação crítica bloqueia (`falhar_fechado`, `hooks/_comum.py:2357`). `sha_do_commit` usa `--end-of-options`. Os refs vindos do comando já passaram por `existe`, e nome de branch não começa com `-`.
- **`arquivo:linha-linha` não abre injeção.** O grupo novo é `\d+(?:-\d+)?` (`bin/forge-check:1179`), então só entram dígitos e hífen. O valor é usado como texto na montagem do Entregar (`:1298`, `:1412`, `:1423`) e nunca chega ao git nem ao shell. `3-`, `-3`, `3-5-7`, `3--5` e `a-b` continuam "fora do formato", e o intervalo invertido vira erro próprio (`:1211`). A regra de caractere de controle e o teto do texto seguem como antes. Ressalva de robustez em A2.
- **R1 do review e segurança.** Sem `--base`, o hook usa a primeira das `BASES` que existir (`hooks/parecer.py:211`, quase sempre `develop`) e faz o merge simulado. Já o `forge-check pr` sem `--base` segue estrito. Isso não abre caminho de ataque: o merge simulado só aceita o que se explica por `origin/develop`, que é protegida e já passou pelo portão. Se o PR na verdade apontar para a `main`, os commits da develop que vierem junto têm review próprio. O efeito é de coerência e de documentação, não de segurança. A única exceção é a ressalva do A1, que vale com ou sem `--base`.

## Achados
- A1 (recomendado) hooks/parecer.py:176 · O hook herda o risco residual R3 de forge-check-lote: `refs/remotes/origin/<base>` é movida por `git update-ref` (o conformidade.py:1189 só barra `-d`) e o merge simulado aceita o que um commit lateral traz. Registrar no corpo do PR que a catraca do CI cobre, ou barrar a escrita nessa ref.
- A2 (recomendado) bin/forge-check:1179 · `\d+` sem teto: com mais de 4300 dígitos, o `int()` da linha 1211 levanta ValueError (limite do Python, 4300 nesta estação). O `forge-check docs`/`pr` cai com traceback e o hook bloqueia (falha fechada). Só o autor do parecer se prejudica. Correção: `\d{1,7}(?:-\d{1,7})?`.

## Detalhe do A1
Para quem corrige: esforço P; dono tech-lead, em cartão próprio se o dono quiser algo além do registro no PR. As escritas que movem a remota de uma base do fluxo (`develop`, `homolog`, `main`) são:
- `git update-ref refs/remotes/origin/<base> <sha>` (sem `-d`);
- `git fetch <remoto ou .> <src>:refs/remotes/origin/<base>` (refspec explícita, com ou sem `+`);
- `git push . <src>:refs/remotes/origin/<base>`.

O caminho de ataque exige que o próprio agente autor forje a ref na cópia que confere, o que é contorno deliberado (`R-CONFORMIDADE`). O próximo `git fetch` desfaz a forja, e no Forge a catraca do CI usa a base do evento do PR. Antes, o hook estrito era o último recurso local, e o parecer `docs/security/forge-check-lote.md` (E4) se apoiava nisso. A opção B do dono troca esse último recurso pela mesma base. Por isso o achado é recomendação, não bloqueio.

## Riscos aceitos
Nenhum solicitado. O risco residual do A1 é baixo e decorre da decisão do dono (opção B).

## Veredito
Aprovado sobre a779854, sem achado bloqueante. Nenhum controle foi afrouxado além do que a opção B do K-164 decide. A base fora do fluxo segue estrita, o merge simulado não deixa estado e o formato de intervalo não abre injeção.
