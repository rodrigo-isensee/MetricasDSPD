Agente destino: forge:security-engineer
Pedido: 093-release-6b-homolog
Tipo: codigo
Branch: docs/093-release   Base: develop   Base-sha: c6e5fd8f9025e651fb9113e4ae324bf99f47ab01
Etapa: codigo   Cobre: E1.2

## Objetivo
Parecer de segurança da release 090: a develop em c6e5fd8f (PR 298, lote 6b, e PR 302) contra a homolog, na branch `docs/093-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 56e4e8af, com o CHANGELOG ce704f9b61bb23ae2b1e197d50b71394f4dbf622 e o review aprovado).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/homolog c6e5fd8f9025e651fb9113e4ae324bf99f47ab01 --stat` e o diff dos arquivos de servidor, banco e CI.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/093-release.md` (novo).

## Entregar
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/093-release." (E1.2)
- (E1) (E1.2) Revisão estática do delta (sem rodar nada contra base real nem ler `.env*`): a publicação real de BLOQUEADOS, O1, O2, O5 e O19 não expõe dado de pessoa nem texto livre do motivo de bloqueio na API, na exportação nem na tela, e nenhuma visão vira avaliação individual (o parecer do lote, docs/security/075-l6b-publicacao-real.md, é a base); o patch mesclado é o mesmo do lote revisado. Grave `docs/security/093-release.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 093-release-6b-homolog`, `branch: docs/093-release`, `commit: ce704f9b61bb23ae2b1e197d50b71394f4dbf622`, veredito e `## Achados`; commit só desse arquivo com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/093-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/security/093-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 093-release-6b-homolog até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/093-release-6b-homolog.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono ou do tech-lead se o hook deixar (CLAUDE.md)." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o 6b na homolog (painel Operacional com os bloqueios reais)." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.8 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/093-release:docs/security/093-release.md` · espera: contém 'pedido: 093-release-6b-homolog'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
