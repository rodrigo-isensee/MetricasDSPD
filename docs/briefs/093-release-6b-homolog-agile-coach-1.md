Agente destino: forge:agile-coach
Pedido: 093-release-6b-homolog
Tipo: codigo
Branch: docs/retros-2026-11-11c   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.8

## Objetivo
Retrospectiva curta do pedido 093 (release do lote 6b: PRs 306, 311, 312 para a develop, 313 para a homolog e 314 para a main, este mesclado pelo dono com bypass por falha de DNS do runner; duas voltas da release por pareceres envelhecidos; validação do 6b delegada pelo dono, decisão "A" de 13:06; a correção do runner seguiu no pedido 095). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/retros-2026-11-11c` (já tem a retrospectiva do 094 em 9906d460, que não deve ser tocada).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/093-release-6b-homolog.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 093.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/devops/093-runner-ubuntu26-dns.md` (o diagnóstico do runner).

## Entregar
- "E1.8 (agile-coach): retrospectiva curta." (E1.8)
- (E1) (E1.8) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052f/docs/retrospectivas/2026-11-11-093-release-6b.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (pareceres da release envelhecidos quando a develop andou, duas voltas; PR 313 mesclado com checks pendentes; portão da homolog vermelho por DNS do runner e merge da main com bypass; validação do 6b sem conferência com dado real, risco aceito pelo dono), retrabalho medido pelas conferências do 093, lead time pelo Histórico (e pelo `gh pr view` quando faltar) e as linhas `MELHORIA:` (uma por linha, com a evidência; o que é do Forge marcado "vai ao Forge"; o que já está em `docs/kanban/melhorias.md` ou tem cartão fica só como dado). Commit só da retrospectiva com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/retros-2026-11-11c` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/retrospectivas/2026-11-11-093-release-6b.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 093-release-6b-homolog até 58d4ab429dd46b6a7ccfc15328415bd4c60cfaa3bc63333007d115d420f7dcd6 (3 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/093-release-6b-homolog.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/093-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono ou do tech-lead se o hook deixar (CLAUDE.md)." · etapa de outra delegação; continua no pedido
- "E1.6 (dono): validar o 6b na homolog (painel Operacional com os bloqueios reais)." · etapa de outra delegação; continua no pedido
- "E1.7 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.9 (devops-engineer): desbloqueio do portão da homolog (reexecução dos jobs com navegador que falharam por DNS no runner; se repetir, diagnóstico e correção do runner em PR próprio)." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/docs/retros-2026-11-11c:docs/retrospectivas/2026-11-11-093-release-6b.md` · espera: contém '093'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
