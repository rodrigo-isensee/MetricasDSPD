Agente destino: forge:tech-lead
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/100-release   Base: develop   Base-sha: 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047
Etapa: codigo   Cobre: E1.1

## Objetivo
Release 100: a develop em 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047 (CI verde no run 43084376256) vai à homolog, e o PR de release homolog para main fica aberto para o dono. Primeiro degrau: CHANGELOG e review na branch `docs/100-release`, worktree `/home/rodrigoisensee/MetricasDSPD-052h` (hoje destacada na develop, sem mudança).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/engineering/fluxo-homologacao.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-052h log --oneline origin/homolog..77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047`.

## Entregar
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." (E1.1)
- (E1) (E1.1) Criar a branch: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052h status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052h fetch origin`; `git -C /home/rodrigoisensee/MetricasDSPD-052h switch --no-track -c docs/100-release 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047`; conferir `branch --show-current` = `docs/100-release` (se não, pare e relate). Escrever no `CHANGELOG.md` as notas dos PRs que estão na develop e não na homolog (316 a 324), no formato das entradas anteriores; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, revisar a release: cada PR tem review aprovado; registrar quais entraram com checks ainda rodando (321, 322, 323, 324) e confirmar que a develop no 77c208a9 está verde (run 43084376256); o contrato do 9b (aceite de uso único) e a ADR 0030 coerentes; migrações novas, se houver. Parecer `docs/reviews/100-release.md` (novo) gravado inteiro pela ferramenta Write, uma vez só, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release`, `commit:` o sha40 do commit do CHANGELOG, veredito e `## Achados` com linhas de até 300 caracteres; commit só do parecer; push como acima; sem PR. Não rodar `pnpm run pronto` (é do QA).
- arquivos: CHANGELOG.md, docs/reviews/100-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 100-release-bloqueios-simulador até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/100-release-bloqueios-simulador.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release:docs/reviews/100-release.md` · espera: contém 'branch: docs/100-release'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
