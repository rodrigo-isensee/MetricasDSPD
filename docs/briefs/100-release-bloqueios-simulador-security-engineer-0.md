## Objetivo
Parecer de segurança da release 100: a develop em 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047 contra a homolog (PRs 315 a 324). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `docs/100-release` (CHANGELOG fc0f952ab1d746fbd0a4cd1728cf086126a66cfb e review a71366af).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/homolog 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047 --stat` e o diff dos arquivos de código, CI e contrato.
- Os pareceres de segurança dos PRs do range que tiveram gatilho (por exemplo `docs/security/095-runner-ubuntu-2404.md` e `docs/security/096-criterios-apontamento-env.md`), lidos na worktree.

## Entregar
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." (E1.2)
- (E1) (E1.2) Revisão estática da release (sem rodar nada contra base real nem ler `.env*`): o container do Playwright fixado por digest e as permissões dos workflows; o passo de critérios do apontamento lendo o `.env` sem imprimir nada dele; a remoção do simulador (nenhum dado inventado na web de uso diário, modo homologação com a sua guarda); o contrato do 9b; nenhum dado de pessoa novo exposto; nenhuma dependência nova sem revisão. Parecer `docs/security/100-release.md` (novo) gravado inteiro pela ferramenta Write, uma vez só, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release`, `commit: fc0f952ab1d746fbd0a4cd1728cf086126a66cfb`, veredito e `## Achados` com linhas de até 300 caracteres; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/security/100-release.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release:docs/security/100-release.md` · espera: contém 'branch: docs/100-release'
