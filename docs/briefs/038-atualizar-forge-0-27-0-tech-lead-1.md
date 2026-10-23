Agente destino: forge:tech-lead
Pedido: 038-atualizar-forge-0-27-0
Branch: forge/upgrade-0.27.0   Base: develop   Base-sha: 568ea481bde436e220d23e99142aa2bfe4718e76

## Objetivo
Destravar o PR #134 (`forge/upgrade-0.27.0` → develop), que registra a versão 0.27.0 do Forge em `.forge/versao` e está DIRTY porque a branch saiu de 00a634f (develop antiga). Etapa E1.1 do pedido 038, cartão K-122. Trabalhe numa worktree própria, `/home/rodrigoisensee/MetricasDSPD-038`, a partir de `origin/forge/upgrade-0.27.0`.

## Ler
- `docs/pedidos/038-atualizar-forge-0-27-0.md`: Diagnóstico, Escopo e Etapas.
- `gh pr view 134` e o diff do PR (`.forge/versao`).
- `docs/engineering/praticas.md`, seção de commits.

## Entregar
- (E1) Merge da `origin/develop` (568ea48) na branch `forge/upgrade-0.27.0`, sem rebase e sem `--force`, resolvendo o conflito de `.forge/versao` com o valor `0.27.0`; depois disso, o diff da branch contra a develop é só `.forge/versao` (mais o parecer abaixo).
- (E1) Parecer de review em `docs/reviews/038-atualizar-forge-0-27-0.md`, commitado na mesma branch, com `git add` explícito por caminho e a linha `Cartão: K-122`.
- (E1) Push da branch (o PR #134 se atualiza sozinho).

## Fora do escopo
- "E1.2 (forge:qa-engineer): parecer de QA em `docs/qa/038-atualizar-forge-0-27-0.md` (CI do PR verde e `pnpm run pronto`)." · etapa de outro papel ou do dono; continua no pedido
- "E1.3 (forge:tech-lead): merge por squash do #134 na develop com os checks verdes e limpeza da branch (R-FLUXO, "Depois do merge")." · etapa de outro papel ou do dono; continua no pedido
- "E1.4 (dono): a versão chega à main na próxima release homolog → main." · etapa de outro papel ou do dono; continua no pedido
- Mesclar o #134 nesta delegação; promover para homolog ou main; qualquer outro arquivo além de `.forge/versao` e do parecer (ajuste de projeto que a 0.27.0 pedir vira apontamento no relatório, para cartão próprio); o quadro.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-21): "ok atualize a versao do forge no repositorio, baixo o fonte mais rewscente e continue o trabalho" (resposta à pergunta de passar o PR #134 ao forge:tech-lead).
- A 0.27.0 é a última versão publicada do Forge (tag v0.27.0 = main do Forge em 2026-10-21).
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. Não tocar nas worktrees -025 e -037 (dois react-frontend trabalham nelas).

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-038 diff --name-only origin/develop...HEAD` · espera: linhas=2
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-038 show HEAD:.forge/versao` · espera: igual '0.27.0'
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-038/docs/reviews/038-atualizar-forge-0-27-0.md`
- PQ-4 (push): `git ls-remote origin refs/heads/forge/upgrade-0.27.0` igual ao head local
- PQ-5 (pr): `gh pr view 134 --json mergeable --jq .mergeable` · espera: igual 'MERGEABLE'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
