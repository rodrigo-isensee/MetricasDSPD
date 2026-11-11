Agente destino: forge:security-engineer
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/100-release   Base: develop   Base-sha: 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047
Etapa: codigo   Cobre: E1.2

## Objetivo
Parecer de segurança da release 100: a develop em 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047 contra a homolog (PRs 315 a 324). Worktree `/home/rodrigoisensee/MetricasDSPD-052h`, branch `docs/100-release` (CHANGELOG fc0f952ab1d746fbd0a4cd1728cf086126a66cfb e review a71366af).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/homolog 77c208a9e5c6db5f7bbfb1dfe3bcdc9c79f82047 --stat` e o diff dos arquivos de código, CI e contrato.
- Os pareceres de segurança dos PRs do range que tiveram gatilho (por exemplo `docs/security/095-runner-ubuntu-2404.md` e `docs/security/096-criterios-apontamento-env.md`), lidos na worktree.

## Entregar
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." (E1.2)
- (E1) (E1.2) Revisão estática da release (sem rodar nada contra base real nem ler `.env*`): o container do Playwright fixado por digest e as permissões dos workflows; o passo de critérios do apontamento lendo o `.env` sem imprimir nada dele; a remoção do simulador (nenhum dado inventado na web de uso diário, modo homologação com a sua guarda); o contrato do 9b; nenhum dado de pessoa novo exposto; nenhuma dependência nova sem revisão. Parecer `docs/security/100-release.md` (novo) gravado inteiro pela ferramenta Write, uma vez só, com `pedido: 100-release-bloqueios-simulador`, `branch: docs/100-release`, `commit: fc0f952ab1d746fbd0a4cd1728cf086126a66cfb`, veredito e `## Achados` com linhas de até 300 caracteres; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/100-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/security/100-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 100-release-bloqueios-simulador até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/100-release-bloqueios-simulador.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva curta. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/100-release:docs/security/100-release.md` · espera: contém 'branch: docs/100-release'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
