Agente destino: forge:qa-engineer
Pedido: 088-forge-0455
Tipo: qa
Branch: forge/upgrade-0.45.5   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: qa   Cobre: E1.4
Revisar-sha: fb24b343c63c65c2bf677c98de066e5179d1aca4

## Objetivo
O `forge-upgrade` 0.45.5, rodado pelo Jarvis por ordem do dono (pedido 088), registrou o Forge 0.45.5 no arquivo de versão do Forge: um commit (fb24b343c63c65c2bf677c98de066e5179d1aca4) sobre a develop 129fc3d5ba918789e17d3dc1b663039795c4a9e6, já enviado. O plugin instalado é o 0.45.5. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `forge/upgrade-0.45.5`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 fb24b343c63c65c2bf677c98de066e5179d1aca4`.

## Entregar
- "E1.4 (qa-engineer): QA (`pnpm run pronto`)." (E1.4)
- (E1) (E1.4) Rodar `pnpm run pronto` na worktree (tarefa pesada; saída para arquivo no scratchpad desde o início; instale dependências antes, se faltarem, com `CI=true pnpm install --frozen-lockfile`, `registry.npmjs.org` em allowed_domains). Grave `docs/qa/chore-forge-0455.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 088-forge-0455`, `branch: forge/upgrade-0.45.5`, `commit: fb24b343c63c65c2bf677c98de066e5179d1aca4`, veredito, contagem de bugs e `## Achados`; commit só do parecer com `Cartão: K-255` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito pelo caminho). Commit depois do commit do parecer de review (espere por chamadas curtas de `git log`). push em primeiro plano, timeout de 600 s, com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/forge/upgrade-0.45.5` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Grave só na worktree.
- arquivos: docs/qa/chore-forge-0455.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 088-forge-0455 até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/088-forge-0455.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- O Entregar prevalece sobre linhas genéricas: o parecer é commitado e enviado na própria branch; mutação ou reversão temporária é restaurada antes do commit.
- NÃO tocar: os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (dono): trocar o ref do marketplace do Forge de v0.45.2 para v0.45.5, atualizar o plugin e reiniciar a sessão." · etapa de outra delegação; continua no pedido
- "E1.2 (Jarvis, por ordem do dono, como no 084): `forge-upgrade` numa worktree limpa a partir da develop e envio da branch." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/forge/upgrade-0.45.5:docs/qa/chore-forge-0455.md` · espera: contém 'commit: fb24b343c63c65c2bf677c98de066e5179d1aca4'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
