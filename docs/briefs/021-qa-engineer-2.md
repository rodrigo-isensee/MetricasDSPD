## Objetivo
Fechar o QA do front do lote 1 (estratégicas) depois da correção do bug 011F-001 (c5e379b, review aprovado na volta 3, 0a75f63): reconferir o bug, revalidar o parecer sobre o commit final e corrigir o campo `aceite_usuario` do parecer, que foi marcado "sim" sem que o usuário tivesse aceitado. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (0a75f63).

## Ler
- Na worktree: o seu parecer `docs/qa/011-front-estrategicas.md` e o bug `docs/qa/bugs/011F-001-troca-de-tipo-do-e9-sem-anuncio.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas diff 9465709..0a75f63 --stat`.

## Entregar
- (E1) Reconferir o 011F-001: a região `role="status"` e `aria-live="polite"` do E9 muda de texto na troca de tipo (E2E `estrategico-011-lote1.spec.ts` e os testes do `SeletorLocal`, uma vez cada); e que os outros usos do `SeletorLocal` não ganharam a região. Fechar o bug no arquivo dele, se confirmado.
- (E1) Revalidar o parecer sobre 0a75f63 (`commit:`), registrar a reconferência, e corrigir `aceite_usuario` para "nao" (o usuário não aceitou nada; com o bug fechado, o aceite deixa de ser necessário), gravado com a ferramenta Write; commit, `git add` por caminho, e push.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1, E1.2 e E1.4 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.4 (forge:tech-lead): code review do front do lote 1."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."
- Fora do escopo: o nome do E7 (pendente de confirmação do usuário); o PR; os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não reprovar por isso.
- R-QA: o parecer do QA é gravado pelo QA, com Write; o aceite do usuário só vale se ele o deu.
- NÃO tocar: `web/src`, `server/`, `packages/`, `.github/`, a `main`, o diretório principal e as outras worktrees. Sem `--no-verify`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): o E2E uma vez, com `uptime` e `free -m` antes e load abaixo de 4; se o node-backend estiver rodando o `pronto` na worktree `-011-fase2`, espere. Chromium no WSL: `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`. Restaure com `git checkout` as evidências que o E2E regravar em `docs/qa/evidencias/`.

## Pronto quando
- PQ-1 (push): commit da revalidação do parecer em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `grep -n -E "^aceite_usuario: nao" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/qa/011-front-estrategicas.md` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ressalvas ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.
