Agente destino: forge:tech-lead
Pedido: 090-release-2026-11-11
Tipo: codigo
Branch: docs/090-release   Base: develop   Base-sha: 85394c5b3c04d38028436609d4acd70e90e3f29a
Etapa: codigo   Cobre: E1.1

## Objetivo
Release 090 (decisão A do dono: abre à 01:00 com o que está na develop): a develop em 85394c5b (PRs 293 a 297: 089 back-end e front-end, retrospectivas, Forge 0.45.5 e K-261) vai à homolog e o PR de release homolog para main fica aberto. Primeiro degrau: CHANGELOG e review na branch docs/090-release, worktree `/home/rodrigoisensee/MetricasDSPD-052h` (hoje na branch feature/089-apontamento-d2-d3, já mesclada; worktree limpa).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline origin/homolog..85394c5b`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." (E1.1)
- (E1) (E1.1) Criar a branch: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch -c docs/090-release 85394c5b` (a partir do sha, sem rastreio); conferir `branch --show-current` = `docs/090-release` (se não, pare e relate). Escrever no `CHANGELOG.md` as notas dos PRs 293 a 297, no formato das entradas anteriores; commit só desse arquivo com `Cartão: K-213` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito), push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/090-release` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, revisar a release: cada PR da lista tem review aprovado e entrou com a CI verde; o 089 (D2 e D3) traz a ordem de implantação registrada no PR 293 (`ref:sync` do dicionário v3 e `criterios-apontamento <data da primeira varredura completa>` no mesmo dia, depois a coleta de 12 meses), que vai ao corpo do PR de release; o interruptor `BLOQUEIOS_COM_DADO_REAL` segue desligado (o 6b não entra). Parecer `docs/reviews/090-release.md` (novo) gravado inteiro pela ferramenta Write, uma vez só, com `pedido: 090-release-2026-11-11`, `branch: docs/090-release`, `commit:` o sha40 do commit do CHANGELOG, veredito e `## Achados`; commit só do parecer com `Cartão: K-213`; push como acima; sem PR. Não rodar `pnpm run pronto` (é do QA).
- arquivos: CHANGELOG.md, docs/reviews/090-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 090-release-2026-11-11 até 74c4dff7f5ff7c6b2a452e50513f874c9b5e939e9a4dbc648c9394baafa2de7b (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/090-release-2026-11-11.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), o `.env` real, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 090." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/090-release:docs/reviews/090-release.md` · espera: contém 'pedido: 090-release-2026-11-11'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
