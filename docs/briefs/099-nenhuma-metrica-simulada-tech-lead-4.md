## Objetivo
Revalidação do review do L1 do pedido 099: branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, head local b7d0e684 (código dec8924c; o seu parecer de review saiu em 846267f1 junto com as ADRs 0028 e 0030, o que a regra QA-TESTE-E-PARECER-SEPARADOS recusa; depois entraram as duas análises em a116a9d8 e o merge limpo da develop em b7d0e684). DECISÃO TÉCNICA (Jarvis): as análises e as ADRs ficam nesta branch.

## Ler
- A saída do `forge-check parecer delta` do seu parecer, rodado na worktree, e a do `forge-check pr 099-nenhuma-metrica-simulada --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD --ref fix/099-l1-sem-simulador --base develop`.
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/099-l1-sem-simulador.md` (o seu parecer).

## Entregar
- "E2.3 (tech-lead): review do L1." (E2.3) Nesta delegação, a revalidação no head b7d0e684.
- (E2) (E2.3) Revalidar o review sobre o delta (análises e ADRs; o código não mudou) e regravar `docs/reviews/099-l1-sem-simulador.md` só pela ferramenta Write com `commit: b7d0e684` em sha40 e o veredito, num commit só do parecer com `Cartão: K-275` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito). Sem push e sem PR nesta delegação (o QA revalida em seguida na mesma branch).
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/099-l1-sem-simulador.md, docs/architecture/adr/0028-simulado-por-cartao.md, docs/architecture/adr/0030-sem-simulado-na-web.md, docs/analises/099-varredura-simulado.md, docs/analises/099-dado-real-operacional.md, web/src/app/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B` · espera: contém 'Cartão: K-275'
