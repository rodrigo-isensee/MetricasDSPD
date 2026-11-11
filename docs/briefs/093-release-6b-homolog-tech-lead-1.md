Agente destino: forge:tech-lead
Pedido: 093-release-6b-homolog
Tipo: codigo
Branch: docs/093-release   Base: develop   Base-sha: c6e5fd8f9025e651fb9113e4ae324bf99f47ab01
Etapa: codigo   Cobre: E1.1

## Objetivo
Release 093: a develop em c6e5fd8f9025e651fb9113e4ae324bf99f47ab01 (PR 298, lote 6b do 075, bloqueios reais no Operacional; PR 302, retrospectivas) vai à homolog, e o PR de release homolog para main fica aberto. Primeiro degrau: CHANGELOG e review na branch docs/093-release, worktree `/home/rodrigoisensee/MetricasDSPD-052h` (hoje na branch docs/090-release, já mesclada; worktree limpa).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline origin/homolog..c6e5fd8f9025e651fb9113e4ae324bf99f47ab01`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/093-release." (E1.1)
- (E1) (E1.1) Criar a branch: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch --no-track -c docs/093-release c6e5fd8f9025e651fb9113e4ae324bf99f47ab01`; conferir `branch --show-current` = `docs/093-release` (se não, pare e relate). Escrever no `CHANGELOG.md` as notas dos PRs 298 e 302, no formato das entradas anteriores; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/093-release` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, revisar a release: cada PR tem review aprovado e entrou com a CI verde; o interruptor `BLOQUEIOS_COM_DADO_REAL` ligado e a data de critério 2026-11-01 batem com o 6b; T10 e T12 continuam fora; nenhuma migração nova. Parecer `docs/reviews/093-release.md` (novo) gravado inteiro pela ferramenta Write, uma vez só, com `pedido: 093-release-6b-homolog`, `branch: docs/093-release`, `commit:` o sha40 do commit do CHANGELOG, veredito e `## Achados` com linhas de até 300 caracteres; `forge-check docs` sem erro nele; commit só do parecer; push como acima; sem PR. Não rodar `pnpm run pronto` (é do QA).
- arquivos: CHANGELOG.md, docs/reviews/093-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 093-release-6b-homolog até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/093-release-6b-homolog.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono ou do tech-lead se o hook deixar (CLAUDE.md)." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o 6b na homolog (painel Operacional com os bloqueios reais)." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/093-release:docs/reviews/093-release.md` · espera: contém 'pedido: 093-release-6b-homolog'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
