Agente destino: forge:security-engineer
Pedido: 090-release-2026-11-11
Tipo: codigo
Branch: docs/090-release   Base: develop   Base-sha: 85394c5b3c04d38028436609d4acd70e90e3f29a
Etapa: codigo   Cobre: E1.3

## Objetivo
Parecer de segurança da release 090: a develop em 85394c5b (PRs 293 a 297) contra a homolog, na branch `docs/090-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`, head 6e819bad, com o CHANGELOG 81e30293048c0448066ca1ebd831074e5c82ddfb e o review aprovado).

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052h diff origin/homolog 85394c5b --stat` e o diff dos arquivos de servidor, banco e CI.
- `/home/rodrigoisensee/MetricasDSPD-052h/docs/reviews/090-release.md` (novo), achado A3.

## Entregar
- "E1.3 (security-engineer): parecer de segurança da release, na branch docs/090-release." (E1.3)
- (E1) (E1.3) Revisão estática do delta (sem rodar nada contra base real nem ler `.env*`): o 089 não expõe dado de pessoa nem texto livre do apontamento na API nem na tela e nenhuma visão vira avaliação individual; o teste do K-261 não lê o `.env` real; o Forge 0.45.5 não afrouxa controle; as 2 vulnerabilidades moderadas que o Dependabot aponta (A3 do review): o que são e se bloqueiam. Grave `docs/security/090-release.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 090-release-2026-11-11`, `branch: docs/090-release`, `commit: 81e30293048c0448066ca1ebd831074e5c82ddfb`, veredito e `## Achados`; commit só desse arquivo com `Cartão: K-213` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052h push origin HEAD:refs/heads/docs/090-release` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/security/090-release.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 090-release-2026-11-11 até 74c4dff7f5ff7c6b2a452e50513f874c9b5e939e9a4dbc648c9394baafa2de7b (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/090-release-2026-11-11.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.2 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/090-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, merge commit com o portão verde; o merge é do dono (K-250)." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.7 (agile-coach): retrospectiva do pedido 090." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052h show origin/docs/090-release:docs/security/090-release.md` · espera: contém 'pedido: 090-release-2026-11-11'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
