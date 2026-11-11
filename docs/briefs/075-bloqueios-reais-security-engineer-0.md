## Objetivo
Parecer de segurança do lote 6b do pedido 075 (publicação real de BLOQUEADOS, O1, O2, O5 e O19): branch `feature/075-l6b-publicacao-real`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, commit bd76128a (base develop 129fc3d5ba918789e17d3dc1b663039795c4a9e6), em paralelo ao review no mesmo head.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 bd76128a`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/security/075-modelo-ameacas.md`.

## Entregar
- "E1.7 (security-engineer): parecer de segurança por lote com gatilho." (E1.7) Nesta delegação, só o lote 6b.
- (E1) (E1.7) Conferir contra o modelo de ameaças: a publicação real não expõe dado de pessoa (nome, e-mail, ids de usuário, texto livre do motivo de bloqueio) na resposta da API, na exportação nem no stub; nenhuma métrica vira avaliação individual; o papel `dspd_api` segue sem ler coluna de pessoa; nenhum segredo nos testes e fixtures. Gravar `/home/rodrigoisensee/MetricasDSPD-052d/docs/security/075-l6b-publicacao-real.md` (novo) pela ferramenta Write, com `pedido: 075-bloqueios-reais`, `branch: feature/075-l6b-publicacao-real`, `commit:` com o sha40 de bd76128a e o veredito. Sem commit nem push (o tech-lead leva o parecer à branch).
- (E2, E3, E4, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/security/075-l6b-publicacao-real.md

## Pronto quando
- PQ-1 (cmd): `test -s /home/rodrigoisensee/MetricasDSPD-052d/docs/security/075-l6b-publicacao-real.md` · espera: rc=0
