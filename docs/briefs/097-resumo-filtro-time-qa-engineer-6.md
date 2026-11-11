## Objetivo
Regravação do parecer de QA do K-272 pela ferramenta Write: worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `fix/k272-ap-tipo-categoria`, head 5fd965c5 (o parecer de QA revalidado em 39dabe31 foi gravado com Edit, e a conferência de entrega só reconhece parecer com registro de autoria, que a ferramenta Write grava). O `forge-check pr` marca o parecer de QA como desatualizado porque `.github/actions/playwright/action.yml` veio da develop (PR 318); o patch do item não mudou (`git diff 1d691f4e dbd120a4 -- server/src/modulos/apontamento server/tests/apontamento-rota.test.ts` vazio).

## Ler
- A saída do `forge-check parecer delta` do seu parecer, rodado na worktree.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/097-k272-ap-tipo.md` (o seu parecer em d7702b7b).

## Entregar
- "E6.3 (qa-engineer): QA do K-272." (E6.3) Nesta delegação, a revalidação no head dbd120a4.
- (E6) (E6.3) Conferir que o delta do domínio do QA é só o que veio da base; rodar `server/tests/apontamento-rota.test.ts` com no máximo 2 workers (R-TETO) no head dbd120a4; regravar `docs/qa/097-k272-ap-tipo.md` só pela ferramenta Write (nunca Edit nem Bash; se o Write for recusado, pare e relate a mensagem literal) com `commit: dbd120a49bfbe801f75c829d0eead0e12018d358`, o mesmo veredito se nada mudou, e uma linha dizendo que é revalidação depois do merge da develop. Commit só do parecer com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-ap-tipo-categoria` (`github.com` em allowed_domains; o push leva também o merge da develop); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/097-k272-ap-tipo.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 show origin/fix/k272-ap-tipo-categoria:docs/qa/097-k272-ap-tipo.md` · espera: contém 'commit: dbd120a49bfbe801f75c829d0eead0e12018d358'
