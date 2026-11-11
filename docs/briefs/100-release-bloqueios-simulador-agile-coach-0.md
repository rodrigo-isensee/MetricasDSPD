Agente destino: forge:agile-coach
Pedido: 100-release-bloqueios-simulador
Tipo: codigo
Branch: docs/retros-2026-11-11c   Base: develop   Base-sha: eac38a64b0b580d7c920f4b2b501287f7fb56599
Etapa: codigo   Cobre: E1.7

## Objetivo
Retrospectiva curta do pedido 100 (release da develop para a main: bloqueios 9a e 9b, simulador desligado, K-272, K-270, CI). A release está na homolog (PR 328, portão verde) e o PR 332 da homolog para a main está aberto para o dono. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `docs/retros-2026-11-11c` (já tem retrospectivas de outros pedidos, que não devem ser tocadas).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/100-release-bloqueios-simulador.md` (inteiro).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md`: só as linhas do 100.

## Entregar
- "E1.7 (agile-coach): retrospectiva curta." (E1.7)
- (E1) (E1.7) Escrever pela ferramenta Write `/home/rodrigoisensee/MetricasDSPD-052f/docs/retrospectivas/2026-11-11-100-release-bloqueios-simulador.md` (novo), no formato das retrospectivas da pasta: o que correu bem, o que travou (merge do PR 325 durante a release e a volta da release com os pareceres revalidados; fila do GitHub Actions entupida, com 15 execuções presas que o GitHub não deixa cancelar e a decisão do dono de deixar como estão; laço de espera da skill e gh pr merge por número recusados pelos hooks; PR atrás da develop na hora do merge), retrabalho pelas conferências, lead time pelo Histórico e as linhas `MELHORIA:` (uma por linha, com evidência; o que é do Forge marcado "vai ao Forge"; o que já está em `docs/kanban/melhorias.md` fica só como dado). Commit só da retrospectiva com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/docs/retros-2026-11-11c` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: docs/retrospectivas/2026-11-11-100-release-bloqueios-simulador.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 100-release-bloqueios-simulador até ee6ad176f90986e330fd15f348a79ad23b96804ef0e793331d8d5eb63930c237 (1 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/100-release-bloqueios-simulador.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0030
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): CHANGELOG da release e review (develop contra homolog), parecer na branch docs/100-release, worktree /home/rodrigoisensee/MetricasDSPD-052h." · etapa de outra delegação; continua no pedido
- "E1.2 (security-engineer): parecer de segurança da release, na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA da release (suítes na ponta da develop), parecer na branch docs/100-release." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR da docs/100-release para a develop, CI verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR da develop para a homolog, portão verde; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR de release da homolog para a main, aberto; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.8 (devops-engineer): parecer de devops da release (a release muda os workflows e a ação do Playwright), na branch docs/100-release-b." · etapa de outra delegação; continua no pedido
- "E1.9 (devops-engineer): limpar a fila do GitHub Actions, cancelando só as execuções em fila já substituídas por outra mais nova da mesma branch ou de branch já mesclada, para o CI da release andar. - Cada portão (QA, segurança, review) commita e envia o próprio parecer na branch." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f log -1 --format=%B origin/docs/retros-2026-11-11c` · espera: contém 'Cartão: K-204'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
