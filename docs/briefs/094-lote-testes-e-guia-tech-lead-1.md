Agente destino: forge:tech-lead
Pedido: 094-lote-testes-e-guia
Tipo: codigo
Branch: docs/k265-guia-pronto   Base: develop   Base-sha: 18701297fd058a6cf420c6361c08a264871dfc87
Etapa: codigo   Cobre: E1.1

## Objetivo
K-265: `docs/engineering/guia-do-desenvolvedor.md`, linha 44, diz rodar `pnpm run pronto` antes de cada commit; o `praticas.md` já foi alinhado (K-172, PR 303) à decisão do dono de 2026-10-21. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `docs/k265-guia-pronto` (a partir da develop 18701297fd058a6cf420c6361c08a264871dfc87).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/engineering/guia-do-desenvolvedor.md`, em volta da linha 44.
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/engineering/praticas.md`, seção 9, item "Autores" (o texto já alinhado).

## Entregar
- "E1.1 (tech-lead): K-265, na branch docs/k265-guia-pronto, worktree /home/rodrigoisensee/MetricasDSPD-052c." (E1.1)
- (E1) (E1.1) Trocar só a frase do guia pelo mesmo sentido do `praticas.md` (testes e typecheck do pacote durante o desenvolvimento; `pnpm run pronto` completo uma vez, antes do commit final da branch; commit só de parecer não é o commit final), citando a decisão do dono de 2026-10-21; procurar a mesma regra no resto do guia e alinhar só se disser o mesmo. Rodar `pnpm run docs:check` da raiz da worktree (se faltar dependência, `pnpm install --frozen-lockfile --offline` antes). Commit com `Cartão: K-265` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/docs/k265-guia-pronto` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/engineering/guia-do-desenvolvedor.md

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 094-lote-testes-e-guia até e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (0 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/094-lote-testes-e-guia.md; valem todas, leia-as nas fontes)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: arquivos fora da lista `- arquivos:` (outro arquivo necessário: pare e relate antes), os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): review do K-265." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): PR do K-265; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E2.1 (node-backend): K-266, na branch fix/k266-seed-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E2.2 (tech-lead): review do K-266." · etapa de outra delegação; continua no pedido
- "E2.3 (qa-engineer): QA do K-266." · etapa de outra delegação; continua no pedido
- "E2.4 (tech-lead): PR do K-266; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E3.1 (node-backend): K-267, na branch fix/k267-regex-pessoa, worktree /home/rodrigoisensee/MetricasDSPD-052f." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review do K-267." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA do K-267." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR do K-267; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E4.1 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c log -1 --format=%B origin/docs/k265-guia-pronto` · espera: contém 'Cartão: K-265'
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
