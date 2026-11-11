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

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c log -1 --format=%B origin/docs/k265-guia-pronto` · espera: contém 'Cartão: K-265'
